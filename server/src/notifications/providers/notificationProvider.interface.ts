export interface SendNotificationOptions {
  recipient: string;
  templateName?: string;
  messageBody: string;
  ctaUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  deliveredAt: Date;
}

export interface INotificationProvider {
  send(options: SendNotificationOptions): Promise<NotificationResult>;
}
