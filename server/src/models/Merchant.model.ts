import mongoose, { Schema, Document } from 'mongoose';

export interface IMerchant extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  businessName: string;
  environment: 'TEST' | 'LIVE';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  webhookSecret?: string;
  maxDiscountPct: number;
  autoRecoveryEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantSchema = new Schema<IMerchant>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    businessName: { type: String, default: 'Merchant Business' },
    environment: { type: String, enum: ['TEST', 'LIVE'], default: 'LIVE' },
    razorpayKeyId: { type: String, default: null },
    razorpayKeySecret: { type: String, default: null },
    webhookSecret: { type: String, default: null },
    maxDiscountPct: { type: Number, default: 10.0 },
    autoRecoveryEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const MerchantModel =
  mongoose.models.Merchant || mongoose.model<IMerchant>('Merchant', MerchantSchema);
