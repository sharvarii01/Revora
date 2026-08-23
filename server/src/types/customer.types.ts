export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  vpa?: string;
  razorpayCustId?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  vpa?: string;
  optedOut?: boolean;
}

export interface CustomerProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  vpa?: string | null;
  memberSince: string;
  lifetimeValue: number;
  totalRecovered: number;
  totalLost: number;
  riskScore: number;
  recoveryProbability: number;
  healthScore: number;
  optedOut: boolean;
  activeSubscriptionsCount: number;
  paymentHistoryCount: number;
}
