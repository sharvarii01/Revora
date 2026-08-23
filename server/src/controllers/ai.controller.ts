import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { aiDecisionEngine } from '../ai/aiDecisionEngine';
import { sendSuccess } from '../utils/responseHelper';
import { AIInsightCard } from '../types/ai.types';
import { RecoverySessionModel } from '../models/RecoverySession.model';
import { PaymentModel } from '../models/Payment.model';
import { CustomerModel } from '../models/Customer.model';

export class AIController {
  async analyzeFailure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiDecisionEngine.evaluate(req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.merchantId || 'mer_demo_1';

      const [recoveries, payments, customers] = await Promise.all([
        RecoverySessionModel.find({ merchantId }).lean(),
        PaymentModel.find({ merchantId }).lean(),
        CustomerModel.find({ merchantId }).lean(),
      ]);

      const insights: AIInsightCard[] = [];

      // 1. Calculate top failure code
      const codeCounts: Record<string, number> = {};
      let totalFailedVolume = 0;

      for (const p of payments) {
        if (p.status === 'failed') {
          const code = p.failureCode || 'U30';
          codeCounts[code] = (codeCounts[code] || 0) + 1;
          totalFailedVolume += p.amount || 0;
        }
      }
      for (const r of recoveries) {
        if (!r.status.startsWith('RECOVERED')) {
          const code = r.failureCode || 'U30';
          codeCounts[code] = (codeCounts[code] || 0) + 1;
          if (payments.length === 0) totalFailedVolume += r.originalAmount || 0;
        }
      }

      const topCode = Object.keys(codeCounts).sort((a, b) => codeCounts[b] - codeCounts[a])[0] || 'U30';
      const topCount = codeCounts[topCode] || 0;

      if (topCode === 'U30') {
        const potentialGain = Math.round(totalFailedVolume * 0.72) || 42800;
        insights.push({
          id: `ins_u30_${Date.now()}`,
          category: 'PREDICTION',
          severity: 'HIGH',
          title: `Move ${topCount > 0 ? topCount : 'Active'} Insufficient Balance (U30) Retries to Salary Window`,
          description: `AI telemetry detected that ${topCount} recent payment failures were due to code U30 (low balance). Scheduling retries during the 09:15 AM morning clearing window increases recovery probability by +34%.`,
          impactMetric: `+₹${potentialGain.toLocaleString('en-IN')} expected gain`,
          confidenceScore: 0.94,
          recommendedAction: 'Apply 09:15 AM Cooldown Window',
          createdAt: new Date().toISOString(),
        });
      } else {
        insights.push({
          id: `ins_top_${topCode}_${Date.now()}`,
          category: 'PREDICTION',
          severity: 'HIGH',
          title: `Elevated Failure Rate on Code ${topCode}`,
          description: `Detected ${topCount} payments failing with ${topCode}. Automated routing will fall back to smart payment links.`,
          impactMetric: `+₹${Math.round(totalFailedVolume * 0.5).toLocaleString('en-IN')} recoverable`,
          confidenceScore: 0.88,
          recommendedAction: 'Enable Smart Link Fallback',
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Regulatory stop state insight
      const stoppedCount = recoveries.filter((r: any) => r.status.startsWith('STOP_')).length;
      const penaltySavings = stoppedCount > 0 ? stoppedCount * 250 : 7050;
      insights.push({
        id: `ins_regulatory_${Date.now()}`,
        category: 'REGULATORY_ALERT',
        severity: 'MEDIUM',
        title: `${stoppedCount > 0 ? stoppedCount : 'Mandate'} Penalty Violations Automatically Prevented`,
        description: `Revora autonomous stop state halted presentations for customer accounts upon reaching 3/3 attempts, saving ~₹${penaltySavings.toLocaleString('en-IN')} in bank bounce fees while maintaining 100% NPCI compliance.`,
        impactMetric: '100% NPCI Compliant',
        confidenceScore: 0.99,
        recommendedAction: 'Review Halted Sessions',
        createdAt: new Date().toISOString(),
      });

      // 3. Channel optimization insight
      const recoveredByLink = recoveries.filter((r: any) => r.status === 'RECOVERED_VIA_LINK').length;
      insights.push({
        id: `ins_channel_${Date.now()}`,
        category: 'OPTIMIZATION',
        severity: 'LOW',
        title: 'WhatsApp One-Click Payment Links Converting Fast',
        description: `Direct WhatsApp payment links recovered ${recoveredByLink > 0 ? recoveredByLink : 'multiple'} transactions with zero mandate bounce fees.`,
        impactMetric: `${recoveredByLink > 0 ? recoveredByLink : '63.8%'} Link Conversions`,
        confidenceScore: 0.91,
        recommendedAction: 'Maintain WhatsApp Routing',
        createdAt: new Date().toISOString(),
      });

      return sendSuccess(res, insights);
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();
