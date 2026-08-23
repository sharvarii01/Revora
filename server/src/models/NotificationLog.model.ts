import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  id: string;
  recoverySessionId: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  recipient: string;
  templateName: string;
  messageBody: string;
  ctaUrl?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'LINK_CLICKED' | 'FAILED';
  deliveredAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationLog>(
  {
    recoverySessionId: { type: String, required: true, index: true },
    channel: { type: String, enum: ['WHATSAPP', 'SMS', 'EMAIL'], required: true },
    recipient: { type: String, required: true },
    templateName: { type: String, default: 'PAYMENT_FAILED_COURTESY' },
    messageBody: { type: String, required: true },
    ctaUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'READ', 'LINK_CLICKED', 'FAILED'],
      default: 'SENT',
      index: true,
    },
    deliveredAt: { type: Date, default: null },
    clickedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NotificationLogModel =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>('NotificationLog', NotificationSchema);
