import { ResilientQueue } from './queueManager';

export interface RecoveryJobData {
  recoverySessionId: string;
  merchantId: string;
  eventType: string;
  failureCode?: string;
  failureDescription?: string;
}

export const recoveryQueue = new ResilientQueue<RecoveryJobData>('recovery-evaluation-queue');
