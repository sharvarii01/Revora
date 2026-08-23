import { RecoverySessionModel, IRecoverySession } from '../models/RecoverySession.model';
import { CustomerModel } from '../models/Customer.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { MandateModel } from '../models/Mandate.model';
import { AIDecisionModel } from '../models/AIDecision.model';
import { RetryAttemptModel } from '../models/RetryAttempt.model';
import { NotificationLogModel } from '../models/NotificationLog.model';
import { ACTIVE_RECOVERY_STATUSES } from '../constants/recoveryStates';

export class RecoveryRepository {
  async findById(id: string, merchantId?: string): Promise<any | null> {
    const filter: any = { _id: id };
    if (merchantId) filter.merchantId = { $in: [merchantId, 'mer_demo_1'] };

    const session: any = await RecoverySessionModel.findOne(filter).lean();
    if (!session) return null;

    const [customer, subscription, aiDecisions, retryAttempts, notificationLogs]: any[] = await Promise.all([
      CustomerModel.findById(session.customerId).lean(),
      session.subscriptionId ? SubscriptionModel.findById(session.subscriptionId).lean() : null,
      AIDecisionModel.find({ recoverySessionId: id }).sort({ createdAt: -1 }).limit(1).lean(),
      RetryAttemptModel.find({ recoverySessionId: id }).sort({ attemptNumber: 1 }).lean(),
      NotificationLogModel.find({ recoverySessionId: id }).sort({ createdAt: -1 }).lean(),
    ]);

    let mandate: any = null;
    if (subscription?.mandateId) {
      mandate = await MandateModel.findById(subscription.mandateId).lean();
    }

    return {
      ...session,
      id: session._id.toString(),
      customer: customer ? { ...customer, id: customer._id.toString() } : { id: session.customerId, name: 'Customer', email: 'cust@revora.ai', phone: '+919999999999' },
      subscription: subscription ? { ...subscription, id: subscription._id.toString(), mandate } : null,
      aiDecisions: (aiDecisions || []).map((a: any) => ({ ...a, id: a._id.toString() })),
      retryAttempts: (retryAttempts || []).map((r: any) => ({ ...r, id: r._id.toString() })),
      notificationLogs: (notificationLogs || []).map((n: any) => ({ ...n, id: n._id.toString() })),
    };
  }

  async findActiveBySubscriptionId(subscriptionId: string): Promise<any | null> {
    const session: any = await RecoverySessionModel.findOne({
      subscriptionId,
      status: { $in: ACTIVE_RECOVERY_STATUSES },
    }).lean();
    if (!session) return null;
    return { ...session, id: session._id.toString() };
  }

  async list(
    merchantId: string,
    limit = 50,
    offset = 0,
    status?: string,
    type?: string,
    search?: string
  ): Promise<{ data: any[]; total: number }> {
    const filter: any = { merchantId: { $in: [merchantId, 'mer_demo_1'] } };

    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        filter.status = { $in: ACTIVE_RECOVERY_STATUSES };
      } else if (status === 'RECOVERED') {
        filter.status = { $in: ['RECOVERED_AUTO_DEBIT', 'RECOVERED_VIA_LINK'] };
      } else if (status === 'STOPPED') {
        filter.status = {
          $in: [
            'STOP_NPCI_LIMIT_REACHED',
            'STOP_TERMINAL_FAILURE',
            'STOP_CUSTOMER_OPTED_OUT',
            'STOP_DISCOUNT_FLOOR_EXCEEDED',
            'STOP_MANUAL_CANCELLED',
          ],
        };
      } else {
        filter.status = status;
      }
    }

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    if (search) {
      const matchingCustomers = await CustomerModel.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id').lean();
      const customerIds = (matchingCustomers || []).map((c: any) => c._id.toString());

      filter.$or = [
        { customerId: { $in: customerIds } },
        { planOrItemName: { $regex: search, $options: 'i' } },
        { failureCode: { $regex: search, $options: 'i' } },
        { stopReason: { $regex: search, $options: 'i' } },
      ];
    }

    const [sessions, total] = await Promise.all([
      RecoverySessionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      RecoverySessionModel.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      sessions.map(async (s: any) => {
        const [customer, subscription, aiDecisions, retryAttempts, notificationLogs]: any[] = await Promise.all([
          CustomerModel.findById(s.customerId).lean(),
          s.subscriptionId ? SubscriptionModel.findById(s.subscriptionId).lean() : null,
          AIDecisionModel.find({ recoverySessionId: s._id.toString() }).sort({ createdAt: -1 }).limit(1).lean(),
          RetryAttemptModel.find({ recoverySessionId: s._id.toString() }).sort({ attemptNumber: 1 }).lean(),
          NotificationLogModel.find({ recoverySessionId: s._id.toString() }).sort({ createdAt: -1 }).limit(3).lean(),
        ]);

        return {
          ...s,
          id: s._id.toString(),
          customer: customer ? { ...customer, id: customer._id.toString() } : { id: s.customerId, name: 'Customer', email: 'cust@revora.ai', phone: '+919999999999' },
          subscription: subscription ? { ...subscription, id: subscription._id.toString() } : null,
          aiDecisions: (aiDecisions || []).map((a: any) => ({ ...a, id: a._id.toString() })),
          retryAttempts: (retryAttempts || []).map((r: any) => ({ ...r, id: r._id.toString() })),
          notificationLogs: (notificationLogs || []).map((n: any) => ({ ...n, id: n._id.toString() })),
        };
      })
    );

    return { data: enriched, total };
  }

  async create(data: {
    merchantId: string;
    customerId: string;
    type: string;
    subscriptionId?: string;
    cartId?: string;
    planOrItemName?: string;
    originalAmount: number;
    recoveredAmount?: number;
    appliedDiscountPct?: number;
    failureCode?: string;
    failureCategory?: string;
    failureDescription?: string;
    status?: string;
    npciAttemptCount?: number;
    maxNpciAttempts?: number;
    nextScheduledRetry?: Date;
    cooldownHoursRemaining?: number;
    stopReason?: string;
    razorpayPaymentLinkId?: string;
    paymentLinkUrl?: string;
  }): Promise<any> {
    const doc: any = await RecoverySessionModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async update(id: string, data: Partial<IRecoverySession>): Promise<any | null> {
    const doc: any = await RecoverySessionModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async delete(id: string, merchantId: string): Promise<boolean> {
    const res = await RecoverySessionModel.deleteOne({ _id: id, merchantId });
    return res.deletedCount > 0;
  }
}

export const recoveryRepository = new RecoveryRepository();
