import { PaymentModel, IPayment } from '../models/Payment.model';
import { CustomerModel } from '../models/Customer.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { RecoverySessionModel } from '../models/RecoverySession.model';

export class PaymentRepository {
  async findById(id: string, merchantId?: string): Promise<any | null> {
    const filter: any = { _id: id };
    if (merchantId) filter.merchantId = { $in: [merchantId, 'mer_demo_1'] };

    const payment: any = await PaymentModel.findOne(filter).lean();
    if (!payment) return null;

    const [customer, subscription, recovery]: any[] = await Promise.all([
      CustomerModel.findById(payment.customerId).lean(),
      payment.subscriptionId ? SubscriptionModel.findById(payment.subscriptionId).lean() : null,
      RecoverySessionModel.findOne({ paymentId: payment._id.toString() }).lean(),
    ]);

    return {
      ...payment,
      id: payment._id.toString(),
      customer: customer ? { ...customer, id: customer._id.toString() } : null,
      subscription: subscription ? { ...subscription, id: subscription._id.toString() } : null,
      recovery: recovery ? { ...recovery, id: recovery._id.toString() } : null,
    };
  }

  async findByRazorpayPaymentId(razorpayPaymentId: string): Promise<any | null> {
    const payment: any = await PaymentModel.findOne({ razorpayPaymentId }).lean();
    if (!payment) return null;

    const customer: any = await CustomerModel.findById(payment.customerId).lean();
    return {
      ...payment,
      id: payment._id.toString(),
      customer: customer ? { ...customer, id: customer._id.toString() } : null,
    };
  }

  async list(
    merchantId: string,
    limit = 50,
    offset = 0,
    status?: string,
    search?: string
  ): Promise<{ data: any[]; total: number }> {
    const filter: any = { merchantId: { $in: [merchantId, 'mer_demo_1'] } };
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { vpa: { $regex: search, $options: 'i' } },
        { failureCode: { $regex: search, $options: 'i' } },
        { bank: { $regex: search, $options: 'i' } },
      ];
    }

    const [payments, total] = await Promise.all([
      PaymentModel.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      PaymentModel.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      payments.map(async (p: any) => {
        const customer: any = await CustomerModel.findById(p.customerId).lean();
        return {
          ...p,
          id: p._id.toString(),
          customer: customer ? { ...customer, id: customer._id.toString() } : null,
        };
      })
    );

    return { data: enriched, total };
  }

  async create(data: Partial<IPayment>): Promise<any> {
    const doc: any = await PaymentModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async update(id: string, merchantId: string, data: Partial<IPayment>): Promise<any | null> {
    const doc: any = await PaymentModel.findOneAndUpdate(
      { _id: id, merchantId },
      { $set: data },
      { new: true }
    ).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async delete(id: string, merchantId: string): Promise<boolean> {
    const res = await PaymentModel.deleteOne({ _id: id, merchantId });
    return res.deletedCount > 0;
  }
}

export const paymentRepository = new PaymentRepository();
