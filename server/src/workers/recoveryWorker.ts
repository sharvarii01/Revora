import { recoveryQueue, RecoveryJobData } from '../queue/recoveryQueue';
import { retryQueue } from '../queue/retryQueue';
import { notificationQueue } from '../queue/notificationQueue';
import { recoveryRepository } from '../repositories/recovery.repository';
import { retryAttemptRepository } from '../repositories/retryAttempt.repository';
import { aiDecisionRepository } from '../repositories/aiDecision.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { aiDecisionEngine } from '../ai/aiDecisionEngine';
import { paymentLinkService } from '../services/paymentLink.service';
import logger from '../logs/logger';

export function initRecoveryWorker() {
  recoveryQueue.setProcessor(async (job) => {
    const { recoverySessionId, merchantId, eventType, failureCode, failureDescription } = job.data as RecoveryJobData;
    logger.info({ recoverySessionId }, '🧠 Processing recovery session AI evaluation...');

    const session = await recoveryRepository.findById(recoverySessionId);
    if (!session) {
      logger.error({ recoverySessionId }, '❌ Recovery session not found for worker evaluation.');
      return;
    }

    // Build Context Vector
    const context = {
      eventType,
      failureCode,
      failureDescription,
      customerProfile: {
        id: session.customer.id,
        name: session.customer.name,
        riskScore: session.customer.riskScore,
        healthScore: session.customer.healthScore,
        lifetimeRecovered: session.customer.lifetimeRecovered,
        optedOut: session.customer.optedOut,
      },
      transactionDetails: {
        amount: session.originalAmount,
        type: session.type,
        planOrItemName: session.planOrItemName,
        currentAttempt: session.npciAttemptCount,
        maxAttempts: session.maxNpciAttempts,
        lastAttemptTime: session.updatedAt,
        mandateDueDate: session.subscription?.nextDueDate,
      },
      merchantPolicy: {
        maxDiscountPct: session.merchant.maxDiscountPct,
        autoRecoveryEnabled: session.merchant.autoRecoveryEnabled,
      },
    };

    // AI Evaluation (Gemini or Heuristic Fallback)
    const { decision, modelUsed, rawPrompt, rawOutput } = await aiDecisionEngine.evaluate(context);

    // Save AI Decision
    await aiDecisionRepository.create({
      recoverySessionId: session.id,
      modelName: modelUsed,
      actionRecommended: decision.action,
      recoveryScore: decision.recoveryScore,
      riskScore: decision.riskScore,
      confidence: decision.confidence,
      optimalRetryTime: decision.recommendedTimestamp || undefined,
      appliedOfferPct: decision.offerAppliedPct || undefined,
      headline: decision.headline,
      rationale: decision.rationale,
      complianceRule: decision.complianceRule,
      customerMessagePreview: decision.customerMessagePreview,
      fullPromptPayload: rawPrompt,
      fullModelOutput: rawOutput,
    });

    // Generate fallback/instant Payment Link
    const paymentLink = await paymentLinkService.createPaymentLink({
      merchantId,
      customerId: session.customer.id,
      customerName: session.customer.name,
      customerEmail: session.customer.email,
      customerPhone: session.customer.phone,
      amount: session.originalAmount,
      discountPct: decision.offerAppliedPct || 0,
      description: `Recovery for ${session.planOrItemName}`,
    });

    // Handle Stop States
    if (decision.action.startsWith('STOP_STATE')) {
      const stopStatus = decision.action === 'STOP_STATE_TERMINAL_FAILURE'
        ? 'STOP_TERMINAL_FAILURE'
        : 'STOP_NPCI_LIMIT_REACHED';

      await recoveryRepository.update(session.id, {
        status: stopStatus,
        stopReason: decision.headline,
        razorpayPaymentLinkId: paymentLink.paymentLinkId,
        paymentLinkUrl: paymentLink.shortUrl,
        appliedDiscountPct: decision.offerAppliedPct || 0,
      });

      await auditLogRepository.create({
        merchantId,
        eventType: 'RECOVERY_CLOSED',
        entityType: 'RECOVERY_SESSION',
        entityId: session.id,
        title: decision.headline,
        description: decision.rationale,
        customerName: session.customer.name,
        amount: session.originalAmount,
        status: 'WARNING',
        complianceTag: 'NPCI_CAP_ENFORCED',
      });

      // Dispatch polite fallback payment link
      await notificationQueue.add('send-stop-state-link', {
        recoverySessionId: session.id,
        channel: 'WHATSAPP',
        recipient: session.customer.phone,
        messageBody: decision.customerMessagePreview,
        ctaUrl: paymentLink.shortUrl,
      });

      return;
    }

    // Handle Scheduled Retries
    const nextRetryTime = decision.recommendedTimestamp || new Date(Date.now() + 25 * 3600 * 1000);
    const delayMs = Math.max(0, nextRetryTime.getTime() - Date.now());

    await recoveryRepository.update(session.id, {
      status: 'SCHEDULED_RETRY',
      nextScheduledRetry: nextRetryTime,
      razorpayPaymentLinkId: paymentLink.paymentLinkId,
      paymentLinkUrl: paymentLink.shortUrl,
      appliedDiscountPct: decision.offerAppliedPct || 0,
    });

    // Create Retry Attempt Record (scheduled)
    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: session.npciAttemptCount + 1,
      scheduledFor: nextRetryTime,
      status: 'scheduled',
      cooldownHoursMet: 24.5,
    });

    // Enqueue delayed presentation
    if (session.subscription?.mandate) {
      await retryQueue.add(
        'execute-autopay-presentation',
        {
          recoverySessionId: session.id,
          merchantId,
          subscriptionId: session.subscription.id,
          attemptNumber: session.npciAttemptCount + 1,
          razorpayMandateId: session.subscription.mandate.razorpayMandateId,
          amount: session.originalAmount,
        },
        { delay: delayMs }
      );
    }

    // Dispatch Courtesy WhatsApp Notification
    await notificationQueue.add('send-scheduled-courtesy', {
      recoverySessionId: session.id,
      channel: 'WHATSAPP',
      recipient: session.customer.phone,
      messageBody: decision.customerMessagePreview,
      ctaUrl: paymentLink.shortUrl,
    });

    // Audit Log
    await auditLogRepository.create({
      merchantId,
      eventType: 'AI_DECISION_RECORDED',
      entityType: 'RECOVERY_SESSION',
      entityId: session.id,
      title: decision.headline,
      description: decision.rationale,
      customerName: session.customer.name,
      amount: session.originalAmount,
      status: 'SUCCESS',
      complianceTag: decision.complianceRule,
    });
  });
}
