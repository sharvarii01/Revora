import { SubscriptionModel, ISubscription } from '../models/Subscription.model';
import { CustomerModel } from '../models/Customer.model';
import { MandateModel } from '../models/Mandate.model';
import { RecoverySessionModel } from '../models/RecoverySession.model';

export class SubscriptionRepository {
  async findById(id: string, merchantId?: string): Promise<any | null> {
    const filter: any = { _id: id };
    if (merchantId) filter.merchantId = { $in: [merchantId, 'mer_demo_1'] };

    const sub: any = await SubscriptionModel.findOne(filter).lean();
    if (!sub) return null;

    const [customer, mandate, recoverySession]: any[] = await Promise.all([
      CustomerModel.findById(sub.customerId).lean(),
      sub.mandateId ? MandateModel.findById(sub.mandateId).lean() : null,
      RecoverySessionModel.findOne({ subscriptionId: id }).sort({ createdAt: -1 }).lean(),
    ]);

    return {
      ...sub,
      id: sub._id.toString(),
      customer: customer ? { ...customer, id: customer._id.toString() } : null,
      mandate: mandate ? { ...mandate, id: mandate._id.toString() } : null,
      recoverySessions: recoverySession ? [{ ...recoverySession, id: recoverySession._id.toString() }] : [],
    };
  }

  async findByRazorpaySubId(razorpaySubId: string): Promise<any | null> {
    const sub: any = await SubscriptionModel.findOne({ razorpaySubId }).lean();
    if (!sub) return null;

    const [customer, mandate]: any[] = await Promise.all([
      CustomerModel.findById(sub.customerId).lean(),
      sub.mandateId ? MandateModel.findById(sub.mandateId).lean() : null,
    ]);

    return {
      ...sub,
      id: sub._id.toString(),
      customer: customer ? { ...customer, id: customer._id.toString() } : null,
      mandate: mandate ? { ...mandate, id: mandate._id.toString() } : null,
    };
  }

  async list(
    merchantId: string,
    limit = 50,
    offset = 0,
    status?: string
  ): Promise<{ data: any[]; total: number }> {
    const filter: any = { merchantId: { $in: [merchantId, 'mer_demo_1'] } };
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const [subs, total] = await Promise.all([
      SubscriptionModel.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      SubscriptionModel.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      subs.map(async (s: any) => {
        const [customer, mandate, recoverySession]: any[] = await Promise.all([
          CustomerModel.findById(s.customerId).lean(),
          s.mandateId ? MandateModel.findById(s.mandateId).lean() : null,
          RecoverySessionModel.findOne({ subscriptionId: s._id.toString() })
            .sort({ createdAt: -1 })
            .lean(),
        ]);

        return {
          ...s,
          id: s._id.toString(),
          customer: customer ? { ...customer, id: customer._id.toString() } : { name: 'Customer', email: 'cust@revora.ai' },
          mandate: mandate ? { ...mandate, id: mandate._id.toString() } : null,
          recoverySessions: recoverySession ? [{ ...recoverySession, id: recoverySession._id.toString() }] : [],
        };
      })
    );

    return { data: enriched, total };
  }

  async create(data: {
    merchantId: string;
    customerId: string;
    mandateId?: string;
    razorpaySubId: string;
    planName: string;
    amount: number;
    currency?: string;
    billingCycle?: string;
    nextDueDate: Date;
    status?: string;
  }): Promise<any> {
    const doc: any = await SubscriptionModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async updateStatus(id: string, status: string): Promise<any | null> {
    const doc: any = await SubscriptionModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }
}

export const subscriptionRepository = new SubscriptionRepository();
