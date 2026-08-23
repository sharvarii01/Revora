import {
  whatsappProvider,
  emailProvider,
  smsProvider,
} from './providers/mockNotificationProvider';
import { notificationRepository } from '../repositories/notification.repository';
import logger from '../logs/logger';

export class NotificationService {
  async dispatchRecoveryNotification(params: {
    recoverySessionId: string;
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
    recipient: string;
    templateName?: string;
    messageBody: string;
    ctaUrl?: string;
  }) {
    const { recoverySessionId, channel, recipient, templateName, messageBody, ctaUrl } = params;

    // 1. Log notification in DB (status: SENT)
    const logRecord = await notificationRepository.create({
      recoverySessionId,
      channel,
      recipient,
      templateName: templateName || 'PAYMENT_COURTESY_ADVISORY',
      messageBody,
      ctaUrl,
      status: 'SENT',
    });

    // 2. Select channel provider
    let result;
    try {
      if (channel === 'WHATSAPP') {
        result = await whatsappProvider.send({ recipient, messageBody, ctaUrl });
      } else if (channel === 'EMAIL') {
        result = await emailProvider.send({ recipient, messageBody, ctaUrl });
      } else {
        result = await smsProvider.send({ recipient, messageBody, ctaUrl });
      }

      // 3. Update DB record to DELIVERED
      await notificationRepository.updateStatus(logRecord.id, 'DELIVERED', result.deliveredAt);

      logger.info({ recoverySessionId, channel, recipient }, '✅ Recovery notification dispatched.');
      return { success: true, logId: logRecord.id, messageId: result.messageId };
    } catch (err) {
      logger.error({ err, recoverySessionId }, '❌ Failed to dispatch notification:');
      await notificationRepository.updateStatus(logRecord.id, 'FAILED');
      return { success: false, logId: logRecord.id };
    }
  }
}

export const notificationService = new NotificationService();
