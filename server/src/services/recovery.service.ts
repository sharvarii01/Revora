import { recoveryRepository } from '../repositories/recovery.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { recoveryQueue } from '../queue/recoveryQueue';
import { CreateRecoveryDto, RecoveryDetailResponse } from '../types/recovery.types';
import { NotFoundError } from '../utils/errors';
import { FAILURE_CODE_CATALOG } from '../constants/npciRules';

export class RecoveryService {
  async listRecoveries(
    merchantId: string,
    limit = 50,
    offset = 0,
    status?: string,
    type?: string,
    search?: string
  ): Promise<{ data: RecoveryDetailResponse[]; total: number }> {
    const { data, total } = await recoveryRepository.list(
      merchantId,
      limit,
      offset,
      status,
      type,
      search
    );

    const formatted: RecoveryDetailResponse[] = data.map((rec: any) =>
      this.formatRecoveryRecord(rec)
    );

    return { data: formatted, total };
  }

  async getRecoveryById(id: string, merchantId: string): Promise<RecoveryDetailResponse> {
    const rec = await recoveryRepository.findById(id, merchantId);
    if (!rec) throw new NotFoundError('Recovery session not found.');
    return this.formatRecoveryRecord(rec);
  }

  async initiateRecovery(data: CreateRecoveryDto) {
    const failureMeta = data.failureCode ? FAILURE_CODE_CATALOG[data.failureCode] : undefined;

    const session = await recoveryRepository.create({
      merchantId: data.merchantId,
      customerId: data.customerId,
      type: data.type,
      subscriptionId: data.subscriptionId,
      cartId: data.cartId,
      planOrItemName: data.planOrItemName || 'Plan Renewal',
      originalAmount: data.amount,
      failureCode: data.failureCode,
      failureCategory: failureMeta?.category || 'TRANSIENT',
      failureDescription: data.failureDescription || failureMeta?.description,
      status: 'ANALYZING_AI',
      npciAttemptCount: 0,
      maxNpciAttempts: 3,
    });

    // Enqueue for background AI analysis and NPCI evaluation
    await recoveryQueue.add('evaluate-recovery-session', {
      recoverySessionId: session.id,
      merchantId: data.merchantId,
      eventType: 'payment.failed',
      failureCode: data.failureCode,
      failureDescription: data.failureDescription,
    });

    // Log Audit Event
    await auditLogRepository.create({
      merchantId: data.merchantId,
      eventType: 'PAYMENT_FAILED',
      entityType: 'RECOVERY_SESSION',
      entityId: session.id,
      title: 'Payment Failure Ingested',
      description: `Failure code ${data.failureCode || 'N/A'} registered for ₹${data.amount}. AI analysis initiated.`,
      customerName: 'Customer',
      amount: data.amount,
      status: 'INFO',
      complianceTag: 'NPCI_INGESTION',
    });

    return session;
  }

  async stopRecovery(id: string, merchantId: string, reason = 'MERCHANT_MANUAL_CANCELLATION', notes?: string) {
    const session = await recoveryRepository.findById(id, merchantId);
    if (!session) throw new NotFoundError('Recovery session not found.');

    const updated = await recoveryRepository.update(id, {
      status: 'STOP_MANUAL_CANCELLED',
      stopReason: `${reason}${notes ? ` - ${notes}` : ''}`,
    });

    await auditLogRepository.create({
      merchantId,
      eventType: 'RECOVERY_CLOSED',
      entityType: 'RECOVERY_SESSION',
      entityId: session.id,
      title: 'Recovery Halted Manually',
      description: `Merchant cancelled automated recovery session. Reason: ${reason}`,
      customerName: session.customer.name,
      amount: session.originalAmount,
      status: 'WARNING',
      complianceTag: 'MERCHANT_OVERRIDE',
    });

    return updated;
  }

  private formatRecoveryRecord(rec: any): RecoveryDetailResponse {
    const ai = rec.aiDecisions?.[0];
    const failureMeta = rec.failureCode ? FAILURE_CODE_CATALOG[rec.failureCode] : undefined;

    let cooldownHours = 0;
    if (rec.nextScheduledRetry) {
      const msDiff = new Date(rec.nextScheduledRetry).getTime() - Date.now();
      cooldownHours = Math.max(0, parseFloat((msDiff / (3600 * 1000)).toFixed(1)));
    }

    return {
      id: rec.id,
      customerId: rec.customer.id,
      customerName: rec.customer.name,
      customerEmail: rec.customer.email,
      customerPhone: rec.customer.phone,
      type: rec.type,
      planOrItemName: rec.planOrItemName,
      amount: rec.originalAmount,
      recoveredAmount: rec.recoveredAmount,
      appliedDiscountPct: rec.appliedDiscountPct,
      status: rec.status,
      failureCode: rec.failureCode,
      failureReason: failureMeta?.name || rec.failureDescription || 'Payment Failed',
      failureCategory: rec.failureCategory || failureMeta?.category || 'TRANSIENT',
      currentAttempt: rec.npciAttemptCount || 1,
      maxAttempts: rec.maxNpciAttempts || 3,
      nextRetryTime: rec.nextScheduledRetry ? rec.nextScheduledRetry.toISOString() : null,
      cooldownHoursRemaining: cooldownHours,
      stopReason: rec.stopReason,
      paymentLinkUrl: rec.paymentLinkUrl,
      aiDecision: {
        model: ai?.modelName || 'gemini-2.5-flash',
        action: ai?.actionRecommended || 'SCHEDULE_RETRY',
        recoveryScore: ai?.recoveryScore ?? 88,
        riskScore: ai?.riskScore ?? 12,
        confidence: ai?.confidence ?? 0.94,
        optimalRetryTime: ai?.optimalRetryTime ? ai.optimalRetryTime.toISOString() : null,
        appliedOfferPct: ai?.appliedOfferPct ?? null,
        headline: ai?.headline || 'Intelligent AutoPay Retry Scheduled',
        rationale: ai?.rationale || 'Cooldown enforced in accordance with NPCI OC-136.',
        complianceRule: ai?.complianceRule || 'NPCI_OC136_24H_COOLDOWN_RULE',
        customerMessagePreview: ai?.customerMessagePreview || '',
      },
      retryTimeline: (rec.retryAttempts || []).map((ra: any) => ({
        id: ra.id,
        attemptNumber: ra.attemptNumber,
        scheduledFor: ra.scheduledFor.toISOString(),
        executedAt: ra.executedAt ? ra.executedAt.toISOString() : null,
        status: ra.status,
        errorCode: ra.errorCode,
        errorDescription: ra.errorDescription,
        cooldownHoursMet: ra.cooldownHoursMet,
      })),
      notificationHistory: (rec.notificationLogs || []).map((nl: any) => ({
        id: nl.id,
        channel: nl.channel,
        recipient: nl.recipient,
        messageBody: nl.messageBody,
        ctaUrl: nl.ctaUrl,
        status: nl.status,
        timestamp: nl.createdAt.toISOString(),
      })),
      createdAt: rec.createdAt.toISOString(),
      updatedAt: rec.updatedAt.toISOString(),
    };
  }
}

export const recoveryService = new RecoveryService();
