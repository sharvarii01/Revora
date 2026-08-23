import mongoose, { Schema, Document } from 'mongoose';

export interface IAIDecision extends Document {
  id: string;
  recoverySessionId: string;
  modelName: string;
  actionRecommended: string;
  recoveryScore: number;
  riskScore: number;
  confidence: number;
  optimalRetryTime?: Date;
  appliedOfferPct?: number;
  headline: string;
  rationale: string;
  complianceRule: string;
  customerMessagePreview?: string;
  fullPromptPayload?: string;
  fullModelOutput?: string;
  createdAt: Date;
}

const AIDecisionSchema = new Schema<IAIDecision>(
  {
    recoverySessionId: { type: String, required: true, index: true },
    modelName: { type: String, default: 'gemini-2.5-flash' },
    actionRecommended: { type: String, required: true },
    recoveryScore: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    confidence: { type: Number, required: true },
    optimalRetryTime: { type: Date, default: null },
    appliedOfferPct: { type: Number, default: null },
    headline: { type: String, default: 'AI Recovery Assessment' },
    rationale: { type: String, required: true },
    complianceRule: { type: String, required: true },
    customerMessagePreview: { type: String, default: null },
    fullPromptPayload: { type: String, default: null },
    fullModelOutput: { type: String, default: null },
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

export const AIDecisionModel =
  mongoose.models.AIDecision || mongoose.model<IAIDecision>('AIDecision', AIDecisionSchema);
