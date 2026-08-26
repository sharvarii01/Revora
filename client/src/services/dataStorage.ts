import { RecoveryRecord } from '@/types/recovery';
import { ActivityLogItem } from '@/types/ai';
import { RevenueSummaryMetrics } from '@/types/analytics';
import { MerchantUser } from './auth.service';

export interface AIRecommendationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  expectedGain: number;
  confidenceScore: number;
  impactMetric: string;
  recommendedAction: string;
  rationale: string;
  targetBank?: string;
  applied?: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  vpa: string;
  healthScore: number;
  recoveryProbability: number;
  totalRecovered: number;
  activeRecoveriesCount: number;
  createdAt: string;
}

export interface MerchantStoreData {
  merchantId: string;
  metrics: RevenueSummaryMetrics;
  recoveries: RecoveryRecord[];
  activityLogs: ActivityLogItem[];
  customers: CustomerProfile[];
  recommendations: AIRecommendationItem[];
  updatedAt: string;
}

// Deterministic seed generator for any merchant
export function generateInitialMerchantData(merchant: MerchantUser): MerchantStoreData {
  const isDemo = merchant.email === 'sharvi@saasplatform.in' || merchant.id === 'mer_demo_1';
  const prefix = merchant.id || `mer_${merchant.email.split('@')[0]}`;
  const now = new Date();

  // Distinct customer names and data sets for different users
  const demoCustomers: CustomerProfile[] = [
    {
      id: `${prefix}_cust_1`,
      name: 'Aman Verma',
      email: 'aman.verma@techcorp.in',
      phone: '+91 98201 44321',
      company: 'Enterprise SaaS Pro',
      vpa: 'amanverma@okhdfcbank',
      healthScore: 92,
      recoveryProbability: 88,
      totalRecovered: 14997,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_2`,
      name: 'Priya Sundaram',
      email: 'priya.s@designstudio.io',
      phone: '+91 98110 55672',
      company: 'Studio Design Suite',
      vpa: 'priyas@icici',
      healthScore: 88,
      recoveryProbability: 82,
      totalRecovered: 8998,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_3`,
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@cloudinfra.net',
      phone: '+91 98300 11984',
      company: 'Cloud Dedicated Cluster',
      vpa: 'vikramroy@sbi',
      healthScore: 68,
      recoveryProbability: 55,
      totalRecovered: 25000,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_4`,
      name: 'Deepak Patel',
      email: 'deepak.p@pateltraders.com',
      phone: '+91 97234 88190',
      company: 'Inventory Suite ERP',
      vpa: 'deepakpatel@paytm',
      healthScore: 74,
      recoveryProbability: 60,
      totalRecovered: 6597,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_5`,
      name: 'Rohit Shenoy',
      email: 'rohit.s@startupmail.com',
      phone: '+91 98110 99887',
      company: 'Analytics Pro',
      vpa: 'rohitshenoy@kotak',
      healthScore: 85,
      recoveryProbability: 80,
      totalRecovered: 10497,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_6`,
      name: 'Ananya Sharma',
      email: 'ananya.s@fintechcloud.in',
      phone: '+91 99204 33112',
      company: 'Fintech Cloud Pro',
      vpa: 'ananya@axisbank',
      healthScore: 95,
      recoveryProbability: 92,
      totalRecovered: 19996,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_7`,
      name: 'Rajesh Iyer',
      email: 'rajesh.iyer@iyerconsulting.com',
      phone: '+91 98401 77654',
      company: 'Iyer Consulting Ltd',
      vpa: 'rajesh.iyer@okaxis',
      healthScore: 90,
      recoveryProbability: 85,
      totalRecovered: 24995,
      activeRecoveriesCount: 0,
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_8`,
      name: 'Sneha Kulkarni',
      email: 'sneha.k@martechflow.in',
      phone: '+91 98902 44321',
      company: 'MarTech Flow Pro',
      vpa: 'snehak@oksbi',
      healthScore: 82,
      recoveryProbability: 75,
      totalRecovered: 7998,
      activeRecoveriesCount: 0,
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
  ];

  // Custom customers if not demo merchant
  const customCustomers: CustomerProfile[] = [
    {
      id: `${prefix}_cust_1`,
      name: 'Rohan Joshi',
      email: 'rohan.joshi@acmeindia.com',
      phone: '+91 98200 44111',
      company: `${merchant.businessName || 'Business'} Pro`,
      vpa: 'rohanj@okhdfcbank',
      healthScore: 90,
      recoveryProbability: 86,
      totalRecovered: 15499,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_2`,
      name: 'Kavita Rao',
      email: 'kavita.rao@techscale.in',
      phone: '+91 98450 33221',
      company: `${merchant.businessName || 'Business'} Cloud`,
      vpa: 'kavitarao@icici',
      healthScore: 94,
      recoveryProbability: 90,
      totalRecovered: 21999,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 9 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_3`,
      name: 'Amit Deshmukh',
      email: 'amit.d@deshmukhindustries.com',
      phone: '+91 98220 99881',
      company: 'Deshmukh Industries',
      vpa: 'amitd@sbi',
      healthScore: 72,
      recoveryProbability: 65,
      totalRecovered: 35000,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_4`,
      name: 'Neha Gupta',
      email: 'neha.g@guptamedia.in',
      phone: '+91 99100 88223',
      company: 'Gupta Media Lab',
      vpa: 'nehag@paytm',
      healthScore: 86,
      recoveryProbability: 82,
      totalRecovered: 12500,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_5`,
      name: 'Tarun Kapoor',
      email: 'tarun.k@kapoorlogistics.net',
      phone: '+91 98180 55443',
      company: 'Kapoor Freight Hub',
      vpa: 'tarunkapoor@kotak',
      healthScore: 88,
      recoveryProbability: 78,
      totalRecovered: 18499,
      activeRecoveriesCount: 1,
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: `${prefix}_cust_6`,
      name: 'Manish Mehta',
      email: 'manish@mehtaadvisory.com',
      phone: '+91 98205 11990',
      company: 'Mehta Advisory Group',
      vpa: 'manishmehta@axisbank',
      healthScore: 92,
      recoveryProbability: 88,
      totalRecovered: 27999,
      activeRecoveriesCount: 0,
      createdAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
    },
  ];

  const customersList = isDemo ? demoCustomers : customCustomers;

  // Recovery Records
  const recoveriesList: RecoveryRecord[] = [
    {
      id: `${prefix}_rec_101`,
      customerId: customersList[0].id,
      customerName: customersList[0].name,
      customerEmail: customersList[0].email,
      customerPhone: customersList[0].phone,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Growth Annual License',
      amount: 4999,
      recoveredAmount: 0,
      appliedDiscountPct: 0,
      status: 'SCHEDULED_RETRY',
      failureCode: 'U30',
      failureReason: 'Debit failed: Insufficient funds in account (Salary mismatch)',
      failureCategory: 'TRANSIENT',
      currentAttempt: 1,
      maxAttempts: 3,
      nextRetryTime: new Date(now.getTime() + 18 * 3600000).toISOString(),
      cooldownHoursRemaining: 18,
      stopReason: null,
      paymentLinkUrl: null,
      aiDecision: {
        model: 'Gemini 2.5 Flash',
        action: 'SCHEDULE_RETRY',
        recoveryScore: 88,
        riskScore: 12,
        confidence: 0.94,
        headline: 'Payday Cycle Match: 09:15 AM Clearing Window',
        rationale: 'Customer salary credit patterns indicate 1st of month clearing. Rescheduled presentation to 09:15 AM interbank batch.',
        complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
        customerMessagePreview: 'Hi Aman, your subscription retry has been scheduled for tomorrow 09:15 AM under zero-penalty protection.',
      },
      retryTimeline: [
        {
          attemptNumber: 1,
          scheduledFor: new Date(now.getTime() - 6 * 3600000).toISOString(),
          executedAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
          status: 'failed',
          errorCode: 'U30',
          cooldownHoursMet: 24,
        },
      ],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: customersList[0].phone,
          messageBody: 'Hi Aman, your subscription retry has been scheduled for tomorrow 09:15 AM.',
          status: 'DELIVERED',
          timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
    },
    {
      id: `${prefix}_rec_102`,
      customerId: customersList[1].id,
      customerName: customersList[1].name,
      customerEmail: customersList[1].email,
      customerPhone: customersList[1].phone,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Pro Monthly Plan',
      amount: 2999,
      recoveredAmount: 0,
      appliedDiscountPct: 0,
      status: 'SCHEDULED_RETRY',
      failureCode: 'U30',
      failureReason: 'Debit failed: Insufficient funds in account',
      failureCategory: 'TRANSIENT',
      currentAttempt: 2,
      maxAttempts: 3,
      nextRetryTime: new Date(now.getTime() + 14 * 3600000).toISOString(),
      cooldownHoursRemaining: 14,
      stopReason: null,
      paymentLinkUrl: `http://localhost:3005/pay/${prefix}_rec_102`,
      aiDecision: {
        model: 'Gemini 2.5 Flash',
        action: 'SCHEDULE_RETRY_WITH_NUDGE',
        recoveryScore: 84,
        riskScore: 16,
        confidence: 0.91,
        headline: 'Attempt 2/3: Dispatched Pre-Debit WhatsApp Nudge',
        rationale: 'Mandatory 24h cooldown active. WhatsApp 1-click Razorpay payment link sent as secondary recovery rail.',
        complianceRule: 'NPCI_OC136_ATTEMPT_LIMIT_RULE',
        customerMessagePreview: 'Hi Priya, your Pro renewal payment is due. Tap here to pay securely via UPI.',
      },
      retryTimeline: [
        {
          attemptNumber: 1,
          scheduledFor: new Date(now.getTime() - 34 * 3600000).toISOString(),
          executedAt: new Date(now.getTime() - 34 * 3600000).toISOString(),
          status: 'failed',
          errorCode: 'U30',
          cooldownHoursMet: 24,
        },
        {
          attemptNumber: 2,
          scheduledFor: new Date(now.getTime() - 10 * 3600000).toISOString(),
          executedAt: new Date(now.getTime() - 10 * 3600000).toISOString(),
          status: 'failed',
          errorCode: 'U30',
          cooldownHoursMet: 24,
        },
      ],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: customersList[1].phone,
          messageBody: 'Hi Priya, your Pro renewal retry is scheduled for tomorrow. Pay now via UPI link.',
          status: 'DELIVERED',
          timestamp: new Date(now.getTime() - 9 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 34 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 9 * 3600000).toISOString(),
    },
    {
      id: `${prefix}_rec_103`,
      customerId: customersList[2].id,
      customerName: customersList[2].name,
      customerEmail: customersList[2].email,
      customerPhone: customersList[2].phone,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Dedicated Cluster Tier',
      amount: 12500,
      recoveredAmount: 0,
      appliedDiscountPct: 0,
      status: 'STOP_NPCI_LIMIT_REACHED',
      failureCode: 'U30',
      failureReason: 'Mandate presentations halted: Maximum 3 attempts exhausted',
      failureCategory: 'ACTION_REQUIRED',
      currentAttempt: 3,
      maxAttempts: 3,
      nextRetryTime: new Date(now.getTime() + 86400000).toISOString(),
      cooldownHoursRemaining: 0,
      stopReason: 'NPCI OC-136 Hard Stop Cap: Prevented ₹250 bank penalty charge',
      paymentLinkUrl: `http://localhost:3005/pay/${prefix}_rec_103`,
      aiDecision: {
        model: 'Groq Llama 3 70B',
        action: 'HALT_PRESENTATIONS_DISPATCH_LINK',
        recoveryScore: 76,
        riskScore: 24,
        confidence: 0.98,
        headline: 'NPCI Hard Stop Enforced • Zero Bounce Penalty',
        rationale: 'Halted all future auto-debits strictly after Attempt 3. Dispatched high-priority UPI Intent invoice to prevent bank penalties.',
        complianceRule: 'NPCI_OC136_MAX_3_ATTEMPTS_RULE',
        customerMessagePreview: 'Vikramaditya, your AutoPay attempts reached the 3-attempt limit. Please clear your ₹12,500 invoice directly via link.',
      },
      retryTimeline: [
        { attemptNumber: 1, scheduledFor: new Date(now.getTime() - 72 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
        { attemptNumber: 2, scheduledFor: new Date(now.getTime() - 48 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
        { attemptNumber: 3, scheduledFor: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
      ],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: customersList[2].phone,
          messageBody: 'Vikramaditya, mandate retry cap reached. Clear ₹12,500 invoice via secure UPI link.',
          status: 'DELIVERED',
          timestamp: new Date(now.getTime() - 23 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 23 * 3600000).toISOString(),
    },
    {
      id: `${prefix}_rec_104`,
      customerId: customersList[3].id,
      customerName: customersList[3].name,
      customerEmail: customersList[3].email,
      customerPhone: customersList[3].phone,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Inventory Suite Monthly',
      amount: 2199,
      recoveredAmount: 0,
      appliedDiscountPct: 0,
      status: 'STOP_TERMINAL_FAILURE',
      failureCode: 'ZG',
      failureReason: 'Mandate Invalid / VPA Revoked by Remitter Bank',
      failureCategory: 'TERMINAL',
      currentAttempt: 1,
      maxAttempts: 3,
      nextRetryTime: new Date(now.getTime() + 86400000).toISOString(),
      cooldownHoursRemaining: 0,
      stopReason: 'Terminal ZG Error: Re-linking required',
      paymentLinkUrl: `http://localhost:3005/pay/${prefix}_rec_104`,
      aiDecision: {
        model: 'Gemini 2.5 Flash',
        action: 'HALT_IMMEDIATELY_REAUTH',
        recoveryScore: 65,
        riskScore: 35,
        confidence: 0.99,
        headline: 'Terminal Error ZG • 0 Retries Scheduled',
        rationale: 'VPA is deactivated. Repeating debits causes permanent bank blacklist. Sent mandate re-authorization link immediately.',
        complianceRule: 'TERMINAL_ERROR_ZERO_RETRY_RULE',
        customerMessagePreview: 'Deepak, your AutoPay UPI ID was revoked. Tap here to re-authorize with any active UPI app.',
      },
      retryTimeline: [
        { attemptNumber: 1, scheduledFor: new Date(now.getTime() - 12 * 3600000).toISOString(), status: 'failed', errorCode: 'ZG', cooldownHoursMet: 24 },
      ],
      notificationHistory: [
        {
          channel: 'SMS',
          recipient: customersList[3].phone,
          messageBody: 'Deepak, your UPI AutoPay mandate needs re-linking. Tap to update: revora.ai/m/reauth',
          status: 'DELIVERED',
          timestamp: new Date(now.getTime() - 11 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 11 * 3600000).toISOString(),
    },
    {
      id: `${prefix}_rec_105`,
      customerId: customersList[4].id,
      customerName: customersList[4].name,
      customerEmail: customersList[4].email,
      customerPhone: customersList[4].phone,
      type: 'CHECKOUT_ABANDONMENT',
      planOrItemName: 'Analytics Pro Annual Checkout',
      amount: 3499,
      recoveredAmount: 0,
      appliedDiscountPct: 5,
      status: 'SCHEDULED_RETRY',
      failureCode: 'CART_DROPOFF',
      failureReason: 'Checkout cart abandoned at payment step',
      failureCategory: 'ACTION_REQUIRED',
      currentAttempt: 1,
      maxAttempts: 3,
      nextRetryTime: new Date(now.getTime() + 4 * 3600000).toISOString(),
      cooldownHoursRemaining: 4,
      stopReason: null,
      paymentLinkUrl: `http://localhost:3005/pay/${prefix}_rec_105`,
      aiDecision: {
        model: 'Groq Llama 3 70B',
        action: 'DYNAMIC_DISCOUNT_NUDGE',
        recoveryScore: 91,
        riskScore: 9,
        confidence: 0.93,
        headline: 'Dynamic 5% Margin-Safe Cart Rescue',
        rationale: 'Customer abandoned checkout at payment screen. High intent score (88%). Dispatched 5% time-sensitive discount nudge.',
        complianceRule: 'MERCHANT_MARGIN_FLOOR_POLICY',
        customerMessagePreview: 'Complete your Analytics Pro order in the next 4 hours and enjoy a special 5% instant discount.',
      },
      retryTimeline: [],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: customersList[4].phone,
          messageBody: 'Rohit, complete your Analytics Pro checkout with 5% off: revora.ai/pay/5off',
          status: 'DELIVERED',
          timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
    },
    {
      id: `${prefix}_rec_106`,
      customerId: customersList[5].id,
      customerName: customersList[5].name,
      customerEmail: customersList[5].email,
      customerPhone: customersList[5].phone,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Fintech Cloud Enterprise',
      amount: 4999,
      recoveredAmount: 4999,
      appliedDiscountPct: 0,
      status: 'RECOVERED_AUTO_DEBIT',
      failureCode: 'U30',
      failureReason: 'Successfully recovered on Attempt 2 (09:15 AM Salary Window)',
      failureCategory: 'TRANSIENT',
      currentAttempt: 2,
      maxAttempts: 3,
      nextRetryTime: new Date().toISOString(),
      cooldownHoursRemaining: 0,
      stopReason: null,
      paymentLinkUrl: null,
      aiDecision: {
        model: 'Gemini 2.5 Flash',
        action: 'RECOVERED_SUCCESSFULLY',
        recoveryScore: 100,
        riskScore: 0,
        confidence: 0.99,
        headline: '₹4,999 Revenue Rescued on Payday Clearing Batch',
        rationale: 'Execution at 09:15 AM interbank clearing window succeeded. Funds captured and settled directly to Razorpay.',
        complianceRule: 'NPCI_OC136_SUCCESS_STATE',
        customerMessagePreview: 'Your subscription renewal has been successfully processed. Thank you!',
      },
      retryTimeline: [
        { attemptNumber: 1, scheduledFor: new Date(now.getTime() - 48 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
        { attemptNumber: 2, scheduledFor: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'success', errorCode: '00', cooldownHoursMet: 24 },
      ],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: customersList[5].phone,
          messageBody: 'Payment successful! ₹4,999 processed for Fintech Cloud Enterprise.',
          status: 'DELIVERED',
          timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    },
  ];

  // Activity Logs
  const activityLogsList: ActivityLogItem[] = [
    {
      id: `${prefix}_log_1`,
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      eventType: 'RETRY_SCHEDULED',
      title: 'U30 Retry Scheduled for 09:15 AM',
      description: 'AI matched salary clearing window. 24h cooldown enforced.',
      customerName: customersList[0].name,
      amount: 4999,
      status: 'INFO',
      complianceTag: 'NPCI OC-136',
    },
    {
      id: `${prefix}_log_2`,
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      eventType: 'WHATSAPP_DISPATCHED',
      title: 'WhatsApp Pre-Debit Advisory Dispatched',
      description: 'Customer notified of upcoming AutoPay presentation with 1-click link.',
      customerName: customersList[1].name,
      amount: 2999,
      status: 'SUCCESS',
      complianceTag: 'RBI 2026',
    },
    {
      id: `${prefix}_log_3`,
      timestamp: new Date(now.getTime() - 120 * 60000).toISOString(),
      eventType: 'NPCI_VALIDATED',
      title: 'NPCI 3-Attempt Hard Stop Activated',
      description: 'Presentation halted strictly at 3 attempts. Zero bounce fees incurred.',
      customerName: customersList[2].name,
      amount: 12500,
      status: 'WARNING',
      complianceTag: 'Cap Protected',
    },
    {
      id: `${prefix}_log_4`,
      timestamp: new Date(now.getTime() - 180 * 60000).toISOString(),
      eventType: 'RECOVERY_CLOSED',
      title: 'Terminal ZG Error: Mandate Halted',
      description: 'Invalid VPA recognized. Zero retries scheduled to prevent blacklist.',
      customerName: customersList[3].name,
      amount: 2199,
      status: 'DANGER',
      complianceTag: 'Terminal Halt',
    },
    {
      id: `${prefix}_log_5`,
      timestamp: new Date(now.getTime() - 240 * 60000).toISOString(),
      eventType: 'PAYMENT_CAPTURED',
      title: 'Autonomous Payment Capture: ₹4,999 Rescued',
      description: 'Mandate cleared on 09:15 AM salary credit window.',
      customerName: customersList[5].name,
      amount: 4999,
      status: 'SUCCESS',
      complianceTag: 'Rescued',
    },
  ];

  // Dynamic AI Recommendations Pool per Merchant
  const recommendationsList: AIRecommendationItem[] = [
    {
      id: `${prefix}_rec_strat_1`,
      category: 'TIMING_OPTIMIZATION',
      title: "Move tomorrow's SBI & HDFC retries to the 09:15 AM salary clearing window",
      description: 'Analyzed 1st-of-month salary credit patterns for 6 customers. Batching in 09:15 AM interbank clearing window prevents U30 bounce and recovers high-ticket GMV.',
      expectedGain: isDemo ? 42800 : 54000,
      confidenceScore: 94,
      impactMetric: isDemo ? '+₹42,800' : '+₹54,000',
      recommendedAction: 'Apply Strategy',
      rationale: 'Evaluated under NPCI OC-136 liquidity timing models. Historical payday clearing success rate is 73.8% at 09:15 AM.',
      targetBank: 'SBI & HDFC',
      applied: false,
    },
    {
      id: `${prefix}_rec_strat_2`,
      category: 'CHECKOUT_RECOVERY',
      title: 'Activate 5% dynamic discount on 3 abandoned checkout carts expiring in 4 hours',
      description: 'Identified 3 abandoned carts with high intent scores (88%+). A personalized 5% discount nudge stays within your gross margin floor and recovers lost revenue.',
      expectedGain: isDemo ? 18500 : 22000,
      confidenceScore: 91,
      impactMetric: isDemo ? '+₹18,500' : '+₹22,000',
      recommendedAction: 'Apply Strategy',
      rationale: 'Margin ceiling set to 10.0%. 5% dynamic time-decay offer boosts checkout completion by 61%.',
      applied: false,
    },
    {
      id: `${prefix}_rec_strat_3`,
      category: 'MANDATE_REAUTHORIZATION',
      title: 'Dispatch WhatsApp UPI Intent re-link for 2 terminal ZG revoked mandates',
      description: '2 mandates failed due to expired bank MPIN / VPA deactivation. Out-of-band WhatsApp link allows customers to re-authorize in 1 click.',
      expectedGain: isDemo ? 24200 : 31500,
      confidenceScore: 96,
      impactMetric: isDemo ? '+₹24,200' : '+₹31,500',
      recommendedAction: 'Apply Strategy',
      rationale: 'Zero auto-debit retries to avoid penalties. 1-click re-link restores recurring billing lifetime value.',
      applied: false,
    },
    {
      id: `${prefix}_rec_strat_4`,
      category: 'COMPLIANCE_GUARD',
      title: 'Enforce 24h cooldown for ICICI AutoPay retries to prevent ₹250 penalty',
      description: 'Attempt 2 failed at 02:00 PM. Scheduling next presentation strictly after 24h compliance window eliminates bank penalty liability.',
      expectedGain: isDemo ? 12500 : 15000,
      confidenceScore: 98,
      impactMetric: isDemo ? '+₹12,500 saved' : '+₹15,000 saved',
      recommendedAction: 'Apply Strategy',
      rationale: 'Prevents issuer penalty flags and preserves merchant trust score under NPCI Circular OC-136.',
      applied: false,
    },
    {
      id: `${prefix}_rec_strat_5`,
      category: 'LIQUIDITY_ROUTING',
      title: 'Switch retry routing to Axis Bank IMPS clearing batch for ₹15,000+ tickets',
      description: 'High-ticket mandate clearing rate is 14% higher during morning liquidity windows on Axis Bank PSP switch.',
      expectedGain: isDemo ? 36000 : 45000,
      confidenceScore: 89,
      impactMetric: isDemo ? '+₹36,000' : '+₹45,000',
      recommendedAction: 'Apply Strategy',
      rationale: 'Smart PSP routing reduces interbank settlement latency for enterprise subscriptions.',
      applied: false,
    },
  ];

  // Calculate Metrics
  const activeCount = recoveriesList.filter((r) => !r.status.startsWith('RECOVERED') && !r.status.startsWith('STOP_')).length;
  const moneyAtRisk = recoveriesList.filter((r) => !r.status.startsWith('RECOVERED')).reduce((sum, r) => sum + r.amount, 0);
  const recoveredRev = isDemo ? 184200 : 215400;

  const metrics: RevenueSummaryMetrics = {
    totalRevenue: isDemo ? 584200 : 685000,
    recoveredRevenue: recoveredRev,
    moneyLeakageToday: moneyAtRisk || 42800,
    recoverySuccessRate: isDemo ? 68.4 : 71.2,
    failedPaymentsCount: activeCount || 4,
    failedPaymentsAmount: moneyAtRisk || 42800,
    failedSubscriptionsCount: activeCount || 4,
    recoveredCustomersCount: customersList.length || 8,
    aiHealthScore: 96,
    npciComplianceRate: 100.0,
    npciViolationsPrevented: isDemo ? 52 : 64,
    averageRetriesToSuccess: 1.4,
  };

  return {
    merchantId: merchant.id,
    metrics,
    recoveries: recoveriesList,
    activityLogs: activityLogsList,
    customers: customersList,
    recommendations: recommendationsList,
    updatedAt: new Date().toISOString(),
  };
}

export const dataStorage = {
  getStoredData(merchant: MerchantUser): MerchantStoreData {
    if (typeof window === 'undefined') {
      return generateInitialMerchantData(merchant);
    }
    const key = `revora_data_${merchant.id || merchant.email}`;
    try {
      const existing = localStorage.getItem(key);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed && Array.isArray(parsed.recoveries) && parsed.recoveries.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Initialize fresh merchant data and save
    const initial = generateInitialMerchantData(merchant);
    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  },

  saveStoredData(merchantId: string, data: MerchantStoreData): void {
    if (typeof window === 'undefined') return;
    try {
      const key = `revora_data_${merchantId}`;
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save merchant data to localStorage:', err);
    }
  },
};
