import mongoose, { Schema, Document } from 'mongoose';

export interface IRecoverySession extends Document {
  id: string;
  merchantId: string;
  customerId: string;
  type: 'SUBSCRIPTION_AUTOPAY' | 'CHECKOUT_ABANDONMENT';
  status: string;
  paymentId?: string;
  subscriptionId?: string;
  cartId?: string;
  planOrItemName: string;
  originalAmount: number;
  recoveredAmount: number;
  appliedDiscountPct: number;
  failureCode?: string;
  failureCategory?: 'TRANSIENT' | 'ACTION_REQUIRED' | 'TERMINAL';
  failureDescription?: string;
  npciAttemptCount: number;
  maxNpciAttempts: number;
  nextScheduledRetry?: Date;
  cooldownHoursRemaining: number;
  stopReason?: string;
  razorpayPaymentLinkId?: string;
  paymentLinkUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecoverySessionSchema = new Schema<IRecoverySession>(
  {
    merchantId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    type: { type: String, enum: ['SUBSCRIPTION_AUTOPAY', 'CHECKOUT_ABANDONMENT'], required: true, index: true },
    status: { type: String, default: 'ANALYZING_AI', index: true },
    paymentId: { type: String, default: null, index: true },
    subscriptionId: { type: String, default: null, index: true },
    cartId: { type: String, default: null },
    planOrItemName: { type: String, default: 'Subscription Renewal' },
    originalAmount: { type: Number, required: true },
    recoveredAmount: { type: Number, default: 0.0 },
    appliedDiscountPct: { type: Number, default: 0.0 },
    failureCode: { type: String, default: null, index: true },
    failureCategory: { type: String, enum: ['TRANSIENT', 'ACTION_REQUIRED', 'TERMINAL'], default: 'TRANSIENT' },
    failureDescription: { type: String, default: null },
    npciAttemptCount: { type: Number, default: 0 },
    maxNpciAttempts: { type: Number, default: 3 },
    nextScheduledRetry: { type: Date, default: null },
    cooldownHoursRemaining: { type: Number, default: 0.0 },
    stopReason: { type: String, default: null },
    razorpayPaymentLinkId: { type: String, default: null },
    paymentLinkUrl: { type: String, default: null },
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

RecoverySessionSchema.index({ merchantId: 1, status: 1 });
RecoverySessionSchema.index({ merchantId: 1, createdAt: -1 });

export const RecoverySessionModel =
  mongoose.models.RecoverySession || mongoose.model<IRecoverySession>('RecoverySession', RecoverySessionSchema);
