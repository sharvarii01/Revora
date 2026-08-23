export interface RevenueSummaryMetrics {
  totalRevenue: number;
  recoveredRevenue: number;
  moneyLeakageToday: number;
  recoverySuccessRate: number;
  failedPaymentsCount: number;
  failedPaymentsAmount: number;
  failedSubscriptionsCount: number;
  recoveredCustomersCount: number;
  aiHealthScore: number;
  npciComplianceRate: number;
  npciViolationsPrevented: number;
  averageRetriesToSuccess: number;
}

export interface RevenueTimeseriesPoint {
  date: string;
  totalRevenue: number;
  failedRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
}

export interface FailureReasonStat {
  code: string;
  name: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
}

export interface ChannelEfficiencyStat {
  channel: string;
  attempts: number;
  recoveredAmount: number;
  conversionRate: number;
}
