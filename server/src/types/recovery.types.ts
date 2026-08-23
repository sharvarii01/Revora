import { RecoveryStatusType, RecoveryType } from '../constants/recoveryStates';

export interface CreateRecoveryDto {
  merchantId: string;
  customerId: string;
  type: RecoveryType;
  subscriptionId?: string;
  cartId?: string;
  planOrItemName?: string;
  amount: number;
  failureCode?: string;
  failureDescription?: string;
}

export interface RecoveryFilterQuery {
  status?: string;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface RetryTimelineItem {
  id: string;
  attemptNumber: number;
  scheduledFor: string;
  executedAt?: string | null;
  status: string;
  errorCode?: string | null;
  errorDescription?: string | null;
  cooldownHoursMet: number;
}

export interface NotificationTimelineItem {
  id: string;
  channel: string;
  recipient: string;
  messageBody: string;
  ctaUrl?: string | null;
  status: string;
  timestamp: string;
}

export interface AIDecisionDto {
  model: string;
  action: string;
  recoveryScore: number;
  riskScore: number;
  confidence: number;
  optimalRetryTime?: string | null;
  appliedOfferPct?: number | null;
  headline: string;
  rationale: string;
  complianceRule: string;
  customerMessagePreview?: string | null;
}

export interface RecoveryDetailResponse {
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
  status: RecoveryStatusType;
  failureCode?: string | null;
  failureReason?: string | null;
  failureCategory?: string | null;
  currentAttempt: number;
  maxAttempts: number;
  nextRetryTime?: string | null;
  cooldownHoursRemaining: number;
  stopReason?: string | null;
  paymentLinkUrl?: string | null;
  aiDecision: AIDecisionDto;
  retryTimeline: RetryTimelineItem[];
  notificationHistory: NotificationTimelineItem[];
  createdAt: string;
  updatedAt: string;
}
