'use client';

import React, { useState } from 'react';
import { StatsCard } from '@/components/ui/StatsCard';
import { Timeline, TimelineItem } from '@/components/ui/Timeline';
import { Button } from '@/components/ui/Button';
import { RevenueRecoveryChart } from '@/components/dashboard/RevenueRecoveryChart';
import { FailureBreakdownChart } from '@/components/dashboard/FailureBreakdownChart';
import { PaymentWizard } from '@/components/payments/PaymentWizard';
import { formatINR } from '@/utils/currency';
import { useSimulator } from '@/context/SimulatorContext';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/utils/date';
import {
  AlertCircle,
  TrendingUp,
  Zap,
  RefreshCw,
  Plus,
  Upload,
  PlayCircle,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

function AIRecommendation({ onApply }: { onApply: () => void }) {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    onApply();
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/50 p-7 xl:p-8 shadow-xs animate-fade-in delay-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shrink-0 shadow-xs">
            <Brain className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <p className="text-base font-extrabold text-slate-900">Today's AI Recommendation</p>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Highest Impact
              </span>
            </div>
            <p className="text-lg xl:text-xl font-bold text-slate-800">
              Move tomorrow's SBI retries to the{' '}
              <span className="text-indigo-700 underline decoration-indigo-300 decoration-2 underline-offset-4">
                09:15 AM salary clearing window
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Expected gain:</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">₹42,800</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Confidence:</span>
                <span className="text-base font-extrabold text-indigo-700">94%</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          size="md"
          onClick={handleApply}
          className={applied ? 'bg-emerald-600 hover:bg-emerald-600 gap-2 shrink-0' : 'gap-2 shrink-0'}
        >
          {applied ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Applied!
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Apply Strategy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { metrics, activityLogs, triggerU30Scenario } = useSimulator();
  const { user } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoToast, setDemoToast] = useState<string | null>(null);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRunDemo = async () => {
    setIsDemoRunning(true);
    setDemoToast('Simulating ₹4,999 payment failure & triggering AI recovery in MongoDB...');
    try {
      await triggerU30Scenario();
      setDemoToast('✅ Demo complete! Payment created, retry scheduled, and recovery drawer opened.');
      setTimeout(() => setDemoToast(null), 5000);
    } catch (err) {
      console.error('Error running demo:', err);
      setDemoToast('❌ Demo simulation error. Please check server connection.');
      setTimeout(() => setDemoToast(null), 5000);
    } finally {
      setIsDemoRunning(false);
    }
  };

  const timelineItems: TimelineItem[] = activityLogs.slice(0, 5).map((log) => ({
    id: log.id,
    time: formatRelativeTime(log.timestamp),
    title: log.title,
    description: `${log.customerName} · ${formatINR(log.amount)}`,
    status:
      log.status === 'SUCCESS'
        ? 'success'
        : log.status === 'WARNING'
        ? 'warning'
        : log.status === 'DANGER'
        ? 'danger'
        : 'info',
    meta: log.complianceTag ? (
      <span className="inline-block text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
        {log.complianceTag}
      </span>
    ) : undefined,
  }));

  return (
    <div className="space-y-8 xl:space-y-10 animate-fade-in w-full">
      {/* Toast Notification if demo triggered */}
      {demoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-in-up">
          {isDemoRunning ? (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
          ) : (
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{demoToast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1
            className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight"
            suppressHydrationWarning
          >
            {greeting()}, {user?.name?.split(' ')[0] || user?.businessName?.split(' ')[0] || 'Merchant'} 👋
          </h1>
          <p className="text-base xl:text-lg text-slate-500 mt-2 font-medium">
            Here's your real-time autonomous revenue recovery overview for today.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            className="gap-2 text-slate-700 font-bold hover:text-indigo-600 hover:border-indigo-300"
            onClick={handleRunDemo}
            isLoading={isDemoRunning}
          >
            <PlayCircle className="h-5 w-5 text-indigo-600" />
            {isDemoRunning ? 'Simulating...' : 'Run Demo'}
          </Button>
        </div>
      </div>

      {/* 4 Spacious KPI Cards in 4-Col Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
        <StatsCard
          title="Money at Risk"
          value={formatINR(metrics.moneyLeakageToday)}
          subtitle="Failed payments today"
          change={-4.1}
          icon={<AlertCircle className="h-6 w-6" />}
          accentColor="rose"
          animate
        />
        <StatsCard
          title="Recovered Revenue"
          value={formatINR(metrics.recoveredRevenue, { compact: true })}
          subtitle="Rescued from failure"
          change={19.2}
          icon={<TrendingUp className="h-6 w-6" />}
          accentColor="emerald"
          animate
        />
        <StatsCard
          title="Recovery Rate"
          value={`${metrics.recoverySuccessRate}%`}
          subtitle={`Target: > 65.0%`}
          change={3.2}
          icon={<Zap className="h-6 w-6" />}
          accentColor="indigo"
          animate
        />
        <StatsCard
          title="Active Recoveries"
          value={metrics.failedPaymentsCount}
          subtitle="In progress right now"
          icon={<RefreshCw className="h-6 w-6" />}
          accentColor="amber"
          animate
        />
      </div>

      {/* AI Recommendation Banner */}
      <AIRecommendation onApply={() => handleRunDemo()} />

      {/* Charts Row in 3-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <RevenueRecoveryChart />
        </div>
        <div>
          <FailureBreakdownChart />
        </div>
      </div>

      {/* Activity + Quick Actions in 3-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-7 xl:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <a
              href="/insights?tab=activity"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <Timeline items={timelineItems} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-7 xl:p-8 flex flex-col gap-4 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Quick Actions</h2>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/70 transition-all group text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors shrink-0">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">New Payment</p>
              <p className="text-sm text-slate-500">Create & simulate a payment</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Import Payments</p>
              <p className="text-sm text-slate-500">Upload CSV or connect Razorpay</p>
            </div>
          </button>

          <button
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/70 transition-all group text-left disabled:opacity-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors shrink-0">
              {isDemoRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">
                {isDemoRunning ? 'Simulating in MongoDB...' : 'Run Demo'}
              </p>
              <p className="text-sm text-slate-500">See AI recovery in action</p>
            </div>
          </button>
        </div>
      </div>

      <PaymentWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
