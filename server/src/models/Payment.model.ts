import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  merchantId: string;
  customerId: string;
  subscriptionId?: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  currency: string;
  paymentType: 'ONE_TIME' | 'SUBSCRIPTION' | 'CHECKOUT';
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method: string;
  bank?: string;
  vpa?: string;
  mandateId?: string;
  failureCode?: string;
  errorCode?: string;
  errorDescription?: string;
  retryCount: number;
  recoveryStage?: string;
  recoveryProbability?: number;
  aiScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    merchantId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    subscriptionId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true, index: true },
    razorpayOrderId: { type: String, default: null, index: true },
    customerName: { type: String, default: 'Customer' },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentType: {
      type: String,
      enum: ['ONE_TIME', 'SUBSCRIPTION', 'CHECKOUT', 'SUBSCRIPTION_AUTOPAY', 'CHECKOUT_ABANDONMENT'],
      default: 'SUBSCRIPTION',
      index: true,
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      required: true,
      index: true,
    },
    method: { type: String, default: 'upi_autopay' },
    bank: { type: String, default: null },
    vpa: { type: String, default: null },
    mandateId: { type: String, default: null },
    failureCode: { type: String, default: null, index: true },
    errorCode: { type: String, default: null },
    errorDescription: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
    recoveryStage: { type: String, default: 'ANALYZING_AI' },
    recoveryProbability: { type: Number, default: 85 },
    aiScore: { type: Number, default: 88 },
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

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
