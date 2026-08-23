import mongoose, { Schema, Document } from 'mongoose';

export interface IAbandonedCart extends Document {
  id: string;
  merchantId: string;
  customerId: string;
  itemsSummary: string;
  cartValue: number;
  currency: string;
  abandonedAt: Date;
  checkoutUrl?: string;
  status: 'abandoned' | 'recovered' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const AbandonedCartSchema = new Schema<IAbandonedCart>(
  {
    merchantId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    itemsSummary: { type: String, required: true },
    cartValue: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    abandonedAt: { type: Date, default: Date.now },
    checkoutUrl: { type: String, default: null },
    status: { type: String, enum: ['abandoned', 'recovered', 'expired'], default: 'abandoned' },
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

export const AbandonedCartModel =
  mongoose.models.AbandonedCart || mongoose.model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);
