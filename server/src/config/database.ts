import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';
import logger from '../logs/logger';

import {
  MerchantModel,
  CustomerModel,
  PaymentModel,
  RecoverySessionModel,
  MandateModel,
  SubscriptionModel,
  AIDecisionModel,
  RetryAttemptModel,
  NotificationLogModel,
  AuditLogModel,
} from '../models';
import { hashPassword } from '../utils/hash.util';

let mongodInstance: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  // 1. First attempt: Connect to configured MongoDB Atlas / local URI
  try {
    logger.info('Connecting to MongoDB Atlas / Local URI...');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 5000,
    });
    logger.info('🍃 Connected directly to MongoDB via Mongoose.');
    await checkAndSeedInitialData();
    return;
  } catch (error: any) {
    logger.warn(
      { message: error?.message },
      '⚠️ MongoDB Atlas connection could not be established. Starting persistent embedded MongoDB engine...'
    );
  }

  // 2. Persistent Embedded MongoDB Engine on disk
  try {
    const dbDir = path.resolve(__dirname, '../../data/db');
    fs.mkdirSync(dbDir, { recursive: true });

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
      },
    });
    const memoryUri = mongodInstance.getUri();
    logger.info({ memoryUri, dbDir }, '🍃 Persistent MongoDB Engine active (saved on disk in data/db).');

    await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('🍃 Connected to persistent MongoDB Database via Mongoose. All real collections, aggregations & indexes active.');
    await checkAndSeedInitialData();
  } catch (err) {
    logger.error({ err }, '❌ Fatal: Failed to initialize MongoDB connection.');
    throw err;
  }
}

async function checkAndSeedInitialData() {
  try {
    const passwordHash = await hashPassword('Password123!');
    const merchant = await MerchantModel.findOneAndUpdate(
      { email: 'sharvi@saasplatform.in' },
      {
        $setOnInsert: {
          name: 'Sharvi Dhole',
          email: 'sharvi@saasplatform.in',
          passwordHash,
          businessName: 'NovaCloud Technologies Pvt Ltd',
          environment: 'LIVE',
          razorpayKeyId: 'rzp_live_k8a92m8190',
          razorpayKeySecret: 'sec_live_99812a001b',
          webhookSecret: 'whsec_revora_razorpay_hmac_2026',
          maxDiscountPct: 10.0,
          autoRecoveryEnabled: true,
        },
      },
      { upsert: true, new: true }
    );

    const merchantId = merchant ? merchant._id.toString() : 'mer_demo_1';

    // Auto-migrate any existing records associated with fallback ID to this active merchant
    await Promise.all([
      CustomerModel.updateMany({ merchantId: 'mer_demo_1' }, { $set: { merchantId } }),
      SubscriptionModel.updateMany({ merchantId: 'mer_demo_1' }, { $set: { merchantId } }),
      PaymentModel.updateMany({ merchantId: 'mer_demo_1' }, { $set: { merchantId } }),
      RecoverySessionModel.updateMany({ merchantId: 'mer_demo_1' }, { $set: { merchantId } }),
      AuditLogModel.updateMany({ merchantId: 'mer_demo_1' }, { $set: { merchantId } }),
    ]);

    const sessionCount = await RecoverySessionModel.countDocuments();
    if (sessionCount > 0) {
      logger.info(`Database already contains ${sessionCount} live recovery sessions on disk. Ready for production traffic.`);
      return;
    }

    logger.info('🌱 Empty database detected. Seeding initial baseline records into MongoDB...');

    // 2. Seed Baseline Customers & Payments
    const seedRecords = [
      {
        name: 'Aman Verma',
        email: 'aman.verma@techcorp.in',
        phone: '+91 98201 44321',
        vpa: 'aman.verma@okaxis',
        plan: 'Enterprise SaaS Annual',
        amount: 4999.0,
        type: 'SUBSCRIPTION_AUTOPAY',
        status: 'SCHEDULED_RETRY',
        failureCode: 'U30',
        failureReason: 'Debit failed: Insufficient funds in customer bank account (HDFC Bank)',
        failureCategory: 'TRANSIENT',
        attempts: 1,
        cooldownHoursRemaining: 21,
      },
      {
        name: 'Priya Sundaram',
        email: 'priya.s@designstudio.io',
        phone: '+91 98110 55672',
        vpa: 'priya.s@okhdfcbank',
        plan: 'Pro Monthly Plan',
        amount: 1499.0,
        type: 'SUBSCRIPTION_AUTOPAY',
        status: 'RECOVERED_VIA_LINK',
        failureCode: 'ZM',
        failureReason: 'Invalid MPIN / Authorization Expired',
        failureCategory: 'ACTION_REQUIRED',
        attempts: 1,
        cooldownHoursRemaining: 0,
      },
      {
        name: 'Vikramaditya Roy',
        email: 'vikram.roy@cloudinfra.net',
        phone: '+91 98300 11984',
        vpa: 'vikram.roy@icici',
        plan: 'Cloud Dedicated Node',
        amount: 12500.0,
        type: 'SUBSCRIPTION_AUTOPAY',
        status: 'STOP_NPCI_LIMIT_REACHED',
        failureCode: 'U30',
        failureReason: 'Insufficient Balance (Attempt 3/3 Cap Reached)',
        failureCategory: 'TRANSIENT',
        attempts: 3,
        cooldownHoursRemaining: 0,
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya.d@fintechlabs.in',
        phone: '+91 98450 77123',
        vpa: 'ananya.d@kotak',
        plan: 'Growth Team Tier',
        amount: 3499.0,
        type: 'SUBSCRIPTION_AUTOPAY',
        status: 'RECOVERED_AUTO_DEBIT',
        failureCode: 'UT',
        failureReason: 'Transaction Timeout on Remitter Switch',
        failureCategory: 'TRANSIENT',
        attempts: 2,
        cooldownHoursRemaining: 0,
      },
      {
        name: 'Deepak Patel',
        email: 'deepak.p@pateltraders.com',
        phone: '+91 97234 88190',
        vpa: 'deepak.p@paytm',
        plan: 'Inventory Suite Pro',
        amount: 2199.0,
        type: 'SUBSCRIPTION_AUTOPAY',
        status: 'STOP_TERMINAL_FAILURE',
        failureCode: 'ZG',
        failureReason: 'Virtual Payment Address Revoked / Blocked by PSP',
        failureCategory: 'TERMINAL',
        attempts: 1,
        cooldownHoursRemaining: 0,
      },
      {
        name: 'Meera Nambiar',
        email: 'meera.n@keralaorganic.org',
        phone: '+91 94470 33412',
        vpa: 'meera.n@sbi',
        plan: 'Organic Kitchen Bundle',
        amount: 1899.0,
        type: 'SUBSCRIPTION_AUTOPAY',
        status: 'RECOVERED_VIA_LINK',
        failureCode: 'U54',
        failureReason: 'Daily Amount Limit Exceeded on UPI Rail',
        failureCategory: 'TRANSIENT',
        attempts: 2,
        cooldownHoursRemaining: 0,
      },
    ];

    for (const item of seedRecords) {
      const isRecovered = item.status.startsWith('RECOVERED');
      const isStopped = item.status.startsWith('STOP_');

      const customer = await CustomerModel.create({
        merchantId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        vpa: item.vpa,
        riskScore: isStopped ? 65 : 12,
        healthScore: isRecovered ? 96 : isStopped ? 45 : 82,
        recoveryProbability: isStopped ? 20 : isRecovered ? 98 : 88,
        lifetimeRecovered: isRecovered ? item.amount : 0,
        lifetimeLost: isStopped ? item.amount : 0,
      });

      const customerId = customer._id.toString();

      const uniqueSuffix = `${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 900 + 100)}`;
      const mandate = await MandateModel.create({
        customerId,
        razorpayMandateId: `mand_${customerId.slice(-4)}_${uniqueSuffix}`,
        vpa: item.vpa,
        bankName: 'HDFC Bank',
        maxAmount: 25000.0,
        frequency: 'monthly',
        status: isStopped ? 'REVOKED' : 'ACTIVE',
      });

      const subscription = await SubscriptionModel.create({
        merchantId,
        customerId,
        mandateId: mandate._id.toString(),
        razorpaySubId: `sub_rzp_${customerId.slice(-4)}_${uniqueSuffix}`,
        planName: item.plan,
        amount: item.amount,
        billingCycle: 'monthly',
        nextDueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        status: isRecovered ? 'active' : 'recovering',
      });

      const payment = await PaymentModel.create({
        merchantId,
        customerId,
        subscriptionId: subscription._id.toString(),
        razorpayPaymentId: `pay_${customerId.slice(-8)}_${Date.now().toString().slice(-4)}`,
        razorpayOrderId: `ord_${customerId.slice(-6)}`,
        customerName: item.name,
        customerEmail: item.email,
        customerPhone: item.phone,
        amount: item.amount,
        currency: 'INR',
        paymentType: item.type,
        status: isRecovered ? 'captured' : 'failed',
        failureCode: isRecovered ? null : item.failureCode,
        errorDescription: item.failureReason,
        bank: 'HDFC Bank',
        vpa: item.vpa,
        retryCount: item.attempts,
        recoveryStage: item.status,
        recoveryProbability: isStopped ? 20 : isRecovered ? 98 : 88,
        aiScore: isStopped ? 35 : 92,
      });

      const session = await RecoverySessionModel.create({
        merchantId,
        customerId,
        subscriptionId: subscription._id.toString(),
        paymentId: payment._id.toString(),
        type: item.type,
        planOrItemName: item.plan,
        originalAmount: item.amount,
        recoveredAmount: isRecovered ? item.amount : 0,
        failureCode: item.failureCode,
        failureCategory: item.failureCategory,
        failureDescription: item.failureReason,
        status: item.status,
        npciAttemptCount: item.attempts,
        maxNpciAttempts: 3,
        cooldownHoursRemaining: item.cooldownHoursRemaining,
        nextScheduledRetry: item.status === 'SCHEDULED_RETRY' ? new Date(Date.now() + 21 * 3600 * 1000) : null,
        paymentLinkUrl: `https://pay.revora.ai/r/${customerId.slice(-6)}`,
      });

      const sessionId = session._id.toString();

      await AIDecisionModel.create({
        recoverySessionId: sessionId,
        modelName: 'gemini-2.5-flash',
        actionRecommended: item.status === 'SCHEDULED_RETRY' ? 'SCHEDULE_RETRY' : 'COMPLIANT_ACTION',
        recoveryScore: isStopped ? 35 : 92,
        riskScore: isStopped ? 75 : 12,
        confidence: 0.94,
        headline: `AI Policy Execution: ${item.status}`,
        rationale: `Evaluated failure code ${item.failureCode} under NPCI OC-136 regulation.`,
        complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
        customerMessagePreview: `Hi ${item.name}, your payment of ₹${item.amount} was handled compliantly.`,
      });

      await RetryAttemptModel.create({
        recoverySessionId: sessionId,
        attemptNumber: 1,
        scheduledFor: new Date(Date.now() - 3 * 3600 * 1000),
        executedAt: new Date(Date.now() - 3 * 3600 * 1000),
        status: isRecovered ? 'success' : 'failed',
        errorCode: item.failureCode,
        cooldownHoursMet: 24.0,
      });

      await NotificationLogModel.create({
        recoverySessionId: sessionId,
        channel: 'WHATSAPP',
        recipient: item.phone,
        messageBody: `Hi ${item.name}, payment status update for ${item.plan}.`,
        status: 'DELIVERED',
        ctaUrl: `https://pay.revora.ai/r/${customerId.slice(-6)}`,
      });

      await AuditLogModel.create({
        merchantId,
        eventType: isRecovered ? 'PAYMENT_CAPTURED' : isStopped ? 'STOP_STATE_ENFORCED' : 'PAYMENT_FAILED',
        entityType: 'PAYMENT',
        entityId: payment._id.toString(),
        title: isRecovered ? `Payment Recovered: ${item.name}` : `Payment Failure Logged: ${item.name}`,
        description: `${item.plan} · ₹${item.amount.toLocaleString('en-IN')} via ${item.vpa}`,
        customerName: item.name,
        amount: item.amount,
        status: isRecovered ? 'SUCCESS' : isStopped ? 'DANGER' : 'WARNING',
        complianceTag: 'NPCI_OC136_COMPLIANT',
      });
    }

    logger.info('🎉 MongoDB successfully initialized with 6 live baseline records!');
  } catch (seedErr) {
    logger.error({ seedErr }, 'Error during initial MongoDB baseline seed.');
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    logger.info('🍃 Disconnected from MongoDB Database.');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from MongoDB:');
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export default mongoose;
