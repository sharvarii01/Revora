import { notificationQueue, NotificationJobData } from '../queue/notificationQueue';
import { notificationService } from '../notifications/notificationService';
import logger from '../logs/logger';

export function initNotificationWorker() {
  notificationQueue.setProcessor(async (job) => {
    const { recoverySessionId, channel, recipient, templateName, messageBody, ctaUrl } =
      job.data as NotificationJobData;

    logger.info({ recoverySessionId, channel, recipient }, '📨 Processing notification dispatch job...');

    await notificationService.dispatchRecoveryNotification({
      recoverySessionId,
      channel,
      recipient,
      templateName,
      messageBody,
      ctaUrl,
    });
  });
}
