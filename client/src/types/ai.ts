export interface AIInsightCard {
  id: string;
  category: 'PREDICTION' | 'REGULATORY_ALERT' | 'OPTIMIZATION' | 'PENALTY_PREVENTION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  impactMetric: string;
  confidenceScore: number;
  recommendedAction: string;
  actionPayload?: any;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  eventType:
    | 'PAYMENT_FAILED'
    | 'NPCI_VALIDATED'
    | 'AI_DECISION_RECORDED'
    | 'WHATSAPP_DISPATCHED'
    | 'LINK_GENERATED'
    | 'RETRY_SCHEDULED'
    | 'PAYMENT_CAPTURED'
    | 'RECOVERY_CLOSED'
    | 'MANUAL_OVERRIDE';
  title: string;
  description: string;
  customerName: string;
  amount: number;
  status: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  complianceTag?: string;
  metadata?: Record<string, any>;
}
