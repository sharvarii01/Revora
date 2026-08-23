export interface CreateSubscriptionDto {
  customerId: string;
  razorpaySubId: string;
  planName: string;
  amount: number;
  currency?: string;
  billingCycle?: string;
  nextDueDate: Date;
  mandate?: {
    razorpayMandateId: string;
    vpa?: string;
    bankName?: string;
    maxAmount: number;
    frequency?: string;
  };
}

export interface SubscriptionRecordDto {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextDueDate: string;
  status: string;
  mandate?: {
    id: string;
    razorpayMandateId: string;
    vpa?: string | null;
    bankName?: string | null;
    maxAmount: number;
    frequency: string;
    status: string;
  } | null;
  currentAttempt: number;
  maxAttempts: number;
  recoverySessionId?: string | null;
  lastFailureCode?: string | null;
}
