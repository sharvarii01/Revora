import mongoose, { Schema, Document } from 'mongoose';

export interface IRetryAttempt extends Document {
  id: string;
  recoverySessionId: string;
  attemptNumber: number;
  scheduledFor: Date;
  executedAt?: Date;
  status: 'scheduled' | 'success' | 'failed' | 'skipped_user_paid';
  razorpayPaymentId?: string;
  errorCode?: string;
  errorDescription?: string;
  cooldownHoursMet: number;
  createdAt: Date;
}

const RetryAttemptSchema = new Schema<IRetryAttempt>(
  {
    recoverySessionId: { type: String, required: true, index: true },
    attemptNumber: { type: Number, required: true },
    scheduledFor: { type: Date, required: true },
    executedAt: { type: Date, default: null },
    status: { type: String, enum: ['scheduled', 'success', 'failed', 'skipped_user_paid'], default: 'scheduled' },
    razorpayPaymentId: { type: String, default: null },
    errorCode: { type: String, default: null },
    errorDescription: { type: String, default: null },
    cooldownHoursMet: { type: Number, default: 0.0 },
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

RetryAttemptSchema.index({ recoverySessionId: 1, attemptNumber: 1 });

export const RetryAttemptModel =
  mongoose.models.RetryAttempt || mongoose.model<IRetryAttempt>('RetryAttempt', RetryAttemptSchema);
