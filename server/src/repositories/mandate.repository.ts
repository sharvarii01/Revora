import { MandateModel, IMandate } from '../models/Mandate.model';

export class MandateRepository {
  async findById(id: string): Promise<any | null> {
    const doc: any = await MandateModel.findById(id).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async findByRazorpayMandateId(razorpayMandateId: string): Promise<any | null> {
    const doc: any = await MandateModel.findOne({ razorpayMandateId }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async create(data: {
    customerId: string;
    razorpayMandateId: string;
    vpa?: string;
    bankName?: string;
    maxAmount: number;
    frequency?: string;
    status?: string;
  }): Promise<any> {
    const doc: any = await MandateModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async updateStatus(id: string, status: string): Promise<any | null> {
    const doc: any = await MandateModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }
}

export const mandateRepository = new MandateRepository();
