import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  id: string;
  merchantId: string;
  razorpayCustId?: string;
  name: string;
  email: string;
  phone: string;
  vpa?: string;
  optedOut: boolean;
  riskScore: number;
  healthScore: number;
  recoveryProbability: number;
  lifetimeRecovered: number;
  lifetimeLost: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    merchantId: { type: String, required: true, index: true },
    razorpayCustId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    vpa: { type: String, default: null },
    optedOut: { type: Boolean, default: false },
    riskScore: { type: Number, default: 15 },
    healthScore: { type: Number, default: 85 },
    recoveryProbability: { type: Number, default: 80 },
    lifetimeRecovered: { type: Number, default: 0.0 },
    lifetimeLost: { type: Number, default: 0.0 },
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

CustomerSchema.index({ merchantId: 1, email: 1 });
CustomerSchema.index({ merchantId: 1, phone: 1 });

export const CustomerModel =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
