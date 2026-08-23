import { ResilientQueue } from './queueManager';

export interface RetryJobData {
  recoverySessionId: string;
  merchantId: string;
  subscriptionId: string;
  attemptNumber: number;
  razorpayMandateId: string;
  amount: number;
}

export const retryQueue = new ResilientQueue<RetryJobData>('autopay-retry-presentation-queue');
