import mongoose from 'mongoose';
import { paymentRepository } from '../repositories/payment.repository';
import { CustomerModel } from '../models/Customer.model';
import { PaymentModel } from '../models/Payment.model';
import { RecoverySessionModel } from '../models/RecoverySession.model';
import { AIDecisionModel } from '../models/AIDecision.model';
import { MandateModel } from '../models/Mandate.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { RetryAttemptModel } from '../models/RetryAttempt.model';
import { NotificationLogModel } from '../models/NotificationLog.model';
import { AuditLogModel } from '../models/AuditLog.model';
import { aiDecisionEngine } from '../ai/aiDecisionEngine';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../logs/logger';

export interface CreatePaymentDto {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  customerId?: string;
  amount: number;
  currency?: string;
  orderId?: string;
  paymentType?: 'ONE_TIME' | 'SUBSCRIPTION' | 'CHECKOUT';
  upiId?: string;
  scenario?: string;
  failureCode?: string;
  bank?: string;
  status?: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
}

export class PaymentService {
  async listPayments(merchantId: string, limit = 50, offset = 0, status?: string, search?: string) {
    return paymentRepository.list(merchantId, limit, offset, status, search);
  }

  async getPaymentById(id: string, merchantId: string) {
    const payment = await paymentRepository.findById(id, merchantId);
    if (!payment) throw new NotFoundError('Payment record not found.');
    return payment;
  }

  async createPayment(merchantId: string, data: CreatePaymentDto) {
    if (!data.amount || data.amount <= 0) {
      throw new ValidationError('Payment amount must be a positive number.');
    }

    const customerName = data.customer?.name || 'Customer';
    const customerEmail = data.customer?.email || 'customer@revora.ai';
    const customerPhone = data.customer?.phone || '+91 98765 43210';
    const vpa = data.upiId || 'customer@okhdfcbank';
    const paymentType = data.paymentType || 'SUBSCRIPTION';

    // 1. Find or Create Customer
    let customer: any = null;
    if (data.customerId) {
      customer = await CustomerModel.findOne({ _id: data.customerId, merchantId });
    }
    if (!customer && customerEmail) {
      customer = await CustomerModel.findOne({ email: customerEmail, merchantId });
    }

    const isSuccessScenario = data.scenario === 'SUCCESS' || data.status === 'captured';
    const isTerminalScenario = data.scenario === 'INVALID_MPIN' || data.failureCode === 'ZG';
    const isNpciStopScenario = data.scenario === 'NPCI_LIMIT_REACHED';

    if (!customer) {
      customer = await CustomerModel.create({
        merchantId,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        vpa,
        riskScore: isTerminalScenario ? 70 : 15,
        healthScore: isSuccessScenario ? 98 : isTerminalScenario ? 40 : 85,
        recoveryProbability: isSuccessScenario ? 100 : isTerminalScenario ? 20 : 88,
        lifetimeRecovered: isSuccessScenario ? data.amount : 0,
        lifetimeLost: isTerminalScenario ? data.amount : 0,
      });

      await AuditLogModel.create({
        merchantId,
        eventType: 'CUSTOMER_CREATED',
        entityType: 'CUSTOMER',
        entityId: customer._id.toString(),
        title: `Customer Created: ${customerName}`,
        description: `New customer registered: ${customerEmail}`,
        customerName,
        amount: data.amount,
        status: 'INFO',
      });
    }

    const customerId = customer._id.toString();

    // 2. Determine Failure & Status Parameters
    let failureCode = data.failureCode || null;
    let failureReason = 'Transaction processed normally.';
    let failureCategory: 'TRANSIENT' | 'ACTION_REQUIRED' | 'TERMINAL' = 'TRANSIENT';
    let recoveryStatus = 'ANALYZING_AI';

    if (isSuccessScenario) {
      failureCode = null;
      recoveryStatus = 'RECOVERED_VIA_LINK';
    } else if (data.scenario === 'U30' || failureCode === 'U30') {
      failureCode = 'U30';
      failureReason = 'Debit failed: Insufficient balance in customer bank account (HDFC Bank)';
      failureCategory = 'TRANSIENT';
      recoveryStatus = 'SCHEDULED_RETRY';
    } else if (data.scenario === 'TIMEOUT' || failureCode === 'UT' || failureCode === 'U69') {
      failureCode = 'UT';
      failureReason = 'Transaction Timeout on Remitter Switch';
      failureCategory = 'TRANSIENT';
      recoveryStatus = 'SCHEDULED_RETRY';
    } else if (data.scenario === 'INVALID_MPIN' || failureCode === 'ZM') {
      failureCode = 'ZM';
      failureReason = 'Invalid MPIN / Authorization Expired';
      failureCategory = 'ACTION_REQUIRED';
      recoveryStatus = 'PAYMENT_LINK_SENT';
    } else if (data.scenario === 'CHECKOUT_ABANDONED') {
      failureCode = null;
      failureReason = 'Checkout Abandoned (Inactivity Dropoff)';
      failureCategory = 'ACTION_REQUIRED';
      recoveryStatus = 'PAYMENT_LINK_SENT';
    } else if (isTerminalScenario) {
      failureCode = 'ZG';
      failureReason = 'Virtual Payment Address Revoked / Blocked by PSP';
      failureCategory = 'TERMINAL';
      recoveryStatus = 'STOP_TERMINAL_FAILURE';
    } else if (isNpciStopScenario) {
      failureCode = 'U30';
      failureReason = 'NPCI 3-Attempt Cap Reached. presentations stopped to prevent penalty.';
      failureCategory = 'TRANSIENT';
      recoveryStatus = 'STOP_NPCI_LIMIT_REACHED';
    } else if (!failureCode) {
      failureCode = 'U30';
      failureReason = 'Debit failed: Insufficient funds in customer bank account';
      recoveryStatus = 'SCHEDULED_RETRY';
    }

    const paymentStatus = isSuccessScenario ? 'captured' : 'failed';
    const razorpayPaymentId = `pay_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 900 + 100)}`;
    const razorpayOrderId = data.orderId || `ORD-${Date.now().toString().slice(-6)}`;

    // 3. Create Mandate & Subscription if needed
    let mandateId: string | undefined;
    let subscriptionId: string | undefined;

    if (paymentType === 'SUBSCRIPTION') {
      const uniqueSuffix = `${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 900 + 100)}`;
      const mandate = await MandateModel.create({
        customerId,
        razorpayMandateId: `mand_${customerId.slice(-4)}_${uniqueSuffix}`,
        vpa,
        bankName: data.bank || 'HDFC Bank',
        maxAmount: 25000.0,
        frequency: 'monthly',
        status: isTerminalScenario ? 'REVOKED' : 'ACTIVE',
      });
      mandateId = mandate._id.toString();

      const subscription = await SubscriptionModel.create({
        merchantId,
        customerId,
        mandateId,
        razorpaySubId: `sub_rzp_${customerId.slice(-4)}_${uniqueSuffix}`,
        planName: data.customer?.company ? `${data.customer.company} Plan` : 'Pro Subscription',
        amount: data.amount,
        billingCycle: 'monthly',
        nextDueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status: isSuccessScenario ? 'active' : 'recovering',
      });
      subscriptionId = subscription._id.toString();
    }

    // 4. Save Payment to MongoDB
    const payment = await PaymentModel.create({
      merchantId,
      customerId,
      subscriptionId,
      razorpayPaymentId,
      razorpayOrderId,
      customerName,
      customerEmail,
      customerPhone,
      amount: data.amount,
      currency: data.currency || 'INR',
      paymentType,
      status: paymentStatus,
      method: 'upi_autopay',
      bank: data.bank || 'HDFC Bank',
      vpa,
      mandateId,
      failureCode,
      errorDescription: failureReason,
      retryCount: isNpciStopScenario ? 3 : isSuccessScenario ? 1 : 1,
      recoveryStage: recoveryStatus,
      recoveryProbability: isTerminalScenario ? 20 : isSuccessScenario ? 100 : 88,
      aiScore: isTerminalScenario ? 35 : 92,
    });

    const paymentId = payment._id.toString();

    // 5. Create Recovery Session in MongoDB
    const recovery = await RecoverySessionModel.create({
      merchantId,
      customerId,
      subscriptionId,
      paymentId,
      type: paymentType === 'CHECKOUT' ? 'CHECKOUT_ABANDONMENT' : 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: data.customer?.company ? `${data.customer.company} Plan` : 'Pro Plan Subscription',
      originalAmount: data.amount,
      recoveredAmount: isSuccessScenario ? data.amount : 0,
      appliedDiscountPct: paymentType === 'CHECKOUT' ? 5.0 : 0,
      failureCode,
      failureCategory,
      failureDescription: failureReason,
      status: recoveryStatus,
      npciAttemptCount: isNpciStopScenario ? 3 : 1,
      maxNpciAttempts: 3,
      cooldownHoursRemaining: recoveryStatus === 'SCHEDULED_RETRY' ? 24 : 0,
      nextScheduledRetry: recoveryStatus === 'SCHEDULED_RETRY' ? new Date(Date.now() + 24 * 3600 * 1000) : null,
      stopReason: isTerminalScenario ? 'Terminal VPA error' : isNpciStopScenario ? 'NPCI Circular OC-136 Cap Reached' : null,
      paymentLinkUrl: `https://pay.revora.ai/r/${paymentId.slice(-6)}`,
    });

    const sessionId = recovery._id.toString();

    // 6. Generate AI Decision & Persistence
    const aiEvaluation = await aiDecisionEngine.evaluate({
      eventType: 'PAYMENT_FAILED',
      failureCode: failureCode || 'U30',
      failureDescription: failureReason,
      customerProfile: {
        id: customerId,
        name: customerName,
        riskScore: customer.riskScore || 15,
        healthScore: customer.healthScore || 85,
        lifetimeRecovered: customer.lifetimeRecovered || 0,
        optedOut: false,
      },
      transactionDetails: {
        amount: data.amount,
        type: paymentType,
        planOrItemName: data.customer?.company ? `${data.customer.company} Plan` : 'Pro Subscription',
        currentAttempt: isNpciStopScenario ? 3 : 1,
        maxAttempts: 3,
        lastAttemptTime: new Date(),
      },
      merchantPolicy: {
        maxDiscountPct: 10,
        autoRecoveryEnabled: true,
      },
    });

    const decision = aiEvaluation.decision;

    await AIDecisionModel.create({
      recoverySessionId: sessionId,
      modelName: aiEvaluation.modelUsed || 'gemini-2.5-flash',
      actionRecommended: decision.action,
      recoveryScore: decision.recoveryScore,
      riskScore: decision.riskScore,
      confidence: decision.confidence,
      headline: decision.headline,
      rationale: decision.rationale,
      complianceRule: decision.complianceRule,
      customerMessagePreview: decision.customerMessagePreview,
    });

    // 7. Log Retry Attempt & Notification in MongoDB
    await RetryAttemptModel.create({
      recoverySessionId: sessionId,
      attemptNumber: 1,
      scheduledFor: new Date(),
      executedAt: new Date(),
      status: isSuccessScenario ? 'success' : 'failed',
      errorCode: failureCode,
      cooldownHoursMet: 24.0,
    });

    await NotificationLogModel.create({
      recoverySessionId: sessionId,
      channel: 'WHATSAPP',
      recipient: customerPhone,
      messageBody: `Hi ${customerName}, recovery update for payment of ₹${data.amount.toLocaleString('en-IN')}.`,
      status: 'DELIVERED',
      ctaUrl: `https://pay.revora.ai/r/${paymentId.slice(-6)}`,
    });

    // 8. Create Activity Log in MongoDB
    await AuditLogModel.create({
      merchantId,
      eventType: isSuccessScenario ? 'PAYMENT_CAPTURED' : isTerminalScenario ? 'STOP_STATE_ENFORCED' : 'PAYMENT_FAILED',
      entityType: 'PAYMENT',
      entityId: paymentId,
      title: isSuccessScenario
        ? `Payment Captured: ${customerName}`
        : isTerminalScenario
        ? `Stop State Enforced (ZG): ${customerName}`
        : `Payment Failed (${failureCode || 'U30'}): ${customerName}`,
      description: `${paymentType} · ₹${data.amount.toLocaleString('en-IN')} via ${vpa}`,
      customerName,
      amount: data.amount,
      status: isSuccessScenario ? 'SUCCESS' : isTerminalScenario ? 'DANGER' : 'WARNING',
      complianceTag: 'NPCI_OC136_COMPLIANT',
    });

    logger.info({ paymentId, customerId, sessionId }, '✅ End-to-end payment and recovery persisted to MongoDB.');

    return {
      ...payment.toJSON(),
      id: paymentId,
      customer: { ...customer.toJSON(), id: customerId },
      recovery: { ...recovery.toJSON(), id: sessionId },
    };
  }

  async capturePayment(id: string, merchantId: string) {
    let payment = await PaymentModel.findOne({ _id: id, merchantId: { $in: [merchantId, 'mer_demo_1'] } });
    let recovery: any = null;

    if (!payment) {
      // Check if id is a recovery session id
      recovery = await RecoverySessionModel.findOne({ _id: id, merchantId: { $in: [merchantId, 'mer_demo_1'] } });
      if (recovery?.paymentId) {
        payment = await PaymentModel.findOne({ _id: recovery.paymentId, merchantId: { $in: [merchantId, 'mer_demo_1'] } });
      }
    } else {
      recovery = await RecoverySessionModel.findOne({ paymentId: id, merchantId: { $in: [merchantId, 'mer_demo_1'] } });
    }

    if (!payment && !recovery) throw new NotFoundError('Payment or Recovery session not found.');

    const amount = payment?.amount || recovery?.originalAmount || 0;
    const customerName = payment?.customerName || recovery?.customerName || 'Customer';
    const customerId = payment?.customerId || recovery?.customerId;

    if (payment) {
      payment.status = 'captured';
      payment.recoveryStage = 'RECOVERED_VIA_LINK';
      await payment.save();
    }

    if (recovery) {
      recovery.status = 'RECOVERED_VIA_LINK';
      recovery.recoveredAmount = amount;
      recovery.cooldownHoursRemaining = 0;
      recovery.nextScheduledRetry = null;
      await recovery.save();

      // Log success retry attempt
      await RetryAttemptModel.create({
        recoverySessionId: recovery._id.toString(),
        attemptNumber: (recovery.npciAttemptCount || 1),
        scheduledFor: new Date(),
        executedAt: new Date(),
        status: 'success',
        cooldownHoursMet: 24.0,
      });
    }

    if (customerId) {
      const customer = await CustomerModel.findById(customerId);
      if (customer) {
        customer.lifetimeRecovered = (customer.lifetimeRecovered || 0) + amount;
        customer.healthScore = Math.min(100, (customer.healthScore || 80) + 10);
        customer.recoveryProbability = 98;
        await customer.save();
      }
    }

    await AuditLogModel.create({
      merchantId: payment?.merchantId || recovery?.merchantId || merchantId,
      eventType: 'PAYMENT_CAPTURED',
      entityType: 'PAYMENT',
      entityId: payment ? payment._id.toString() : recovery._id.toString(),
      title: `Payment Recovered: ${customerName}`,
      description: `Payment of ₹${amount.toLocaleString('en-IN')} marked as captured & settled.`,
      customerName,
      amount,
      status: 'SUCCESS',
      complianceTag: 'NPCI_SETTLED',
    });

    return {
      payment: payment ? { ...payment.toJSON(), id: payment._id.toString() } : null,
      recovery: recovery ? { ...recovery.toJSON(), id: recovery._id.toString() } : null,
    };
  }

  async updatePayment(id: string, merchantId: string, data: any) {
    const existing = await PaymentModel.findOne({ _id: id, merchantId });
    if (!existing) throw new NotFoundError('Payment not found.');

    const updated: any = await PaymentModel.findOneAndUpdate(
      { _id: id, merchantId },
      { $set: data },
      { new: true }
    ).lean();

    if (!updated) throw new NotFoundError('Payment not found.');

    await AuditLogModel.create({
      merchantId,
      eventType: 'PAYMENT_UPDATED',
      entityType: 'PAYMENT',
      entityId: id,
      title: `Payment Updated: ${existing.customerName}`,
      description: `Payment record updated in MongoDB.`,
      customerName: existing.customerName || 'Customer',
      amount: existing.amount,
      status: 'INFO',
    });

    return { ...updated, id: updated._id ? updated._id.toString() : id };
  }

  async deletePayment(id: string, merchantId: string) {
    const payment = await PaymentModel.findOne({ _id: id, merchantId });
    if (!payment) throw new NotFoundError('Payment not found.');

    await Promise.all([
      PaymentModel.deleteOne({ _id: id, merchantId }),
      RecoverySessionModel.deleteMany({ paymentId: id, merchantId }),
      AuditLogModel.deleteMany({ entityId: id, merchantId }),
    ]);

    await AuditLogModel.create({
      merchantId,
      eventType: 'PAYMENT_DELETED',
      entityType: 'PAYMENT',
      entityId: id,
      title: `Payment Deleted: ${payment.customerName}`,
      description: `Payment of ₹${payment.amount.toLocaleString('en-IN')} removed from MongoDB.`,
      customerName: payment.customerName || 'Customer',
      amount: payment.amount,
      status: 'WARNING',
    });

    return { success: true, message: 'Payment and associated recovery records deleted successfully.' };
  }
}

export const paymentService = new PaymentService();
