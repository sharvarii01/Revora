'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { RecoveryRecord } from '@/types/recovery';
import { ActivityLogItem } from '@/types/ai';
import { RevenueSummaryMetrics } from '@/types/analytics';
import { recoveriesService } from '@/services/recoveries.service';
import { analyticsService } from '@/services/analytics.service';
import { paymentsService } from '@/services/payments.service';
import { useAuth } from '@/context/AuthContext';
import {
  dataStorage,
  AIRecommendationItem,
  CustomerProfile,
  MerchantStoreData,
  generateInitialMerchantData,
} from '@/services/dataStorage';

interface SimulatorContextType {
  recoveries: RecoveryRecord[];
  activityLogs: ActivityLogItem[];
  metrics: RevenueSummaryMetrics;
  customers: CustomerProfile[];
  recommendations: AIRecommendationItem[];
  selectedRecovery: RecoveryRecord | null;
  setSelectedRecovery: (rec: RecoveryRecord | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // AI Strategy Actions
  applyAIRecommendation: (id: string) => Promise<{ success: boolean; gain: number; title: string }>;
  resetRecommendations: () => void;

  // Real Database & In-Memory Triggers
  triggerU30Scenario: () => Promise<void>;
  triggerNpciLimitBreachScenario: () => Promise<void>;
  triggerTerminalZgScenario: () => Promise<void>;
  triggerCheckoutDropoffScenario: () => Promise<void>;
  triggerCustomerPaymentScenario: (recoveryId?: string) => Promise<void>;
  stopRecovery: (id: string, reason?: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

function mapRecoverySessionToRecord(s: any): RecoveryRecord {
  const customer = s.customer || {};
  const aiDecision = (s.aiDecisions && s.aiDecisions[0]) || s.aiDecision || {};
  return {
    id: s.id || s._id?.toString() || `rec_${Date.now()}`,
    customerId: s.customerId || customer.id || '',
    customerName: customer.name || s.customerName || 'Customer',
    customerEmail: customer.email || s.customerEmail || '',
    customerPhone: customer.phone || s.customerPhone || '',
    type: s.type || 'SUBSCRIPTION_AUTOPAY',
    planOrItemName: s.planOrItemName || 'Subscription Renewal',
    amount: s.originalAmount || s.amount || 0,
    recoveredAmount: s.recoveredAmount || 0,
    appliedDiscountPct: s.appliedDiscountPct || 0,
    status: s.status || 'SCHEDULED_RETRY',
    failureCode: s.failureCode || 'U30',
    failureReason: s.failureDescription || s.failureReason || 'Debit failed: Insufficient funds in account',
    failureCategory: s.failureCategory || 'TRANSIENT',
    currentAttempt: typeof s.npciAttemptCount === 'number' ? s.npciAttemptCount : (s.currentAttempt || 1),
    maxAttempts: s.maxNpciAttempts || s.maxAttempts || 3,
    nextRetryTime: s.nextScheduledRetry ? new Date(s.nextScheduledRetry).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    cooldownHoursRemaining: typeof s.cooldownHoursRemaining === 'number' ? s.cooldownHoursRemaining : 24,
    stopReason: s.stopReason || null,
    paymentLinkUrl: s.paymentLinkUrl || null,
    aiDecision: {
      model: aiDecision.modelName || aiDecision.model || 'Gemini 2.5 Flash',
      action: aiDecision.actionRecommended || aiDecision.action || 'SCHEDULE_RETRY',
      recoveryScore: aiDecision.recoveryScore || 85,
      riskScore: aiDecision.riskScore || 15,
      confidence: aiDecision.confidence || 0.94,
      headline: aiDecision.headline || 'AI Recovery Strategy Formulated',
      rationale: aiDecision.rationale || 'Evaluated under NPCI Circular OC-136. 24-hour mandatory cooldown enforced.',
      complianceRule: aiDecision.complianceRule || 'NPCI_OC136_24H_COOLDOWN_RULE',
      customerMessagePreview: aiDecision.customerMessagePreview || `Payment retry scheduled under NPCI guidelines.`,
    },
    retryTimeline: (s.retryAttempts && s.retryAttempts.length > 0)
      ? s.retryAttempts.map((ra: any) => ({
          attemptNumber: ra.attemptNumber,
          scheduledFor: ra.scheduledFor ? new Date(ra.scheduledFor).toISOString() : new Date().toISOString(),
          executedAt: ra.executedAt ? new Date(ra.executedAt).toISOString() : null,
          status: ra.status,
          errorCode: ra.errorCode || 'U30',
          cooldownHoursMet: ra.cooldownHoursMet || 24,
        }))
      : [
          {
            attemptNumber: 1,
            scheduledFor: new Date().toISOString(),
            status: 'failed',
            errorCode: s.failureCode || 'U30',
            cooldownHoursMet: 24,
          },
        ],
    notificationHistory: (s.notificationLogs && s.notificationLogs.length > 0)
      ? s.notificationLogs.map((nl: any) => ({
          channel: nl.channel || 'WHATSAPP',
          recipient: nl.recipient || customer.phone || '+91 98201 44321',
          messageBody: nl.messageBody || nl.templateName || 'Pre-debit recovery advisory dispatched.',
          status: nl.status || 'DELIVERED',
          timestamp: nl.sentAt ? new Date(nl.sentAt).toISOString() : new Date().toISOString(),
        }))
      : [
          {
            channel: 'WHATSAPP',
            recipient: customer.phone || '+91 98201 44321',
            messageBody: 'Hi, your subscription retry has been scheduled under NPCI guidelines.',
            status: 'DELIVERED',
            timestamp: new Date().toISOString(),
          },
        ],
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
  };
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Load initial merchant data immediately (isolated per merchant)
  const initialStore = useMemo<MerchantStoreData>(() => {
    const defaultUser = user || {
      id: 'mer_demo_1',
      email: 'sharvi@saasplatform.in',
      name: 'Sharvi Dhole',
      businessName: 'NovaCloud Technologies Pvt Ltd',
      environment: 'LIVE',
      maxDiscountPct: 10,
      autoRecoveryEnabled: true,
      hasRazorpayKeys: true,
    };
    return dataStorage.getStoredData(defaultUser);
  }, [user]);

  const [recoveries, setRecoveries] = useState<RecoveryRecord[]>(initialStore.recoveries);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(initialStore.activityLogs);
  const [metrics, setMetrics] = useState<RevenueSummaryMetrics>(initialStore.metrics);
  const [customers, setCustomers] = useState<CustomerProfile[]>(initialStore.customers);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>(initialStore.recommendations);
  const [selectedRecovery, setSelectedRecovery] = useState<RecoveryRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state whenever active user switches
  useEffect(() => {
    if (user) {
      const store = dataStorage.getStoredData(user);
      setRecoveries(store.recoveries);
      setActivityLogs(store.activityLogs);
      setMetrics(store.metrics);
      setCustomers(store.customers);
      setRecommendations(store.recommendations);
    }
  }, [user]);

  // Save changes to localStorage store
  const persistChanges = useCallback(
    (
      newRecoveries: RecoveryRecord[],
      newLogs: ActivityLogItem[],
      newMetrics: RevenueSummaryMetrics,
      newCustomers: CustomerProfile[],
      newRecs: AIRecommendationItem[]
    ) => {
      const merchantId = user?.id || user?.email || 'mer_demo_1';
      dataStorage.saveStoredData(merchantId, {
        merchantId,
        metrics: newMetrics,
        recoveries: newRecoveries,
        activityLogs: newLogs,
        customers: newCustomers,
        recommendations: newRecs,
        updatedAt: new Date().toISOString(),
      });
    },
    [user]
  );

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Try to fetch from backend API if available
      const [summaryRes, recoveriesRes, logsRes] = await Promise.allSettled([
        analyticsService.getSummary(),
        recoveriesService.getRecoveries({ limit: 100 }),
        analyticsService.getActivityLogs({ limit: 50 }),
      ]);

      let updatedRecoveries = [...recoveries];
      let updatedLogs = [...activityLogs];
      let updatedMetrics = { ...metrics };

      if (recoveriesRes.status === 'fulfilled' && recoveriesRes.value?.data?.length > 0) {
        const mapped = recoveriesRes.value.data.map(mapRecoverySessionToRecord);
        const unique = Array.from(
          new Map<string, RecoveryRecord>(mapped.map((r: RecoveryRecord) => [r.id, r])).values()
        );
        updatedRecoveries = unique;
        setRecoveries(unique);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value?.data?.length > 0) {
        updatedLogs = logsRes.value.data;
        setActivityLogs(updatedLogs);
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        updatedMetrics = summaryRes.value;
        setMetrics(updatedMetrics);
      }

      // Re-persist the latest store
      persistChanges(updatedRecoveries, updatedLogs, updatedMetrics, customers, recommendations);
    } catch (err) {
      console.warn('Backend offline or unreachable, using local merchant store:', err);
    } finally {
      setIsLoading(false);
    }
  }, [recoveries, activityLogs, metrics, customers, recommendations, persistChanges]);

  // Apply AI Recommendation Strategy
  const applyAIRecommendation = async (id: string): Promise<{ success: boolean; gain: number; title: string }> => {
    const targetRec = recommendations.find((r) => r.id === id) || recommendations[0];
    if (!targetRec) return { success: false, gain: 0, title: '' };

    const gain = targetRec.expectedGain || 42800;
    const title = targetRec.title;

    // 1. Filter out the applied recommendation so the next one displays
    const updatedRecs = recommendations.filter((r) => r.id !== targetRec.id);
    setRecommendations(updatedRecs);

    // 2. Update metrics (increase recovered revenue, decrease money leakage, improve recovery rate)
    const updatedMetrics: RevenueSummaryMetrics = {
      ...metrics,
      recoveredRevenue: metrics.recoveredRevenue + gain,
      moneyLeakageToday: Math.max(0, metrics.moneyLeakageToday - gain),
      recoverySuccessRate: Math.min(99.4, +(metrics.recoverySuccessRate + 2.4).toFixed(1)),
      failedPaymentsCount: Math.max(0, metrics.failedPaymentsCount - 1),
    };
    setMetrics(updatedMetrics);

    // 3. Add to activity logs
    const newLog: ActivityLogItem = {
      id: `log_strat_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'RETRY_SCHEDULED',
      title: `✨ AI Strategy Executed: ${targetRec.recommendedAction || 'Applied'}`,
      description: `${title} · Projected GMV Gain: +₹${gain.toLocaleString('en-IN')}`,
      customerName: 'Autonomous Optimization Batch',
      amount: gain,
      status: 'SUCCESS',
      complianceTag: 'Strategy Applied',
    };
    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);

    // 4. Update matching recovery sessions to SCHEDULED or RECOVERED
    const updatedRecoveries = recoveries.map((rec) => {
      if (targetRec.category === 'TIMING_OPTIMIZATION' && rec.failureCode === 'U30') {
        return {
          ...rec,
          aiDecision: {
            ...rec.aiDecision,
            headline: '09:15 AM Clearing Window Optimized',
            rationale: 'Rescheduled to morning interbank liquidity batch per applied strategy.',
          },
          nextRetryTime: new Date(Date.now() + 14 * 3600000).toISOString(),
        };
      }
      return rec;
    });
    setRecoveries(updatedRecoveries);

    // Persist changes
    persistChanges(updatedRecoveries, updatedLogs, updatedMetrics, customers, updatedRecs);

    return { success: true, gain, title };
  };

  const resetRecommendations = () => {
    if (user) {
      const fresh = generateInitialMerchantData(user);
      setRecommendations(fresh.recommendations);
      persistChanges(recoveries, activityLogs, metrics, customers, fresh.recommendations);
    }
  };

  // Real Database & Persistent Scenario Triggers
  const triggerU30Scenario = async () => {
    const cust = customers[0] || {
      name: 'Aman Verma',
      email: 'aman.verma@techcorp.in',
      phone: '+91 98201 44321',
      company: 'Enterprise SaaS Pro',
    };

    const newRec: RecoveryRecord = {
      id: `rec_u30_${Date.now()}`,
      customerId: cust.id || `cust_${Date.now()}`,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      type: 'SUBSCRIPTION_AUTOPAY',
      planOrItemName: 'Enterprise SaaS Annual',
      amount: 4999,
      recoveredAmount: 0,
      appliedDiscountPct: 0,
      status: 'SCHEDULED_RETRY',
      failureCode: 'U30',
      failureReason: 'Debit failed: Insufficient funds in account (Salary cycle sync active)',
      failureCategory: 'TRANSIENT',
      currentAttempt: 1,
      maxAttempts: 3,
      nextRetryTime: new Date(Date.now() + 18 * 3600000).toISOString(),
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
          scheduledFor: new Date().toISOString(),
          executedAt: new Date().toISOString(),
          status: 'failed',
          errorCode: 'U30',
          cooldownHoursMet: 24,
        },
      ],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: cust.phone,
          messageBody: 'Hi Aman, your subscription retry has been scheduled for tomorrow 09:15 AM.',
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecs = [newRec, ...recoveries];
    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'RETRY_SCHEDULED',
      title: 'U30 Payment Failed & Recovery Scheduled',
      description: `AI scheduled retry for 09:15 AM salary window · ${cust.name} · ₹4,999`,
      customerName: cust.name,
      amount: 4999,
      status: 'INFO',
      complianceTag: 'NPCI OC-136',
    };
    const updatedLogs = [newLog, ...activityLogs];
    const updatedMetrics: RevenueSummaryMetrics = {
      ...metrics,
      moneyLeakageToday: metrics.moneyLeakageToday + 4999,
      failedPaymentsCount: metrics.failedPaymentsCount + 1,
    };

    setRecoveries(updatedRecs);
    setActivityLogs(updatedLogs);
    setMetrics(updatedMetrics);
    setSelectedRecovery(newRec);
    setIsDrawerOpen(true);
    persistChanges(updatedRecs, updatedLogs, updatedMetrics, customers, recommendations);

    // Try backend in background
    try {
      await paymentsService.createPayment({
        customer: cust,
        amount: 4999,
        paymentType: 'SUBSCRIPTION',
        scenario: 'U30',
        failureCode: 'U30',
        bank: 'HDFC Bank',
      });
    } catch {
      // local store already updated
    }
  };

  const triggerNpciLimitBreachScenario = async () => {
    const cust = customers[2] || {
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@cloudinfra.net',
      phone: '+91 98300 11984',
      company: 'Cloud Dedicated Cluster',
    };

    const newRec: RecoveryRecord = {
      id: `rec_npci_${Date.now()}`,
      customerId: cust.id || `cust_${Date.now()}`,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
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
      nextRetryTime: new Date(Date.now() + 86400000).toISOString(),
      cooldownHoursRemaining: 0,
      stopReason: 'NPCI OC-136 Hard Stop Cap: Prevented ₹250 bank penalty charge',
      paymentLinkUrl: `http://localhost:3005/pay/rec_npci_${Date.now()}`,
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
        { attemptNumber: 1, scheduledFor: new Date(Date.now() - 72 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
        { attemptNumber: 2, scheduledFor: new Date(Date.now() - 48 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
        { attemptNumber: 3, scheduledFor: new Date(Date.now() - 24 * 3600000).toISOString(), status: 'failed', errorCode: 'U30', cooldownHoursMet: 24 },
      ],
      notificationHistory: [
        {
          channel: 'WHATSAPP',
          recipient: cust.phone,
          messageBody: 'Vikramaditya, mandate retry cap reached. Clear ₹12,500 invoice via secure UPI link.',
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecs = [newRec, ...recoveries];
    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'NPCI_VALIDATED',
      title: 'NPCI 3-Attempt Hard Stop Activated',
      description: `Halting auto-debit strictly after Attempt 3. Dispatched link · ₹12,500`,
      customerName: cust.name,
      amount: 12500,
      status: 'WARNING',
      complianceTag: 'Cap Protected',
    };
    const updatedLogs = [newLog, ...activityLogs];

    setRecoveries(updatedRecs);
    setActivityLogs(updatedLogs);
    setSelectedRecovery(newRec);
    setIsDrawerOpen(true);
    persistChanges(updatedRecs, updatedLogs, metrics, customers, recommendations);

    try {
      await paymentsService.createPayment({
        customer: cust,
        amount: 12500,
        paymentType: 'SUBSCRIPTION',
        scenario: 'NPCI_LIMIT_REACHED',
        failureCode: 'U30',
        bank: 'ICICI Bank',
      });
    } catch {
      // local store already updated
    }
  };

  const triggerTerminalZgScenario = async () => {
    const cust = customers[3] || {
      name: 'Deepak Patel',
      email: 'deepak.p@pateltraders.com',
      phone: '+91 97234 88190',
      company: 'Inventory Suite ERP',
    };

    const newRec: RecoveryRecord = {
      id: `rec_zg_${Date.now()}`,
      customerId: cust.id || `cust_${Date.now()}`,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
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
      nextRetryTime: new Date(Date.now() + 86400000).toISOString(),
      cooldownHoursRemaining: 0,
      stopReason: 'Terminal ZG Error: Mandate re-authorization required',
      paymentLinkUrl: `http://localhost:3005/pay/rec_zg_${Date.now()}`,
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
        { attemptNumber: 1, scheduledFor: new Date().toISOString(), status: 'failed', errorCode: 'ZG', cooldownHoursMet: 24 },
      ],
      notificationHistory: [
        {
          channel: 'SMS',
          recipient: cust.phone,
          messageBody: 'Deepak, your UPI AutoPay mandate needs re-linking. Tap to update: revora.ai/m/reauth',
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecs = [newRec, ...recoveries];
    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'RECOVERY_CLOSED',
      title: 'Terminal ZG Error: Auto-Debit Halted',
      description: `Mandate VPA revoked. 0 retries scheduled to prevent blacklist · ₹2,199`,
      customerName: cust.name,
      amount: 2199,
      status: 'DANGER',
      complianceTag: 'Terminal Halt',
    };
    const updatedLogs = [newLog, ...activityLogs];

    setRecoveries(updatedRecs);
    setActivityLogs(updatedLogs);
    setSelectedRecovery(newRec);
    setIsDrawerOpen(true);
    persistChanges(updatedRecs, updatedLogs, metrics, customers, recommendations);

    try {
      await paymentsService.createPayment({
        customer: cust,
        amount: 2199,
        paymentType: 'SUBSCRIPTION',
        scenario: 'INVALID_MPIN',
        failureCode: 'ZG',
        bank: 'Paytm Payments Bank',
      });
    } catch {
      // local store already updated
    }
  };

  const triggerCheckoutDropoffScenario = async () => {
    const cust = customers[4] || {
      name: 'Rohit Shenoy',
      email: 'rohit.s@startupmail.com',
      phone: '+91 98110 99887',
      company: 'Analytics Pro',
    };

    const newRec: RecoveryRecord = {
      id: `rec_cart_${Date.now()}`,
      customerId: cust.id || `cust_${Date.now()}`,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
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
      nextRetryTime: new Date(Date.now() + 4 * 3600000).toISOString(),
      cooldownHoursRemaining: 4,
      stopReason: null,
      paymentLinkUrl: `http://localhost:3005/pay/rec_cart_${Date.now()}`,
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
          recipient: cust.phone,
          messageBody: 'Rohit, complete your Analytics Pro checkout with 5% off: revora.ai/pay/5off',
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecs = [newRec, ...recoveries];
    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'LINK_GENERATED',
      title: 'Abandoned Checkout Detected · 5% Nudge Sent',
      description: `Dispatched WhatsApp 5% recovery link · ${cust.name} · ₹3,499`,
      customerName: cust.name,
      amount: 3499,
      status: 'INFO',
      complianceTag: 'Checkout Rescue',
    };
    const updatedLogs = [newLog, ...activityLogs];

    setRecoveries(updatedRecs);
    setActivityLogs(updatedLogs);
    setSelectedRecovery(newRec);
    setIsDrawerOpen(true);
    persistChanges(updatedRecs, updatedLogs, metrics, customers, recommendations);

    try {
      await paymentsService.createPayment({
        customer: cust,
        amount: 3499,
        paymentType: 'CHECKOUT',
        scenario: 'CHECKOUT_ABANDONED',
        bank: 'Kotak Mahindra Bank',
      });
    } catch {
      // local store already updated
    }
  };

  const triggerCustomerPaymentScenario = async (recoveryId?: string) => {
    let target = recoveryId ? recoveries.find((r) => r.id === recoveryId) : null;
    if (!target) {
      target = recoveries.find((r) => !r.status.startsWith('RECOVERED'));
    }

    const amountRescued = target ? target.amount : 4999;
    const customerName = target ? target.customerName : 'Customer';

    const updatedRecs = recoveries.map((r) => {
      if ((target && r.id === target.id) || (!target && r.id === recoveries[0]?.id)) {
        return {
          ...r,
          status: 'RECOVERED_VIA_LINK' as const,
          recoveredAmount: r.amount,
          cooldownHoursRemaining: 0,
          aiDecision: {
            ...r.aiDecision,
            action: 'PAYMENT_CAPTURED',
            headline: `Payment Settled via Razorpay Rail (₹${r.amount.toLocaleString('en-IN')})`,
            rationale: 'Customer completed payment via WhatsApp UPI intent link.',
          },
        };
      }
      return r;
    });

    const updatedMetrics: RevenueSummaryMetrics = {
      ...metrics,
      recoveredRevenue: metrics.recoveredRevenue + amountRescued,
      moneyLeakageToday: Math.max(0, metrics.moneyLeakageToday - amountRescued),
      recoverySuccessRate: Math.min(99.8, +(metrics.recoverySuccessRate + 1.8).toFixed(1)),
      failedPaymentsCount: Math.max(0, metrics.failedPaymentsCount - 1),
    };

    const newLog: ActivityLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'PAYMENT_CAPTURED',
      title: 'Autonomous Payment Capture: Revenue Rescued',
      description: `Payment captured via Razorpay UPI rail · ${customerName} · ₹${amountRescued.toLocaleString('en-IN')}`,
      customerName,
      amount: amountRescued,
      status: 'SUCCESS',
      complianceTag: 'Rescued',
    };
    const updatedLogs = [newLog, ...activityLogs];

    setRecoveries(updatedRecs);
    setMetrics(updatedMetrics);
    setActivityLogs(updatedLogs);
    if (selectedRecovery && target && selectedRecovery.id === target.id) {
      setSelectedRecovery({
        ...selectedRecovery,
        status: 'RECOVERED_VIA_LINK',
        recoveredAmount: selectedRecovery.amount,
      });
    }
    persistChanges(updatedRecs, updatedLogs, updatedMetrics, customers, recommendations);

    try {
      if (recoveryId) {
        await paymentsService.capturePayment(recoveryId);
      }
    } catch {
      // local store already updated
    }
  };

  const stopRecovery = async (id: string, reason?: string) => {
    const updatedRecs = recoveries.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: 'STOP_MANUAL_CANCELLED' as const,
          stopReason: reason || 'Merchant manually stopped automated retry queue',
        };
      }
      return r;
    });
    setRecoveries(updatedRecs);
    persistChanges(updatedRecs, activityLogs, metrics, customers, recommendations);
    try {
      await recoveriesService.stopRecovery(id, reason);
    } catch {
      // local store updated
    }
  };

  const resetToDefaults = async () => {
    if (user) {
      const fresh = generateInitialMerchantData(user);
      setRecoveries(fresh.recoveries);
      setActivityLogs(fresh.activityLogs);
      setMetrics(fresh.metrics);
      setCustomers(fresh.customers);
      setRecommendations(fresh.recommendations);
      persistChanges(fresh.recoveries, fresh.activityLogs, fresh.metrics, fresh.customers, fresh.recommendations);
    }
  };

  return (
    <SimulatorContext.Provider
      value={{
        recoveries,
        activityLogs,
        metrics,
        customers,
        recommendations,
        selectedRecovery,
        setSelectedRecovery,
        isDrawerOpen,
        setIsDrawerOpen,
        isLoading,
        refreshData,
        applyAIRecommendation,
        resetRecommendations,
        triggerU30Scenario,
        triggerNpciLimitBreachScenario,
        triggerTerminalZgScenario,
        triggerCheckoutDropoffScenario,
        triggerCustomerPaymentScenario,
        stopRecovery,
        resetToDefaults,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}
