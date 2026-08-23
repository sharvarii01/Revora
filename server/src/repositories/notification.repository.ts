import { NotificationLogModel, INotificationLog } from '../models/NotificationLog.model';

export class NotificationRepository {
  async findBySessionId(recoverySessionId: string): Promise<any[]> {
    const docs = await NotificationLogModel.find({ recoverySessionId }).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }

  async create(data: {
    recoverySessionId: string;
    channel: string;
    recipient: string;
    templateName?: string;
    messageBody: string;
    ctaUrl?: string;
    status?: string;
  }): Promise<any> {
    const doc: any = await NotificationLogModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async updateStatus(
    id: string,
    status: string,
    deliveredAt?: Date,
    clickedAt?: Date
  ): Promise<any | null> {
    const doc: any = await NotificationLogModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          ...(deliveredAt ? { deliveredAt } : {}),
          ...(clickedAt ? { clickedAt } : {}),
        },
      },
      { new: true }
    ).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }
}

export const notificationRepository = new NotificationRepository();
