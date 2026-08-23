import { subscriptionRepository } from '../repositories/subscription.repository';
import { mandateRepository } from '../repositories/mandate.repository';
import { CreateSubscriptionDto, SubscriptionRecordDto } from '../types/subscription.types';
import { NotFoundError } from '../utils/errors';

export class SubscriptionService {
  async listSubscriptions(merchantId: string, limit = 50, offset = 0, status?: string) {
    const { data, total } = await subscriptionRepository.list(merchantId, limit, offset, status);

    const formatted: SubscriptionRecordDto[] = data.map((s: any) => ({
      id: s.id,
      customerId: s.customer.id,
      customerName: s.customer.name,
      customerEmail: s.customer.email,
      planName: s.planName,
      amount: s.amount,
      currency: s.currency,
      billingCycle: s.billingCycle,
      nextDueDate: s.nextDueDate.toISOString(),
      status: s.status,
      mandate: s.mandate
        ? {
            id: s.mandate.id,
            razorpayMandateId: s.mandate.razorpayMandateId,
            vpa: s.mandate.vpa,
            bankName: s.mandate.bankName,
            maxAmount: s.mandate.maxAmount,
            frequency: s.mandate.frequency,
            status: s.mandate.status,
          }
        : null,
      currentAttempt: s.recoverySessions?.[0]?.npciAttemptCount || 0,
      maxAttempts: 3,
      recoverySessionId: s.recoverySessions?.[0]?.id || null,
      lastFailureCode: s.recoverySessions?.[0]?.failureCode || null,
    }));

    return { data: formatted, total };
  }

  async getSubscriptionById(id: string, merchantId: string): Promise<SubscriptionRecordDto> {
    const s: any = await subscriptionRepository.findById(id, merchantId);
    if (!s) throw new NotFoundError('Subscription not found.');

    return {
      id: s.id,
      customerId: s.customer.id,
      customerName: s.customer.name,
      customerEmail: s.customer.email,
      planName: s.planName,
      amount: s.amount,
      currency: s.currency,
      billingCycle: s.billingCycle,
      nextDueDate: s.nextDueDate.toISOString(),
      status: s.status,
      mandate: s.mandate
        ? {
            id: s.mandate.id,
            razorpayMandateId: s.mandate.razorpayMandateId,
            vpa: s.mandate.vpa,
            bankName: s.mandate.bankName,
            maxAmount: s.mandate.maxAmount,
            frequency: s.mandate.frequency,
            status: s.mandate.status,
          }
        : null,
      currentAttempt: s.recoverySessions?.[0]?.npciAttemptCount || 0,
      maxAttempts: 3,
      recoverySessionId: s.recoverySessions?.[0]?.id || null,
      lastFailureCode: s.recoverySessions?.[0]?.failureCode || null,
    };
  }

  async createSubscription(merchantId: string, data: CreateSubscriptionDto) {
    let mandateId: string | undefined;

    if (data.mandate) {
      const mandate = await mandateRepository.create({
        customerId: data.customerId,
        razorpayMandateId: data.mandate.razorpayMandateId,
        vpa: data.mandate.vpa,
        bankName: data.mandate.bankName,
        maxAmount: data.mandate.maxAmount,
        frequency: data.mandate.frequency || 'monthly',
      });
      mandateId = mandate.id;
    }

    return subscriptionRepository.create({
      merchantId,
      customerId: data.customerId,
      mandateId,
      razorpaySubId: data.razorpaySubId,
      planName: data.planName,
      amount: data.amount,
      currency: data.currency || 'INR',
      billingCycle: data.billingCycle || 'monthly',
      nextDueDate: data.nextDueDate,
      status: 'active',
    });
  }
}

export const subscriptionService = new SubscriptionService();
