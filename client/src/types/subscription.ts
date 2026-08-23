export type MandateStatus = 'ACTIVE' | 'PAUSED' | 'REVOKED' | 'EXPIRED';

export interface MandateDetail {
  id: string;
  razorpayMandateId: string;
  vpa?: string;
  bankName?: string;
  maxAmount: number;
  frequency: string;
  status: MandateStatus;
}

export interface SubscriptionRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  nextDueDate: string;
  status: 'active' | 'past_due' | 'halted' | 'cancelled' | 'recovering';
  mandate: MandateDetail;
  currentAttempt: number;
  maxAttempts: number;
  recoverySessionId?: string | null;
  lastFailureCode?: string | null;
}
