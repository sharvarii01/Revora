import { RetryAttemptModel, IRetryAttempt } from '../models/RetryAttempt.model';

export class RetryAttemptRepository {
  async findBySessionId(recoverySessionId: string): Promise<any[]> {
    const docs = await RetryAttemptModel.find({ recoverySessionId }).sort({ attemptNumber: 1 }).lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }

  async create(data: {
    recoverySessionId: string;
    attemptNumber: number;
    scheduledFor: Date;
    executedAt?: Date;
    status: string;
    razorpayPaymentId?: string;
    errorCode?: string;
    errorDescription?: string;
    cooldownHoursMet?: number;
  }): Promise<any> {
    const doc: any = await RetryAttemptModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async update(id: string, data: Partial<IRetryAttempt>): Promise<any | null> {
    const doc: any = await RetryAttemptModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }
}

export const retryAttemptRepository = new RetryAttemptRepository();
