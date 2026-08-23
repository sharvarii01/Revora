import { retryQueue, RetryJobData } from '../queue/retryQueue';
import { recoveryRepository } from '../repositories/recovery.repository';
import { retryAttemptRepository } from '../repositories/retryAttempt.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { customerRepository } from '../repositories/customer.repository';
import { subscriptionRepository } from '../repositories/subscription.repository';
import logger from '../logs/logger';
import { v4 as uuidv4 } from 'uuid';

export function initRetryWorker() {
  retryQueue.setProcessor(async (job) => {
    const { recoverySessionId, merchantId, subscriptionId, attemptNumber, amount } = job.data as RetryJobData;
    logger.info({ recoverySessionId, attemptNumber }, '🚀 Executing scheduled AutoPay debit presentation...');

    const session = await recoveryRepository.findById(recoverySessionId);
    if (!session) return;

    // If user already paid via link or opted out, skip retry
    if (['RECOVERED_VIA_LINK', 'STOP_CUSTOMER_OPTED_OUT', 'STOP_MANUAL_CANCELLED'].includes(session.status)) {
      logger.info({ recoverySessionId }, '⏩ Recovery already resolved. Skipping scheduled retry.');
      return;
    }

    // In a real execution, Razorpay Subscriptions Charge API is called:
    // Here we simulate successful recovery or track the presentation
    const isMockSuccess = true; // In production, depends on bank response
    const mockPaymentId = `pay_${uuidv4().slice(0, 10)}`;

    if (isMockSuccess) {
      // 1. Mark Recovery as RECOVERED_AUTO_DEBIT
      await recoveryRepository.update(session.id, {
        status: 'RECOVERED_AUTO_DEBIT',
        recoveredAmount: amount,
        npciAttemptCount: attemptNumber,
      });

      // 2. Update Subscription & Customer
      await subscriptionRepository.updateStatus(subscriptionId, 'active');
      await customerRepository.incrementRecovered(session.customer.id, amount);

      // 3. Create Payment Record
      await paymentRepository.create({
        merchantId,
        customerId: session.customer.id,
        subscriptionId,
        razorpayPaymentId: mockPaymentId,
        amount,
        status: 'captured',
        method: 'upi_autopay',
        retryCount: attemptNumber,
      });

      // 4. Update Retry Attempt Record
      const attempts = await retryAttemptRepository.findBySessionId(session.id);
      const currentAttempt = attempts.find((a) => a.attemptNumber === attemptNumber);
      if (currentAttempt) {
        await retryAttemptRepository.update(currentAttempt.id, {
          status: 'success',
          executedAt: new Date(),
          razorpayPaymentId: mockPaymentId,
        });
      }

      // 5. Audit Log
      await auditLogRepository.create({
        merchantId,
        eventType: 'PAYMENT_CAPTURED',
        entityType: 'RECOVERY_SESSION',
        entityId: session.id,
        title: 'AutoPay Scheduled Retry Succeeded',
        description: `AutoPay presentation attempt ${attemptNumber} successfully settled ₹${amount}.`,
        customerName: session.customer.name,
        amount,
        status: 'SUCCESS',
        complianceTag: 'NPCI_OC136_COMPLIANT',
      });

      logger.info({ recoverySessionId, mockPaymentId }, '🎉 Payment successfully recovered via AutoPay.');
    }
  });
}
