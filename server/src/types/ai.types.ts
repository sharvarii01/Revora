export interface AIContextVector {
  eventType: string;
  failureCode?: string;
  failureDescription?: string;
  customerProfile: {
    id: string;
    name: string;
    riskScore: number;
    healthScore: number;
    lifetimeRecovered: number;
    optedOut: boolean;
  };
  transactionDetails: {
    amount: number;
    type: string;
    planOrItemName: string;
    currentAttempt: number;
    maxAttempts: number;
    lastAttemptTime: Date;
    mandateDueDate?: Date;
  };
  merchantPolicy: {
    maxDiscountPct: number;
    autoRecoveryEnabled: boolean;
  };
}

export interface AIReasoningOutput {
  action: string;
  strategyType: string;
  recommendedTimestamp: Date | null;
  recommendedChannel: string;
  offerAppliedPct: number | null;
  recoveryScore: number;
  riskScore: number;
  confidence: number;
  complianceRule: string;
  headline: string;
  rationale: string;
  merchantSummary: string;
  customerMessagePreview: string;
}

export interface AIInsightCard {
  id: string;
  category: 'PREDICTION' | 'REGULATORY_ALERT' | 'OPTIMIZATION' | 'PENALTY_PREVENTION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  impactMetric: string;
  confidenceScore: number;
  recommendedAction: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  eventType: string;
  title: string;
  description: string;
  customerName: string;
  amount: number;
  status: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  complianceTag?: string;
  metadata?: Record<string, unknown>;
}
