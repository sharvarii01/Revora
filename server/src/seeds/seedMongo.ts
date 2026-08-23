import mongoose from 'mongoose';
import { env } from '../config/env';
import {
  MerchantModel,
  CustomerModel,
  MandateModel,
  SubscriptionModel,
  RecoverySessionModel,
  AIDecisionModel,
  RetryAttemptModel,
  NotificationLogModel,
  AuditLogModel,
  PaymentModel,
  AbandonedCartModel,
  RefreshTokenModel,
} from '../models';
import { hashPassword } from '../utils/hash.util';
import logger from '../logs/logger';

async function seedMongo() {
  logger.info('🌱 Connecting to MongoDB for seeding...');
  await mongoose.connect(env.MONGODB_URI);
  logger.info('🍃 Connected to MongoDB.');

  // 1. Clean existing collections
  logger.info('🧹 Cleaning existing collections...');
  await Promise.all([
    MerchantModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    MandateModel.deleteMany({}),
    SubscriptionModel.deleteMany({}),
    RecoverySessionModel.deleteMany({}),
    AIDecisionModel.deleteMany({}),
    RetryAttemptModel.deleteMany({}),
    NotificationLogModel.deleteMany({}),
    AuditLogModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    AbandonedCartModel.deleteMany({}),
    RefreshTokenModel.deleteMany({}),
  ]);

  // 2. Create Demo Merchant
  const passwordHash = await hashPassword('Password123!');
  const merchant = await MerchantModel.create({
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
  });

  const merchantId = merchant._id.toString();
  logger.info({ merchantId }, '✅ Demo merchant created in MongoDB.');

  // 3. Create Seed Customers with Mandates, Subscriptions, and Recovery Sessions
  const customersData = [
    {
      name: 'Aman Verma',
      email: 'aman.verma@techcorp.in',
      phone: '+91 98201 44321',
      vpa: 'aman.verma@okaxis',
      planName: 'Enterprise SaaS Annual',
      amount: 4999.0,
      failureCode: 'U30',
      failureReason: 'Debit failed: Insufficient funds in customer account',
      status: 'SCHEDULED_RETRY',
      attempts: 1,
    },
    {
      name: 'Priya Sundaram',
      email: 'priya.s@designstudio.io',
      phone: '+91 98110 55672',
      vpa: 'priya.s@okhdfcbank',
      planName: 'Pro Monthly Plan',
      amount: 1499.0,
      failureCode: 'ZM',
      failureReason: 'Invalid MPIN / Authentication Expired',
      status: 'RECOVERED_VIA_LINK',
      attempts: 1,
    },
    {
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@cloudinfra.net',
      phone: '+91 98300 11984',
      vpa: 'vikram.roy@icici',
      planName: 'Cloud Dedicated Node',
      amount: 12500.0,
      failureCode: 'U30',
      failureReason: 'Insufficient Balance (Attempt 3 Failed)',
      status: 'STOP_NPCI_LIMIT_REACHED',
      attempts: 3,
    },
    {
      name: 'Ananya Deshmukh',
      email: 'ananya.d@fintechlabs.in',
      phone: '+91 98450 77123',
      vpa: 'ananya.d@kotak',
      planName: 'Growth Team Tier',
      amount: 3499.0,
      failureCode: 'UT',
      failureReason: 'Transaction Timeout on Remitter Switch',
      status: 'RECOVERED_AUTO_DEBIT',
      attempts: 2,
    },
    {
      name: 'Deepak Patel',
      email: 'deepak.p@pateltraders.com',
      phone: '+91 97234 88190',
      vpa: 'deepak.p@paytm',
      planName: 'Inventory Suite Pro',
      amount: 2199.0,
      failureCode: 'ZG',
      failureReason: 'Virtual Payment Address Revoked / Blocked by PSP',
      status: 'STOP_TERMINAL_FAILURE',
      attempts: 1,
    },
    {
      name: 'Meera Nambiar',
      email: 'meera.n@keralaorganic.org',
      phone: '+91 94470 33412',
      vpa: 'meera.n@sbi',
      planName: 'Organic Kitchen Bundle',
      amount: 1899.0,
      failureCode: 'U54',
      failureReason: 'Daily Amount Limit Exceeded on UPI Rail',
      status: 'RECOVERED_VIA_LINK',
      attempts: 2,
    },
  ];

  for (const c of customersData) {
    const customer = await CustomerModel.create({
      merchantId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      vpa: c.vpa,
      riskScore: c.status.startsWith('STOP') ? 65 : 15,
      healthScore: c.status.startsWith('RECOVERED') ? 95 : 80,
      recoveryProbability: c.status.startsWith('STOP') ? 20 : 88,
      lifetimeRecovered: c.status.startsWith('RECOVERED') ? c.amount : 0,
    });
    const customerId = customer._id.toString();

    const mandate = await MandateModel.create({
      customerId,
      razorpayMandateId: `mand_${customerId.slice(-6)}`,
      vpa: c.vpa,
      bankName: 'HDFC Bank',
      maxAmount: 15000.0,
      frequency: 'monthly',
      status: c.status === 'STOP_TERMINAL_FAILURE' ? 'REVOKED' : 'ACTIVE',
    });
    const mandateId = mandate._id.toString();

    const subscription = await SubscriptionModel.create({
      merchantId,
      customerId,
      mandateId,
      razorpaySubId: `sub_rzp_${customerId.slice(-6)}`,
      planName: c.planName,
      amount: c.amount,
      billingCycle: 'monthly',
      nextDueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
      status: c.status.startsWith('RECOVERED') ? 'active' : 'recovering',
    });
    const subscriptionId = subscription._id.toString();

    const session = await RecoverySessionModel.create({
      merchantId,
      customerId,
      subscriptionId,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: c.planName,
      originalAmount: c.amount,
      recoveredAmount: c.status.startsWith('RECOVERED') ? c.amount : 0,
      failureCode: c.failureCode,
      failureCategory: c.status === 'STOP_TERMINAL_FAILURE' ? 'TERMINAL' : 'TRANSIENT',
      failureDescription: c.failureReason,
      status: c.status,
      npciAttemptCount: c.attempts,
      maxNpciAttempts: 3,
      nextScheduledRetry: c.status === 'SCHEDULED_RETRY' ? new Date(Date.now() + 25 * 3600 * 1000) : null,
      paymentLinkUrl: `https://rzp.io/l/rec_${customerId.slice(-6)}`,
    });
    const sessionId = session._id.toString();

    // AI Decision
    await AIDecisionModel.create({
      recoverySessionId: sessionId,
      modelName: 'gemini-2.5-flash',
      actionRecommended: c.status === 'SCHEDULED_RETRY' ? 'SCHEDULE_RETRY' : 'COMPLIANT_ACTION',
      recoveryScore: c.status.startsWith('STOP') ? 35 : 88,
      riskScore: c.status.startsWith('STOP') ? 75 : 12,
      confidence: 0.94,
      headline: `AI Strategy: ${c.status}`,
      rationale: `Evaluated failure code ${c.failureCode} in accordance with NPCI OC-136.`,
      complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
      customerMessagePreview: `Hi ${c.name}, payment for ${c.planName} status update.`,
    });

    // Retry Attempt
    await RetryAttemptModel.create({
      recoverySessionId: sessionId,
      attemptNumber: 1,
      scheduledFor: new Date(),
      executedAt: new Date(),
      status: c.status.startsWith('RECOVERED') ? 'success' : 'failed',
      errorCode: c.failureCode,
      cooldownHoursMet: 24.5,
    });

    // Notification Log
    await NotificationLogModel.create({
      recoverySessionId: sessionId,
      channel: 'WHATSAPP',
      recipient: c.phone,
      messageBody: `Hi ${c.name}, payment for ${c.planName} status update.`,
      status: 'DELIVERED',
      ctaUrl: `https://rzp.io/l/rec_${customerId.slice(-6)}`,
    });

    // Audit Log
    await AuditLogModel.create({
      merchantId,
      eventType: 'RECOVERY_INITIATED',
      entityType: 'RECOVERY_SESSION',
      entityId: sessionId,
      title: `Recovery Case: ${c.name}`,
      description: `NPCI-compliant recovery process initialized for ₹${c.amount}.`,
      customerName: c.name,
      amount: c.amount,
      status: 'INFO',
      complianceTag: 'NPCI_OC136_COMPLIANT',
    });
  }

  // 4. Create an Abandoned Cart sample
  const cartCustomer = await CustomerModel.create({
    merchantId,
    name: 'Rohit Shenoy',
    email: 'rohit.s@startupmail.com',
    phone: '+91 98110 99887',
    riskScore: 20,
    healthScore: 80,
  });

  const cart = await AbandonedCartModel.create({
    merchantId,
    customerId: cartCustomer._id.toString(),
    itemsSummary: 'Premium Analytics Pro Suite (1 Item)',
    cartValue: 3499.0,
    currency: 'INR',
    abandonedAt: new Date(Date.now() - 3 * 3600 * 1000),
    checkoutUrl: 'https://rzp.io/l/cart_rohit_3499',
    status: 'abandoned',
  });

  await RecoverySessionModel.create({
    merchantId,
    customerId: cartCustomer._id.toString(),
    cartId: cart._id.toString(),
    type: 'CHECKOUT_ABANDONMENT',
    planOrItemName: 'Premium Analytics Pro Suite',
    originalAmount: 3499.0,
    appliedDiscountPct: 5.0,
    status: 'PAYMENT_LINK_SENT',
    paymentLinkUrl: 'https://rzp.io/l/cart_rohit_3499',
  });

  logger.info('🎉 MongoDB successfully seeded with real production documents!');
}

seedMongo()
  .catch((e) => {
    logger.error({ err: e }, '❌ MongoDB Seeding failed:');
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
