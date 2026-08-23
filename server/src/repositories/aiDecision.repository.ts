import { AIDecisionModel, IAIDecision } from '../models/AIDecision.model';

export class AIDecisionRepository {
  async findBySessionId(recoverySessionId: string): Promise<any[]> {
    const docs = await AIDecisionModel.find({ recoverySessionId }).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }

  async create(data: {
    recoverySessionId: string;
    modelName?: string;
    actionRecommended: string;
    recoveryScore: number;
    riskScore: number;
    confidence: number;
    optimalRetryTime?: Date;
    appliedOfferPct?: number;
    headline?: string;
    rationale: string;
    complianceRule: string;
    customerMessagePreview?: string;
    fullPromptPayload?: string;
    fullModelOutput?: string;
  }): Promise<any> {
    const doc = await AIDecisionModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }
}

export const aiDecisionRepository = new AIDecisionRepository();
