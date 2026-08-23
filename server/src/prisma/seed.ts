import prisma from './client';
import { hashPassword } from '../utils/hash.util';
import logger from '../logs/logger';

async function seed() {
  logger.info('🌱 Starting database seed...');

  // 1. Clean existing records in sequence
  await prisma.auditLog.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.aIDecision.deleteMany();
  await prisma.retryAttempt.deleteMany();
  await prisma.recoverySession.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.abandonedCart.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.mandate.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.merchant.deleteMany();

  // 2. Create Demo Merchant
  const passwordHash = await hashPassword('Password123!');
  const merchant = await prisma.merchant.create({
    data: {
      id: 'mer_demo_1',
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
  });

  logger.info({ merchantId: merchant.id }, '✅ Demo merchant created.');

  // 3. Create Seed Customers & Subscriptions with realistic NPCI cases
  const customersData = [
    {
      id: 'cust_1',
      name: 'Aman Verma',
      email: 'aman.verma@techcorp.in',
      phone: '+91 98201 44321',
      vpa: 'aman.verma@okaxis',
      planName: 'Enterprise SaaS Annual',
      amount: 4999.0,
      mandateId: 'man_aman_1',
      failureCode: 'U30',
      failureReason: 'Debit failed: Insufficient funds in customer account',
      status: 'SCHEDULED_RETRY',
      attempts: 1,
    },
    {
      id: 'cust_2',
      name: 'Priya Sundaram',
      email: 'priya.s@designstudio.io',
      phone: '+91 98110 55672',
      vpa: 'priya.s@okhdfcbank',
      planName: 'Pro Monthly Plan',
      amount: 1499.0,
      mandateId: 'man_priya_2',
      failureCode: 'ZM',
      failureReason: 'Invalid MPIN / Authentication Expired',
      status: 'RECOVERED_VIA_LINK',
      attempts: 1,
    },
    {
      id: 'cust_3',
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@cloudinfra.net',
      phone: '+91 98300 11984',
      vpa: 'vikram.roy@icici',
      planName: 'Cloud Dedicated Node',
      amount: 12500.0,
      mandateId: 'man_vikram_3',
      failureCode: 'U30',
      failureReason: 'Insufficient Balance (Attempt 3 Failed)',
      status: 'STOP_NPCI_LIMIT_REACHED',
      attempts: 3,
    },
    {
      id: 'cust_4',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@fintechlabs.in',
      phone: '+91 98450 77123',
      vpa: 'ananya.d@kotak',
      planName: 'Growth Team Tier',
      amount: 3499.0,
      mandateId: 'man_ananya_4',
      failureCode: 'UT',
      failureReason: 'Transaction Timeout on Remitter Switch',
      status: 'RECOVERED_AUTO_DEBIT',
      attempts: 2,
    },
    {
      id: 'cust_5',
      name: 'Deepak Patel',
      email: 'deepak.p@pateltraders.com',
      phone: '+91 97234 88190',
      vpa: 'deepak.p@paytm',
      planName: 'Inventory Suite Pro',
      amount: 2199.0,
      mandateId: 'man_deepak_5',
      failureCode: 'ZG',
      failureReason: 'Virtual Payment Address Revoked / Blocked by PSP',
      status: 'STOP_TERMINAL_FAILURE',
      attempts: 1,
    },
    {
      id: 'cust_6',
      name: 'Meera Nambiar',
      email: 'meera.n@keralaorganic.org',
      phone: '+91 94470 33412',
      vpa: 'meera.n@sbi',
      planName: 'Organic Kitchen Bundle',
      amount: 1899.0,
      mandateId: 'man_meera_6',
      failureCode: 'U54',
      failureReason: 'Daily Amount Limit Exceeded on UPI Rail',
      status: 'RECOVERED_VIA_LINK',
      attempts: 2,
    },
  ];

  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        id: c.id,
        merchantId: merchant.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        vpa: c.vpa,
        riskScore: c.status.startsWith('STOP') ? 65 : 15,
        healthScore: c.status.startsWith('RECOVERED') ? 95 : 80,
        recoveryProbability: c.status.startsWith('STOP') ? 20 : 88,
        lifetimeRecovered: c.status.startsWith('RECOVERED') ? c.amount : 0,
      },
    });

    const mandate = await prisma.mandate.create({
      data: {
        id: c.mandateId,
        customerId: customer.id,
        razorpayMandateId: `mand_${c.id}`,
        vpa: c.vpa,
        bankName: 'HDFC Bank',
        maxAmount: 15000.0,
        frequency: 'monthly',
        status: c.status === 'STOP_TERMINAL_FAILURE' ? 'REVOKED' : 'ACTIVE',
      },
    });

    const subscription = await prisma.subscription.create({
      data: {
        id: `sub_${c.id}`,
        merchantId: merchant.id,
        customerId: customer.id,
        mandateId: mandate.id,
        razorpaySubId: `sub_rzp_${c.id}`,
        planName: c.planName,
        amount: c.amount,
        billingCycle: 'monthly',
        nextDueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        status: c.status.startsWith('RECOVERED') ? 'active' : 'recovering',
      },
    });

    const session = await prisma.recoverySession.create({
      data: {
        id: `rec_${c.id}`,
        merchantId: merchant.id,
        customerId: customer.id,
        subscriptionId: subscription.id,
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
        paymentLinkUrl: `https://rzp.io/l/rec_${c.id}`,
      },
    });

    // AI Decision
    await prisma.aIDecision.create({
      data: {
        recoverySessionId: session.id,
        modelName: 'gemini-2.5-flash',
        actionRecommended: c.status === 'SCHEDULED_RETRY' ? 'SCHEDULE_RETRY' : 'COMPLIANT_ACTION',
        recoveryScore: c.status.startsWith('STOP') ? 35 : 88,
        riskScore: c.status.startsWith('STOP') ? 75 : 12,
        confidence: 0.94,
        headline: `AI Strategy: ${c.status}`,
        rationale: `Evaluated failure code ${c.failureCode} in accordance with NPCI OC-136.`,
        complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
        customerMessagePreview: `Hi ${c.name}, payment for ${c.planName} could not be completed.`,
      },
    });

    // Retry Attempt
    await prisma.retryAttempt.create({
      data: {
        recoverySessionId: session.id,
        attemptNumber: 1,
        scheduledFor: new Date(),
        executedAt: new Date(),
        status: c.status.startsWith('RECOVERED') ? 'success' : 'failed',
        errorCode: c.failureCode,
        cooldownHoursMet: 24.5,
      },
    });

    // Notification Log
    await prisma.notificationLog.create({
      data: {
        recoverySessionId: session.id,
        channel: 'WHATSAPP',
        recipient: c.phone,
        messageBody: `Hi ${c.name}, payment for ${c.planName} status update.`,
        status: 'DELIVERED',
        ctaUrl: `https://rzp.io/l/rec_${c.id}`,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        merchantId: merchant.id,
        eventType: 'RECOVERY_INITIATED',
        entityType: 'RECOVERY_SESSION',
        entityId: session.id,
        title: `Recovery Case: ${c.name}`,
        description: `NPCI-compliant recovery process initialized for ₹${c.amount}.`,
        customerName: c.name,
        amount: c.amount,
        status: 'INFO',
        complianceTag: 'NPCI_OC136_COMPLIANT',
      },
    });
  }

  logger.info('🎉 Database successfully seeded with 6 production-grade test cases!');
}

seed()
  .catch((e) => {
    logger.error({ err: e }, '❌ Seeding failed:');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
