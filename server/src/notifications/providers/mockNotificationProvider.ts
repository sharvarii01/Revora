import {
  INotificationProvider,
  NotificationResult,
  SendNotificationOptions,
} from './notificationProvider.interface';
import logger from '../../logs/logger';
import { v4 as uuidv4 } from 'uuid';

export class WhatsAppProvider implements INotificationProvider {
  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    logger.info(
      { to: options.recipient, cta: options.ctaUrl },
      ' [WhatsApp Adapter] Message dispatched successfully.'
    );
    return {
      success: true,
      messageId: `wa_${uuidv4().slice(0, 8)}`,
      channel: 'WHATSAPP',
      deliveredAt: new Date(),
    };
  }
}

export class EmailProvider implements INotificationProvider {
  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    logger.info(
      { to: options.recipient, cta: options.ctaUrl },
      '📧 [Email Adapter] Email dispatched successfully.'
    );
    return {
      success: true,
      messageId: `em_${uuidv4().slice(0, 8)}`,
      channel: 'EMAIL',
      deliveredAt: new Date(),
    };
  }
}

export class SMSProvider implements INotificationProvider {
  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    logger.info(
      { to: options.recipient },
      '📱 [SMS Adapter] SMS dispatched successfully.'
    );
    return {
      success: true,
      messageId: `sms_${uuidv4().slice(0, 8)}`,
      channel: 'SMS',
      deliveredAt: new Date(),
    };
  }
}

export const whatsappProvider = new WhatsAppProvider();
export const emailProvider = new EmailProvider();
export const smsProvider = new SMSProvider();
