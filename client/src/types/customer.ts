export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vpa?: string;
  memberSince: string;
  lifetimeValue: number;
  totalRecovered: number;
  totalLost: number;
  riskScore: number; // 0-100
  recoveryProbability: number; // 0-100
  healthScore: number; // 0-100
  optedOut: boolean;
  activeSubscriptionsCount: number;
  paymentHistoryCount: number;
}
