export const NPCI_LIMITS = {
  MAX_CYCLE_ATTEMPTS: 3,
  MIN_COOLDOWN_HOURS: 24,
  MAX_PRESENTATION_WINDOW_DAYS: 3,
  OPTIMAL_BANKING_HOUR: 9,
  OPTIMAL_BANKING_MINUTE: 15,
};

export type FailureBucket = 'TRANSIENT' | 'ACTION_REQUIRED' | 'TERMINAL';

export interface FailureCodeMeta {
  code: string;
  category: FailureBucket;
  name: string;
  description: string;
  allowRetry: boolean;
  recommendedAction: string;
}

export const FAILURE_CODE_CATALOG: Record<string, FailureCodeMeta> = {
  // Bucket 1: Transient (Auto-retry allowed after 24h cooldown)
  U30: {
    code: 'U30',
    category: 'TRANSIENT',
    name: 'Insufficient Funds',
    description: 'Debit failed due to low account balance. Statistically high recovery post salary cycle.',
    allowRetry: true,
    recommendedAction: 'SCHEDULE_RETRY_POST_24H_AND_NOTIFY',
  },
  UT: {
    code: 'UT',
    category: 'TRANSIENT',
    name: 'Transaction Timeout',
    description: 'Remitter or Beneficiary bank switch timed out.',
    allowRetry: true,
    recommendedAction: 'SCHEDULE_RETRY_NEXT_SETTLEMENT_WINDOW',
  },
  U54: {
    code: 'U54',
    category: 'TRANSIENT',
    name: 'Daily Amount Limit Exceeded',
    description: 'Customer daily UPI transaction ceiling reached.',
    allowRetry: true,
    recommendedAction: 'SCHEDULE_RETRY_NEXT_CALENDAR_DAY',
  },
  U69: {
    code: 'U69',
    category: 'TRANSIENT',
    name: 'Mandate Limit Exceeded',
    description: 'Cumulative per-mandate monthly spending cap hit.',
    allowRetry: true,
    recommendedAction: 'NOTIFY_MERCHANT_AND_SCHEDULE_SPLIT_LINK',
  },
  ZA: {
    code: 'ZA',
    category: 'TRANSIENT',
    name: 'Transaction Denied by Remitter Bank',
    description: 'Periodic bank core downtime or security hold.',
    allowRetry: true,
    recommendedAction: 'SCHEDULE_RETRY_POST_24H',
  },

  // Bucket 2: Action Required (Manual intervention via link needed)
  ZM: {
    code: 'ZM',
    category: 'ACTION_REQUIRED',
    name: 'Invalid MPIN / Auth Failure',
    description: 'Customer entered incorrect MPIN or authentication expired.',
    allowRetry: false,
    recommendedAction: 'DISPATCH_SMART_PAYMENT_LINK',
  },
  U19: {
    code: 'U19',
    category: 'ACTION_REQUIRED',
    name: 'Frequency Limit Exceeded',
    description: 'Max per-day transaction count for bank account reached.',
    allowRetry: false,
    recommendedAction: 'DISPATCH_MULTI_MODE_PAYMENT_LINK',
  },
  U68: {
    code: 'U68',
    category: 'ACTION_REQUIRED',
    name: 'Payment Mode Unsupported',
    description: 'Mandate execution unsupported on customer bank rail.',
    allowRetry: false,
    recommendedAction: 'DISPATCH_CARD_NETBANKING_LINK',
  },

  // Bucket 3: Hard Stop / Terminal (Immediate zero-retry halt)
  ZG: {
    code: 'ZG',
    category: 'TERMINAL',
    name: 'VPA Inactive / Revoked',
    description: 'Virtual Payment Address deleted or blocked by PSP.',
    allowRetry: false,
    recommendedAction: 'HALT_RECOVERY_TERMINAL_CODE',
  },
  U16: {
    code: 'U16',
    category: 'TERMINAL',
    name: 'Risk Threshold Exceeded',
    description: 'Account flagged for high fraud risk.',
    allowRetry: false,
    recommendedAction: 'HALT_RECOVERY_FRAUD_BLOCK',
  },
  M4: {
    code: 'M4',
    category: 'TERMINAL',
    name: 'Mandate Revoked by Customer',
    description: 'Customer cancelled mandate through bank/UPI app.',
    allowRetry: false,
    recommendedAction: 'HALT_RECOVERY_CUSTOMER_CANCELLED',
  },
  U28: {
    code: 'U28',
    category: 'TERMINAL',
    name: 'PSP Blacklisted / Unavailable',
    description: 'Payment Service Provider suspended by NPCI.',
    allowRetry: false,
    recommendedAction: 'HALT_RECOVERY_PSP_SUSPENDED',
  },
  Z9: {
    code: 'Z9',
    category: 'TERMINAL',
    name: 'Account Closed',
    description: 'Customer bank account closed or permanently frozen.',
    allowRetry: false,
    recommendedAction: 'HALT_RECOVERY_ACCOUNT_CLOSED',
  },
};

export const TERMINAL_FAILURE_CODES = ['ZG', 'U16', 'M4', 'U28', 'Z9'];
export const TRANSIENT_FAILURE_CODES = ['U30', 'UT', 'U54', 'U69', 'ZA'];
export const ACTION_REQUIRED_CODES = ['ZM', 'U19', 'U68'];
