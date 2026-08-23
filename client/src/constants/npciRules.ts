export interface NpciCodeDetail {
  code: string;
  name: string;
  category: 'TRANSIENT' | 'ACTION_REQUIRED' | 'TERMINAL';
  description: string;
  recommendedAction: string;
  maxAttempts: number;
}

export const NPCI_FAILURE_CODES: Record<string, NpciCodeDetail> = {
  U30: {
    code: 'U30',
    name: 'Insufficient Balance',
    category: 'TRANSIENT',
    description: 'Debit failed due to insufficient funds in customer bank account',
    recommendedAction: 'Schedule retry after 24h cooldown in morning bank clearing window (09:15 AM)',
    maxAttempts: 3,
  },
  UT: {
    code: 'UT',
    name: 'Transaction Timeout',
    category: 'TRANSIENT',
    description: 'Remitter or beneficiary bank server timed out during presentation',
    recommendedAction: 'Schedule retry in next low-traffic banking window (T+24h)',
    maxAttempts: 3,
  },
  U54: {
    code: 'U54',
    name: 'Daily Amount Limit Exceeded',
    category: 'TRANSIENT',
    description: 'Customer reached daily UPI transaction limit on their bank account',
    recommendedAction: 'Schedule retry on next calendar day at 09:00 AM',
    maxAttempts: 3,
  },
  ZM: {
    code: 'ZM',
    name: 'Invalid MPIN / Authentication',
    category: 'ACTION_REQUIRED',
    description: 'Customer entered wrong MPIN or mandate authentication token expired',
    recommendedAction: 'Dispatch instant Razorpay Payment Link for one-click re-authentication',
    maxAttempts: 1,
  },
  U19: {
    code: 'U19',
    name: 'Transaction Frequency Limit',
    category: 'ACTION_REQUIRED',
    description: 'Bank account reached max debit frequency for the day',
    recommendedAction: 'Send Razorpay link or schedule retry after midnight',
    maxAttempts: 2,
  },
  ZG: {
    code: 'ZG',
    name: 'VPA Inactive / Revoked',
    category: 'TERMINAL',
    description: 'Virtual Payment Address has been deleted or blocked by PSP',
    recommendedAction: 'Hard Stop: Halt automated AutoPay debits immediately to avoid bank penalty',
    maxAttempts: 0,
  },
  U16: {
    code: 'U16',
    name: 'Risk Threshold Exceeded',
    category: 'TERMINAL',
    description: 'Account flagged by bank / NPCI fraud and risk monitoring systems',
    recommendedAction: 'Hard Stop: Close recovery and escalate to merchant risk review',
    maxAttempts: 0,
  },
  M4: {
    code: 'M4',
    name: 'Mandate Revoked by Customer',
    category: 'TERMINAL',
    description: 'Customer explicitly cancelled recurring mandate via UPI app / Netbanking',
    recommendedAction: 'Hard Stop: Immediately cease automated retries and record churn reason',
    maxAttempts: 0,
  },
};

export const NPCI_CONSTANTS = {
  MAX_CYCLE_ATTEMPTS: 3,
  MIN_COOLDOWN_HOURS: 24,
  OPTIMAL_BANKING_WINDOW_START_HOUR: 9, // 09:15 AM
  OPTIMAL_BANKING_WINDOW_START_MINUTE: 15,
  OPTIMAL_BANKING_WINDOW_END_HOUR: 11, // 11:30 AM
  OPTIMAL_BANKING_WINDOW_END_MINUTE: 30,
};
