'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RecoveryRecord } from '@/types/recovery';
import { ActivityLogItem } from '@/types/ai';
import { RevenueSummaryMetrics } from '@/types/analytics';
import { recoveriesService } from '@/services/recoveries.service';
import { analyticsService } from '@/services/analytics.service';
import { paymentsService } from '@/services/payments.service';

interface SimulatorContextType {
  recoveries: RecoveryRecord[];
  activityLogs: ActivityLogItem[];
  metrics: RevenueSummaryMetrics;
  selectedRecovery: RecoveryRecord | null;
  setSelectedRecovery: (rec: RecoveryRecord | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Real Database Triggers
  triggerU30Scenario: () => Promise<void>;
  triggerNpciLimitBreachScenario: () => Promise<void>;
  triggerTerminalZgScenario: () => Promise<void>;
  triggerCheckoutDropoffScenario: () => Promise<void>;
  triggerCustomerPaymentScenario: (recoveryId?: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const INITIAL_EMPTY_METRICS: RevenueSummaryMetrics = {
  totalRevenue: 0,
  recoveredRevenue: 0,
  moneyLeakageToday: 0,
  recoverySuccessRate: 0,
  failedPaymentsCount: 0,
  failedPaymentsAmount: 0,
  failedSubscriptionsCount: 0,
  recoveredCustomersCount: 0,
  aiHealthScore: 100,
  npciComplianceRate: 100.0,
  npciViolationsPrevented: 0,
  averageRetriesToSuccess: 1.0,
};

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
            messageBody: 'Hi Aman, your subscription retry has been scheduled for tomorrow 09:15 AM.',
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
  const [recoveries, setRecoveries] = useState<RecoveryRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [metrics, setMetrics] = useState<RevenueSummaryMetrics>(INITIAL_EMPTY_METRICS);
  const [selectedRecovery, setSelectedRecovery] = useState<RecoveryRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [summaryRes, recoveriesRes, logsRes] = await Promise.all([
        analyticsService.getSummary(),
        recoveriesService.getRecoveries({ limit: 100 }),
        analyticsService.getActivityLogs({ limit: 50 }),
      ]);

      if (summaryRes) setMetrics(summaryRes);
      if (recoveriesRes?.data) {
        const mapped = recoveriesRes.data.map(mapRecoverySessionToRecord);
        // Deduplicate recoveries by unique ID
        const uniqueRecoveries = Array.from(
          new Map<string, RecoveryRecord>(mapped.map((r: RecoveryRecord) => [r.id, r])).values()
        );
        setRecoveries(uniqueRecoveries);
        if (selectedRecovery) {
          const updated = uniqueRecoveries.find((r: RecoveryRecord) => r.id === selectedRecovery.id);
          if (updated) setSelectedRecovery(updated);
        }
      }
      if (logsRes?.data) {
        setActivityLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Error refreshing live data from MongoDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRecovery]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real Database-driven triggers that call backend REST APIs
  const triggerU30Scenario = async () => {
    try {
      const res = await paymentsService.createPayment({
        customer: {
          name: 'Aman Verma',
          email: 'aman.verma@techcorp.in',
          phone: '+91 98201 44321',
          company: 'Enterprise SaaS Pro',
        },
        amount: 4999,
        paymentType: 'SUBSCRIPTION',
        scenario: 'U30',
        failureCode: 'U30',
        bank: 'HDFC Bank',
      });
      await refreshData();
      if (res?.recovery) {
        setSelectedRecovery(mapRecoverySessionToRecord(res.recovery));
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error triggering U30 payment in MongoDB:', err);
    }
  };

  const triggerNpciLimitBreachScenario = async () => {
    try {
      const res = await paymentsService.createPayment({
        customer: {
          name: 'Vikramaditya Roy',
          email: 'vikram.roy@cloudinfra.net',
          phone: '+91 98300 11984',
          company: 'Cloud Dedicated',
        },
        amount: 12500,
        paymentType: 'SUBSCRIPTION',
        scenario: 'NPCI_LIMIT_REACHED',
        failureCode: 'U30',
        bank: 'ICICI Bank',
      });
      await refreshData();
      if (res?.recovery) {
        setSelectedRecovery(mapRecoverySessionToRecord(res.recovery));
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error triggering Stop State in MongoDB:', err);
    }
  };

  const triggerTerminalZgScenario = async () => {
    try {
      const res = await paymentsService.createPayment({
        customer: {
          name: 'Deepak Patel',
          email: 'deepak.p@pateltraders.com',
          phone: '+91 97234 88190',
          company: 'Inventory Suite',
        },
        amount: 2199,
        paymentType: 'SUBSCRIPTION',
        scenario: 'INVALID_MPIN',
        failureCode: 'ZG',
        bank: 'Paytm Payments Bank',
      });
      await refreshData();
      if (res?.recovery) {
        setSelectedRecovery(mapRecoverySessionToRecord(res.recovery));
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error triggering Terminal ZG in MongoDB:', err);
    }
  };

  const triggerCheckoutDropoffScenario = async () => {
    try {
      const res = await paymentsService.createPayment({
        customer: {
          name: 'Rohit Shenoy',
          email: 'rohit.s@startupmail.com',
          phone: '+91 98110 99887',
          company: 'Analytics Pro',
        },
        amount: 3499,
        paymentType: 'CHECKOUT',
        scenario: 'CHECKOUT_ABANDONED',
        bank: 'Kotak Mahindra Bank',
      });
      await refreshData();
      if (res?.recovery) {
        setSelectedRecovery(mapRecoverySessionToRecord(res.recovery));
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error triggering Checkout Recovery in MongoDB:', err);
    }
  };

  const triggerCustomerPaymentScenario = async (recoveryId?: string) => {
    try {
      if (recoveryId) {
        await paymentsService.capturePayment(recoveryId);
      } else {
        const activeUnrecovered = recoveries.find(
          (r) => !r.status.startsWith('RECOVERED')
        );
        if (activeUnrecovered) {
          await paymentsService.capturePayment(activeUnrecovered.id);
        } else {
          await paymentsService.createPayment({
            customer: {
              name: 'Priya Sundaram',
              email: 'priya.s@designstudio.io',
              phone: '+91 98110 55672',
            },
            amount: 1499,
            status: 'captured',
            scenario: 'SUCCESS',
          });
        }
      }
      await refreshData();
    } catch (err) {
      console.error('Error settling payment in MongoDB:', err);
    }
  };

  const resetToDefaults = async () => {
    await refreshData();
  };

  return (
    <SimulatorContext.Provider
      value={{
        recoveries,
        activityLogs,
        metrics,
        selectedRecovery,
        setSelectedRecovery,
        isDrawerOpen,
        setIsDrawerOpen,
        isLoading,
        refreshData,
        triggerU30Scenario,
        triggerNpciLimitBreachScenario,
        triggerTerminalZgScenario,
        triggerCheckoutDropoffScenario,
        triggerCustomerPaymentScenario,
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
