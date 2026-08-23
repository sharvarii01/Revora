import { recoveryRepository } from '../repositories/recovery.repository';
import { customerRepository } from '../repositories/customer.repository';
import { retryAttemptRepository } from '../repositories/retryAttempt.repository';
import { aiDecisionRepository } from '../repositories/aiDecision.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { paymentLinkService } from '../services/paymentLink.service';
import logger from '../logs/logger';
import { v4 as uuidv4 } from 'uuid';

export class SimulatorService {
  async triggerScenario(params: {
    merchantId: string;
    scenario: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    amount?: number;
    attemptNumber?: number;
    recoveryId?: string;
  }) {
    const { merchantId, scenario } = params;
    logger.info({ scenario }, '⚡ Triggering Simulator Scenario...');

    switch (scenario) {
      case 'AUTOPAY_INSUFFICIENT_FUNDS_U30':
        return this.simulateU30(merchantId, params);

      case 'AUTOPAY_NPCI_LIMIT_BREACH':
        return this.simulateNpciLimitBreach(merchantId, params);

      case 'AUTOPAY_TERMINAL_VPA_REVOKED_ZG':
        return this.simulateTerminalZg(merchantId, params);

      case 'CHECKOUT_ABANDONED_TIER1':
      case 'CHECKOUT_ABANDONED_DYNAMIC_DISCOUNT':
        return this.simulateCartDropoff(merchantId, params);

      case 'SIMULATE_CUSTOMER_PAYMENT':
        return this.simulateCustomerPayment(merchantId, params);

      default:
        throw new Error(`Unsupported simulator scenario: ${scenario}`);
    }
  }

  private async simulateU30(merchantId: string, params: any) {
    const name = params.customerName || 'Saurabh Malhotra';
    const email = params.customerEmail || 'saurabh.m@induscapital.in';
    const phone = params.customerPhone || '+91 99301 22448';
    const amount = params.amount || 6499;

    let customer = await customerRepository.findByEmailOrPhone(merchantId, email, phone);
    if (!customer) {
      customer = await customerRepository.create({
        merchantId,
        name,
        email,
        phone,
        vpa: 'saurabh@okhdfcbank',
      });
    }

    const nextRetry = new Date(Date.now() + 25 * 3600 * 1000);
    const link = await paymentLinkService.createPaymentLink({
      merchantId,
      customerId: customer.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      amount,
      description: 'Executive SaaS Suite Renewal',
    });

    const session = await recoveryRepository.create({
      merchantId,
      customerId: customer.id,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Executive SaaS Suite',
      originalAmount: amount,
      failureCode: 'U30',
      failureCategory: 'TRANSIENT',
      failureDescription: 'Debit failed due to low account balance',
      status: 'SCHEDULED_RETRY',
      npciAttemptCount: 1,
      maxNpciAttempts: 3,
      nextScheduledRetry: nextRetry,
      cooldownHoursRemaining: 24.0,
      razorpayPaymentLinkId: link.paymentLinkId,
      paymentLinkUrl: link.shortUrl,
    });

    await aiDecisionRepository.create({
      recoverySessionId: session.id,
      modelName: 'gemini-2.5-flash',
      actionRecommended: 'SCHEDULE_RETRY_WITH_NOTIF',
      recoveryScore: 89,
      riskScore: 11,
      confidence: 0.95,
      optimalRetryTime: nextRetry,
      headline: 'U30 Transient Balance Issue - Scheduled for Morning Clearing',
      rationale: 'Customer debit failed due to temporary liquidity (U30). NPCI 24h cooldown applied. Scheduled next presentation for 09:15 AM tomorrow with polite WhatsApp notification.',
      complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
      customerMessagePreview: `Hi ${name}, renewal of ₹${amount} failed. We will retry tomorrow at 9:15 AM. Pay now: ${link.shortUrl}`,
    });

    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: 1,
      scheduledFor: new Date(),
      executedAt: new Date(),
      status: 'failed',
      errorCode: 'U30',
      errorDescription: 'Debit failed due to low account balance',
      cooldownHoursMet: 0,
    });

    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: 2,
      scheduledFor: nextRetry,
      status: 'scheduled',
      cooldownHoursMet: 25.0,
    });

    await notificationRepository.create({
      recoverySessionId: session.id,
      channel: 'WHATSAPP',
      recipient: phone,
      messageBody: `Hi ${name}, renewal of ₹${amount} failed. Retry scheduled for tomorrow 9:15 AM.`,
      status: 'DELIVERED',
      ctaUrl: link.shortUrl,
    });

    await auditLogRepository.create({
      merchantId,
      eventType: 'AI_DECISION_RECORDED',
      entityType: 'RECOVERY_SESSION',
      entityId: session.id,
      title: 'AutoPay Scheduled (U30 Low Balance)',
      description: `AI analyzed code U30 for ${name}. Scheduled Attempt 2 with 24h cooldown.`,
      customerName: name,
      amount,
      status: 'WARNING',
      complianceTag: 'NPCI_OC136_COMPLIANT',
    });

    return session;
  }

  private async simulateNpciLimitBreach(merchantId: string, params: any) {
    const name = params.customerName || 'Kavita Singhania';
    const email = params.customerEmail || 'kavita.s@singhania.co';
    const phone = params.customerPhone || '+91 98450 66778';
    const amount = params.amount || 8999;

    let customer = await customerRepository.findByEmailOrPhone(merchantId, email, phone);
    if (!customer) {
      customer = await customerRepository.create({
        merchantId,
        name,
        email,
        phone,
        vpa: 'kavita@icici',
      });
    }

    const link = await paymentLinkService.createPaymentLink({
      merchantId,
      customerId: customer.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      amount,
      description: 'Enterprise Cloud Server Renewal',
    });

    const session = await recoveryRepository.create({
      merchantId,
      customerId: customer.id,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Enterprise Cloud Server',
      originalAmount: amount,
      failureCode: 'U30',
      failureCategory: 'TRANSIENT',
      failureDescription: 'Insufficient Balance (Attempt 3 Failed)',
      status: 'STOP_NPCI_LIMIT_REACHED',
      npciAttemptCount: 3,
      maxNpciAttempts: 3,
      stopReason: 'NPCI Maximum Presentation Limit (3/3) Reached for Current Cycle',
      razorpayPaymentLinkId: link.paymentLinkId,
      paymentLinkUrl: link.shortUrl,
    });

    await aiDecisionRepository.create({
      recoverySessionId: session.id,
      modelName: 'gemini-2.5-flash',
      actionRecommended: 'HALT_AUTOPAY_PREVENT_PENALTY',
      recoveryScore: 35,
      riskScore: 72,
      confidence: 0.99,
      headline: 'Autonomous Stop State Triggered - Zero Violation Guard',
      rationale: 'Mandate has consumed 3 attempts. Attempting a 4th presentation violates NPCI UPI AutoPay Circular OC-136. AutoPay halted to protect merchant from sponsor bank penalty. Instant Payment Link dispatched.',
      complianceRule: 'NPCI_OC136_MAX_3_ATTEMPTS_HARD_CAP',
      customerMessagePreview: `Hi ${name}, recurring debits paused following bank guidelines. Settle invoice manually: ${link.shortUrl}`,
    });

    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: 1,
      scheduledFor: new Date(Date.now() - 72 * 3600 * 1000),
      executedAt: new Date(Date.now() - 72 * 3600 * 1000),
      status: 'failed',
      errorCode: 'U30',
      cooldownHoursMet: 0,
    });

    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: 2,
      scheduledFor: new Date(Date.now() - 48 * 3600 * 1000),
      executedAt: new Date(Date.now() - 48 * 3600 * 1000),
      status: 'failed',
      errorCode: 'U30',
      cooldownHoursMet: 24.0,
    });

    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: 3,
      scheduledFor: new Date(),
      executedAt: new Date(),
      status: 'failed',
      errorCode: 'U30',
      cooldownHoursMet: 24.1,
    });

    await auditLogRepository.create({
      merchantId,
      eventType: 'RECOVERY_CLOSED',
      entityType: 'RECOVERY_SESSION',
      entityId: session.id,
      title: 'Stop State: NPCI 3-Attempt Cap Reached',
      description: `AutoPay presentation halted for ${name} to ensure 100% regulatory compliance.`,
      customerName: name,
      amount,
      status: 'WARNING',
      complianceTag: 'NPCI_CAP_ENFORCED',
    });

    return session;
  }

  private async simulateTerminalZg(merchantId: string, params: any) {
    const name = params.customerName || 'Rajesh Gokhale';
    const email = params.customerEmail || 'rajesh.g@gokhale.in';
    const phone = params.customerPhone || '+91 97654 33211';
    const amount = params.amount || 1999;

    let customer = await customerRepository.findByEmailOrPhone(merchantId, email, phone);
    if (!customer) {
      customer = await customerRepository.create({
        merchantId,
        name,
        email,
        phone,
        vpa: 'rajesh@paytm',
      });
    }

    const session = await recoveryRepository.create({
      merchantId,
      customerId: customer.id,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Security Shield Plus',
      originalAmount: amount,
      failureCode: 'ZG',
      failureCategory: 'TERMINAL',
      failureDescription: 'Virtual Payment Address Revoked / Blocked by PSP',
      status: 'STOP_TERMINAL_FAILURE',
      npciAttemptCount: 1,
      maxNpciAttempts: 0,
      stopReason: 'Terminal Failure: Customer Virtual Payment Address (VPA) is permanently deactivated',
    });

    await aiDecisionRepository.create({
      recoverySessionId: session.id,
      modelName: 'gemini-2.5-flash',
      actionRecommended: 'IMMEDIATE_TERMINAL_HALT',
      recoveryScore: 5,
      riskScore: 95,
      confidence: 0.99,
      headline: 'Hard Stop: Terminal Error Code (ZG)',
      rationale: 'Customer VPA is deactivated. System halted automated retry queue instantly to avoid bank bounce penalties and protect merchant score.',
      complianceRule: 'NPCI_TERMINAL_ERROR_IMMEDIATE_STOP',
      customerMessagePreview: `Hi ${name}, your UPI VPA appears inactive. Please update your payment method.`,
    });

    await retryAttemptRepository.create({
      recoverySessionId: session.id,
      attemptNumber: 1,
      scheduledFor: new Date(),
      executedAt: new Date(),
      status: 'failed',
      errorCode: 'ZG',
      cooldownHoursMet: 0,
    });

    await auditLogRepository.create({
      merchantId,
      eventType: 'RECOVERY_CLOSED',
      entityType: 'RECOVERY_SESSION',
      entityId: session.id,
      title: 'Hard Stop: Terminal Code ZG (VPA Revoked)',
      description: `Instant zero-retry halt enforced for ${name}. Avoided bank bounce penalty.`,
      customerName: name,
      amount,
      status: 'DANGER',
      complianceTag: 'NPCI_TERMINAL_CODE_STOP',
    });

    return session;
  }

  private async simulateCartDropoff(merchantId: string, params: any) {
    const name = params.customerName || 'Neha Kapoor';
    const email = params.customerEmail || 'neha.kapoor@gmail.com';
    const phone = params.customerPhone || '+91 98112 44556';
    const amount = params.amount || 4500;

    let customer = await customerRepository.findByEmailOrPhone(merchantId, email, phone);
    if (!customer) {
      customer = await customerRepository.create({
        merchantId,
        name,
        email,
        phone,
      });
    }

    const link = await paymentLinkService.createPaymentLink({
      merchantId,
      customerId: customer.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      amount,
      discountPct: 5,
      description: 'Premium Ergonomic Setup (2 Items)',
    });

    const session = await recoveryRepository.create({
      merchantId,
      customerId: customer.id,
      type: 'CHECKOUT_ABANDONMENT',
      planOrItemName: 'Premium Ergonomic Setup (2 Items)',
      originalAmount: amount,
      appliedDiscountPct: 5,
      status: 'PAYMENT_LINK_SENT',
      npciAttemptCount: 1,
      maxNpciAttempts: 3,
      razorpayPaymentLinkId: link.paymentLinkId,
      paymentLinkUrl: link.shortUrl,
    });

    await aiDecisionRepository.create({
      recoverySessionId: session.id,
      modelName: 'gemini-2.5-flash',
      actionRecommended: 'APPLY_DYNAMIC_5PCT_INCENTIVE',
      recoveryScore: 84,
      riskScore: 12,
      confidence: 0.93,
      headline: 'Stage-2 Dynamic 5% Incentive Generated',
      rationale: 'Cart drop-off detected. AI dispatched personalized Razorpay link with 5% discount within merchant margin limit.',
      complianceRule: 'MERCHANT_MARGIN_FLOOR_POLICY',
      customerMessagePreview: `Hi ${name}, complete your setup with an exclusive 5% discount: ${link.shortUrl}`,
    });

    await notificationRepository.create({
      recoverySessionId: session.id,
      channel: 'WHATSAPP',
      recipient: phone,
      messageBody: `Hi ${name}, complete your setup with 5% off: ${link.shortUrl}`,
      status: 'DELIVERED',
      ctaUrl: link.shortUrl,
    });

    return session;
  }

  private async simulateCustomerPayment(merchantId: string, params: any) {
    const recoveries = await recoveryRepository.list(merchantId, 1, 0, 'ACTIVE');
    const targetSession = params.recoveryId
      ? await recoveryRepository.findById(params.recoveryId, merchantId)
      : recoveries.data[0];

    if (!targetSession) {
      return { message: 'No active recovery session found to settle.' };
    }

    const recoveredAmount = targetSession.originalAmount * (1 - targetSession.appliedDiscountPct / 100);
    const newStatus = targetSession.type === 'SUBSCRIPTION_AUTOPAY' ? 'RECOVERED_AUTO_DEBIT' : 'RECOVERED_VIA_LINK';

    const updated = await recoveryRepository.update(targetSession.id, {
      status: newStatus,
      recoveredAmount,
    });

    await customerRepository.incrementRecovered(targetSession.customer.id, recoveredAmount);

    await paymentRepository.create({
      merchantId,
      customerId: targetSession.customer.id,
      subscriptionId: targetSession.subscriptionId || undefined,
      razorpayPaymentId: `pay_${uuidv4().slice(0, 10)}`,
      amount: recoveredAmount,
      status: 'captured',
      method: targetSession.type === 'SUBSCRIPTION_AUTOPAY' ? 'upi_autopay' : 'payment_link',
    });

    await auditLogRepository.create({
      merchantId,
      eventType: 'PAYMENT_CAPTURED',
      entityType: 'RECOVERY_SESSION',
      entityId: targetSession.id,
      title: 'Payment Successfully Recovered',
      description: `Razorpay webhook received: payment.captured for ₹${recoveredAmount}. Mandate updated to active.`,
      customerName: targetSession.customer.name,
      amount: recoveredAmount,
      status: 'SUCCESS',
      complianceTag: 'PAYMENT_RECOVERED',
    });

    return updated;
  }
}

export const simulatorService = new SimulatorService();
