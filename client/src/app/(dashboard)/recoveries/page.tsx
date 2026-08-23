'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RecoveryDataTable } from '@/components/recovery/RecoveryDataTable';
import { SubscriptionTable } from '@/components/subscription/SubscriptionTable';
import { RetryCalendarQueue } from '@/components/subscription/RetryCalendarQueue';
import { AbandonedCartTable } from '@/components/checkout/AbandonedCartTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSimulator } from '@/context/SimulatorContext';
import { cn } from '@/utils/cn';
import {
  RefreshCw,
  ShoppingCart,
  History,
  PlayCircle,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldX,
  Plus,
} from 'lucide-react';

type Tab = 'active' | 'subscriptions' | 'checkout' | 'history' | 'demo';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'active', label: 'Active Recoveries', icon: <RefreshCw className="h-4 w-4" /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <Zap className="h-4 w-4" /> },
  { id: 'checkout', label: 'Checkout Recovery', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'history', label: 'History Ledger', icon: <History className="h-4 w-4" /> },
  { id: 'demo', label: 'Demo Center', icon: <PlayCircle className="h-4 w-4" /> },
];

function DemoCenter() {
  const {
    triggerU30Scenario,
    triggerNpciLimitBreachScenario,
    triggerTerminalZgScenario,
    triggerCheckoutDropoffScenario,
    triggerCustomerPaymentScenario,
    resetToDefaults,
  } = useSimulator();

  const scenarios = [
    {
      id: 'u30',
      label: 'Insufficient Funds (U30)',
      description: 'AI detects salary cycle, enforces 24h NPCI cooldown, schedules retry at 09:15 AM clearing batch.',
      badge: 'Transient Error',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      actionLabel: 'Trigger Scenario',
      action: triggerU30Scenario,
      icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
      border: 'border-amber-200 hover:border-amber-300',
    },
    {
      id: 'npci',
      label: 'NPCI 3-Attempt Limit Reached',
      description: 'Halts presentation after Attempt 3 to prevent penalty charges under NPCI Circular OC-136.',
      badge: 'Regulatory Stop',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      actionLabel: 'Trigger Stop State',
      action: triggerNpciLimitBreachScenario,
      icon: <ShieldX className="h-6 w-6 text-rose-600" />,
      border: 'border-rose-200 hover:border-rose-300',
    },
    {
      id: 'terminal',
      label: 'Terminal VPA Revoked (ZG)',
      description: 'Immediately halts auto-debit retries. Dispatches WhatsApp update to re-link valid VPA.',
      badge: 'Terminal State',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      actionLabel: 'Trigger Terminal Flow',
      action: triggerTerminalZgScenario,
      icon: <AlertCircle className="h-6 w-6 text-slate-600" />,
      border: 'border-slate-200 hover:border-slate-300',
    },
    {
      id: 'checkout',
      label: 'Abandoned Checkout Recovery',
      description: 'Applies dynamic 5% time-decay discount link via WhatsApp to rescue dropped cart.',
      badge: 'Checkout Dropoff',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      actionLabel: 'Trigger Abandonment',
      action: triggerCheckoutDropoffScenario,
      icon: <ShoppingCart className="h-6 w-6 text-indigo-600" />,
      border: 'border-indigo-200 hover:border-indigo-300',
    },
    {
      id: 'recovered',
      label: 'Customer Completes Payment',
      description: 'Simulates payment completion via WhatsApp link. Updates health score and recovers revenue.',
      badge: 'Success Flow',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      actionLabel: 'Simulate Payment',
      action: () => triggerCustomerPaymentScenario(),
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      border: 'border-emerald-200 hover:border-emerald-300',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Interactive Scenario Simulator</h2>
        <p className="text-base text-slate-500 mt-1">
          Trigger real-time edge cases backed by MongoDB Atlas to observe Revora AI's autonomous compliance engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {scenarios.map((s) => (
          <div
            key={s.id}
            className={cn(
              'bg-white rounded-3xl border p-7 xl:p-8 flex flex-col justify-between gap-6 card-hover shadow-xs transition-all',
              s.border
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                  {s.icon}
                </div>
                <span className={cn('text-xs font-bold px-3 py-1 rounded-full border', s.badgeColor)}>
                  {s.badge}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 mb-2">{s.label}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
            </div>

            <Button
              size="md"
              variant="outline"
              onClick={s.action}
              className="w-full font-bold gap-2 text-slate-800 hover:text-indigo-700 hover:border-indigo-300"
            >
              <PlayCircle className="h-4 w-4" />
              {s.actionLabel}
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-500 font-medium">Reset all state and refetch fresh database records</p>
        <Button variant="ghost" size="md" onClick={resetToDefaults} className="text-slate-600 hover:text-slate-900 font-bold">
          Refresh Database Records
        </Button>
      </div>
    </div>
  );
}

function HistoryTab() {
  const { recoveries } = useSimulator();
  const historyRecords = recoveries.filter(
    (r) => r.status.startsWith('RECOVERED') || r.status.startsWith('STOP_')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recovery History Ledger</h2>
          <p className="text-base text-slate-500 mt-1">All settled and regulated stop cases recorded in MongoDB</p>
        </div>
        <Badge variant="secondary" className="font-mono text-sm px-3 py-1 font-bold">
          {historyRecords.length} Settled Cases
        </Badge>
      </div>

      <RecoveryDataTable filterStatus="STOPPED" />
    </div>
  );
}

function RecoveriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : 'active'
  );
  const { recoveries } = useSimulator();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/recoveries?tab=${tab}`, { scroll: false });
  };

  const activeCount = recoveries.filter(
    (r) => !r.status.startsWith('RECOVERED') && !r.status.startsWith('STOP_')
  ).length;

  return (
    <div className="space-y-8 xl:space-y-10 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
              Recovery Console
            </h1>
            {activeCount > 0 && (
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {activeCount} Active
              </span>
            )}
          </div>
          <p className="text-base xl:text-lg text-slate-500 font-medium">
            Monitor, orchestrate, and audit autonomous payment recovery workflows.
          </p>
        </div>
      </div>

      {/* Tabs (48px height) */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-6 py-3.5 text-base font-bold transition-all border-b-2 -mb-px whitespace-nowrap rounded-t-xl',
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'active' && activeCount > 0 && (
                <span
                  className={cn(
                    'text-xs font-extrabold px-2 py-0.5 rounded-full',
                    isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {activeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'active' && <RecoveryDataTable />}

        {activeTab === 'subscriptions' && (
          <div className="space-y-8">
            <SubscriptionTable />
            <RetryCalendarQueue />
          </div>
        )}

        {activeTab === 'checkout' && <AbandonedCartTable />}

        {activeTab === 'history' && <HistoryTab />}

        {activeTab === 'demo' && <DemoCenter />}
      </div>
    </div>
  );
}

export default function RecoveriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading recoveries...</div>}>
      <RecoveriesContent />
    </Suspense>
  );
}
