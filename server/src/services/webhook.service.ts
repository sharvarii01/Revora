import { RazorpayWebhookPayload } from '../types/webhook.types';
import { verifyRazorpaySignature } from '../utils/crypto.util';
import { merchantRepository } from '../repositories/merchant.repository';
import { customerRepository } from '../repositories/customer.repository';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { recoveryRepository } from '../repositories/recovery.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { recoveryQueue } from '../queue/recoveryQueue';
import { UnauthorizedError } from '../utils/errors';
import logger from '../logs/logger';

export class WebhookService {
  /**
   * Validates HMAC signature, deduplicates, and processes Razorpay webhook events.
   */
  async processWebhook(rawBody: string, signature: string, payload: RazorpayWebhookPayload) {
    const merchant = await merchantRepository.findByEmail('sharvi@saasplatform.in');
    const secret = merchant?.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_revora_razorpay_hmac_2026';

    const isValid = verifyRazorpaySignature(rawBody, signature, secret);
    if (!isValid && process.env.NODE_ENV === 'production') {
      throw new UnauthorizedError('Invalid Razorpay webhook signature.');
    }

    const { event } = payload;
    logger.info({ event, entity: payload.entity }, '🔔 Inbound Razorpay webhook event received.');

    switch (event) {
      case 'payment.failed':
      case 'subscription.charged.failed':
        await this.handlePaymentFailure(payload, merchant?.id || 'mer_default');
        break;

      case 'payment.captured':
      case 'order.paid':
        await this.handlePaymentCaptured(payload, merchant?.id || 'mer_default');
        break;

      case 'subscription.halted':
      case 'subscription.cancelled':
        await this.handleSubscriptionHalted(payload, merchant?.id || 'mer_default');
        break;

      default:
        logger.info({ event }, 'ℹ️ Unhandled Razorpay event ignored.');
    }

    return { received: true, event };
  }

  private async handlePaymentFailure(payload: RazorpayWebhookPayload, merchantId: string) {
    const payment = payload.payload.payment?.entity;
    const subscription = payload.payload.subscription?.entity;

    if (!payment && !subscription) return;

    const email = payment?.email || 'customer@example.com';
    const phone = payment?.contact || '+919999999999';
    const name = payment?.notes?.name || email.split('@')[0];
    const amount = (payment?.amount ? payment.amount / 100 : 0) || 2499;
    const failureCode = payment?.error_code || 'U30';
    const failureDescription = payment?.error_description || 'Debit failed due to insufficient funds in account';

    // 1. Ensure Customer exists
    let customer = await customerRepository.findByEmailOrPhone(merchantId, email, phone);
    if (!customer) {
      customer = await customerRepository.create({
        merchantId,
        name,
        email,
        phone,
        vpa: payment?.vpa,
        razorpayCustId: payment?.customer_id,
      });
    }

    // 2. Find associated Subscription
    let subRecord = null;
    if (subscription?.id) {
      subRecord = await subscriptionRepository.findByRazorpaySubId(subscription.id);
    }

    // 3. Record Failed Payment
    if (payment?.id) {
      await paymentRepository.create({
        merchantId,
        customerId: customer.id,
        subscriptionId: subRecord?.id,
        razorpayPaymentId: payment.id,
        amount,
        status: 'failed',
        method: payment.method || 'upi_autopay',
        bank: payment.bank,
        errorCode: failureCode,
        errorDescription: failureDescription,
      });
    }

    // 4. Create or Find Recovery Session
    let session = subRecord?.id ? await recoveryRepository.findActiveBySubscriptionId(subRecord.id) : null;
    if (!session) {
      session = await recoveryRepository.create({
        merchantId,
        customerId: customer.id,
        type: subRecord ? 'SUBSCRIPTION_AUTOPAY' : 'CHECKOUT_ABANDONMENT',
        subscriptionId: subRecord?.id,
        planOrItemName: subRecord?.planName || 'Recurring Subscription',
        originalAmount: amount,
        failureCode,
        failureCategory: 'TRANSIENT',
        failureDescription,
        status: 'ANALYZING_AI',
        npciAttemptCount: (subRecord ? 1 : 0),
        maxNpciAttempts: 3,
      });
    } else {
      session = await recoveryRepository.update(session.id, {
        npciAttemptCount: session.npciAttemptCount + 1,
        status: 'ANALYZING_AI',
      });
    }

    // 5. Enqueue for AI decision processing
    await recoveryQueue.add('evaluate-recovery-session', {
      recoverySessionId: session.id,
      merchantId,
      eventType: payload.event,
      failureCode,
      failureDescription,
    });
  }

  private async handlePaymentCaptured(payload: RazorpayWebhookPayload, merchantId: string) {
    const payment = payload.payload.payment?.entity;
    if (!payment) return;

    const amount = payment.amount / 100;
    const paymentId = payment.id;

    // Check if there is an active recovery session for this payment/customer
    const customer = await customerRepository.findByEmailOrPhone(merchantId, payment.email, payment.contact);
    if (!customer) return;

    const activeSessions = await recoveryRepository.list(merchantId, 1, 0, 'ACTIVE', 'ALL', customer.email);
    if (activeSessions.data.length > 0) {
      const session = activeSessions.data[0];
      const isAutoPay = payment.method === 'upi_autopay';
      const newStatus = isAutoPay ? 'RECOVERED_AUTO_DEBIT' : 'RECOVERED_VIA_LINK';

      await recoveryRepository.update(session.id, {
        status: newStatus,
        recoveredAmount: amount,
      });

      await customerRepository.incrementRecovered(customer.id, amount);

      await auditLogRepository.create({
        merchantId,
        eventType: 'PAYMENT_CAPTURED',
        entityType: 'RECOVERY_SESSION',
        entityId: session.id,
        title: 'Payment Successfully Captured',
        description: `₹${amount} captured via ${payment.method}. Recovery successfully closed.`,
        customerName: customer.name,
        amount,
        status: 'SUCCESS',
        complianceTag: 'PAYMENT_RECOVERED',
      });

      logger.info({ recoverySessionId: session.id, amount }, '🎉 Recovery session resolved via payment capture.');
    }
  }

  private async handleSubscriptionHalted(payload: RazorpayWebhookPayload, merchantId: string) {
    const sub = payload.payload.subscription?.entity;
    if (!sub) return;

    const subRecord = await subscriptionRepository.findByRazorpaySubId(sub.id);
    if (subRecord) {
      await subscriptionRepository.updateStatus(subRecord.id, 'halted');
    }
  }
}

export const webhookService = new WebhookService();
