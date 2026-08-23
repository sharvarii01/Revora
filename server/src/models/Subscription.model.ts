import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  id: string;
  merchantId: string;
  customerId: string;
  mandateId?: string;
  razorpaySubId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextDueDate: Date;
  status: 'active' | 'past_due' | 'halted' | 'cancelled' | 'completed' | 'recovering';
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    merchantId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    mandateId: { type: String, default: null },
    razorpaySubId: { type: String, required: true, unique: true, index: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    billingCycle: { type: String, default: 'monthly' },
    nextDueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'past_due', 'halted', 'cancelled', 'completed', 'recovering'],
      default: 'active',
      index: true,
    },
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

export const SubscriptionModel =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
