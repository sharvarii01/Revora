import { CustomerModel, ICustomer } from '../models/Customer.model';
import { MandateModel } from '../models/Mandate.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { RecoverySessionModel } from '../models/RecoverySession.model';

export class CustomerRepository {
  async findById(id: string, merchantId: string): Promise<any | null> {
    const customer: any = await CustomerModel.findOne({
      _id: id,
      merchantId: { $in: [merchantId, 'mer_demo_1'] },
    }).lean();
    if (!customer) return null;

    const [mandates, subscriptions, recoverySessions]: any[] = await Promise.all([
      MandateModel.find({ customerId: id }).lean(),
      SubscriptionModel.find({ customerId: id }).lean(),
      RecoverySessionModel.find({ customerId: id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return {
      ...customer,
      id: customer._id.toString(),
      mandates: (mandates || []).map((m: any) => ({ ...m, id: m._id.toString() })),
      subscriptions: (subscriptions || []).map((s: any) => ({ ...s, id: s._id.toString() })),
      recoverySessions: (recoverySessions || []).map((r: any) => ({ ...r, id: r._id.toString() })),
    };
  }

  async findByEmailOrPhone(merchantId: string, email: string, phone: string): Promise<any | null> {
    const doc: any = await CustomerModel.findOne({
      merchantId: { $in: [merchantId, 'mer_demo_1'] },
      $or: [{ email: email.toLowerCase() }, { phone }],
    }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async findByRazorpayCustId(razorpayCustId: string): Promise<any | null> {
    const doc: any = await CustomerModel.findOne({ razorpayCustId }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async list(
    merchantId: string,
    limit = 50,
    offset = 0,
    search?: string
  ): Promise<{ data: any[]; total: number }> {
    const filter: any = { merchantId: { $in: [merchantId, 'mer_demo_1'] } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      CustomerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      CustomerModel.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      customers.map(async (c: any) => {
        const [subscriptions, mandates, recoverySessions]: any[] = await Promise.all([
          SubscriptionModel.find({ customerId: c._id.toString() }).lean(),
          MandateModel.find({ customerId: c._id.toString() }).lean(),
          RecoverySessionModel.find({ customerId: c._id.toString() })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),
        ]);

        return {
          ...c,
          id: c._id.toString(),
          subscriptions: (subscriptions || []).map((s: any) => ({ ...s, id: s._id.toString() })),
          mandates: (mandates || []).map((m: any) => ({ ...m, id: m._id.toString() })),
          recoverySessions: (recoverySessions || []).map((r: any) => ({ ...r, id: r._id.toString() })),
        };
      })
    );

    return { data: enriched, total };
  }

  async create(data: {
    merchantId: string;
    name: string;
    email: string;
    phone: string;
    vpa?: string;
    razorpayCustId?: string;
    riskScore?: number;
    healthScore?: number;
    recoveryProbability?: number;
  }): Promise<any> {
    const doc: any = await CustomerModel.create({
      ...data,
      email: data.email.toLowerCase(),
    });
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async update(id: string, merchantId: string, data: Partial<ICustomer>): Promise<any | null> {
    const doc: any = await CustomerModel.findOneAndUpdate(
      { _id: id, merchantId },
      { $set: data },
      { new: true }
    ).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async incrementRecovered(id: string, amount: number): Promise<any | null> {
    return CustomerModel.findByIdAndUpdate(
      id,
      {
        $inc: { lifetimeRecovered: amount, healthScore: 5 },
      },
      { new: true }
    ).lean();
  }

  async incrementLost(id: string, amount: number): Promise<any | null> {
    return CustomerModel.findByIdAndUpdate(
      id,
      {
        $inc: { lifetimeLost: amount, riskScore: 10 },
      },
      { new: true }
    ).lean();
  }

  async delete(id: string, merchantId: string): Promise<boolean> {
    const res = await CustomerModel.deleteOne({ _id: id, merchantId });
    return res.deletedCount > 0;
  }
}

export const customerRepository = new CustomerRepository();
