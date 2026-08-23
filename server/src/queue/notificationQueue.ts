import { ResilientQueue } from './queueManager';

export interface NotificationJobData {
  recoverySessionId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  recipient: string;
  templateName?: string;
  messageBody: string;
  ctaUrl?: string;
}

export const notificationQueue = new ResilientQueue<NotificationJobData>('notification-dispatch-queue');
