export type RecoveryType = 'SUBSCRIPTION_AUTOPAY' | 'CHECKOUT_ABANDONMENT';

export type RecoveryStatus =
  | 'ANALYZING_AI'
  | 'SCHEDULED_RETRY'
  | 'PAYMENT_LINK_SENT'
  | 'RETRY_IN_PROGRESS'
  | 'RECOVERED_AUTO_DEBIT'
  | 'RECOVERED_VIA_LINK'
  | 'STOP_NPCI_LIMIT_REACHED'
  | 'STOP_TERMINAL_FAILURE'
  | 'STOP_CUSTOMER_OPTED_OUT'
  | 'STOP_DISCOUNT_FLOOR_EXCEEDED'
  | 'STOP_MANUAL_CANCELLED';

export interface RetryTimelineEvent {
  attemptNumber: number;
  scheduledFor: string;
  executedAt?: string | null;
  status: 'scheduled' | 'success' | 'failed' | 'skipped_user_paid';
  errorCode?: string | null;
  errorDescription?: string | null;
  cooldownHoursMet: number;
}

export interface NotificationTimelineEvent {
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  recipient: string;
  messageBody: string;
  ctaUrl?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'LINK_CLICKED' | 'FAILED';
  timestamp: string;
}

export interface AIDecisionDetail {
  model: string;
  action: string;
  recoveryScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  confidence: number; // 0.0 - 1.0
  optimalRetryTime?: string | null;
  appliedOfferPct?: number | null;
  headline: string;
  rationale: string;
  complianceRule: string;
  customerMessagePreview: string;
}

export interface RecoveryRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: RecoveryType;
  planOrItemName: string;
  amount: number;
  recoveredAmount: number;
  appliedDiscountPct: number;
  status: RecoveryStatus;
  
  failureCode?: string | null;
  failureReason?: string | null;
  failureCategory?: 'TRANSIENT' | 'ACTION_REQUIRED' | 'TERMINAL';
  
  currentAttempt: number;
  maxAttempts: number;
  nextRetryTime?: string | null;
  cooldownHoursRemaining?: number;
  stopReason?: string | null;
  
  paymentLinkUrl?: string | null;
  
  aiDecision: AIDecisionDetail;
  retryTimeline: RetryTimelineEvent[];
  notificationHistory: NotificationTimelineEvent[];
  
  createdAt: string;
  updatedAt: string;
}
