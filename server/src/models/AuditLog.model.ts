import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  id: string;
  merchantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  customerName?: string;
  amount?: number;
  status: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  metadataJson?: string;
  complianceTag?: string;
  complianceHash?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    merchantId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    title: { type: String, default: 'Audit Event' },
    description: { type: String, required: true },
    customerName: { type: String, default: null },
    amount: { type: Number, default: null },
    status: { type: String, enum: ['SUCCESS', 'WARNING', 'DANGER', 'INFO'], default: 'INFO' },
    metadataJson: { type: String, default: null },
    complianceTag: { type: String, default: null },
    complianceHash: { type: String, default: null },
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

AuditLogSchema.index({ merchantId: 1, eventType: 1 });
AuditLogSchema.index({ merchantId: 1, createdAt: -1 });

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
