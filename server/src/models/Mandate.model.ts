import mongoose, { Schema, Document } from 'mongoose';

export interface IMandate extends Document {
  id: string;
  customerId: string;
  razorpayMandateId: string;
  vpa?: string;
  bankName?: string;
  maxAmount: number;
  frequency: string;
  status: 'ACTIVE' | 'PAUSED' | 'REVOKED' | 'EXPIRED';
  createdAt: Date;
  updatedAt: Date;
}

const MandateSchema = new Schema<IMandate>(
  {
    customerId: { type: String, required: true, index: true },
    razorpayMandateId: { type: String, required: true, unique: true, index: true },
    vpa: { type: String, default: null },
    bankName: { type: String, default: 'HDFC Bank' },
    maxAmount: { type: Number, required: true },
    frequency: { type: String, default: 'monthly' },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'REVOKED', 'EXPIRED'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
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

export const MandateModel =
  mongoose.models.Mandate || mongoose.model<IMandate>('Mandate', MandateSchema);
