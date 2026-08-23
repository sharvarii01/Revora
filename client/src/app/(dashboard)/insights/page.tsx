'use client';

import React, { useEffect, useState } from 'react';
import { Timeline, TimelineItem } from '@/components/ui/Timeline';
import { RevenueRecoveryChart } from '@/components/dashboard/RevenueRecoveryChart';
import { FailureBreakdownChart } from '@/components/dashboard/FailureBreakdownChart';
import { ChannelEfficiencyChart, FailureHeatmap } from '@/components/analytics/ChannelEfficiencyChart';
import { Button } from '@/components/ui/Button';
import { aiService } from '@/services/ai.service';
import { useSimulator } from '@/context/SimulatorContext';
import { formatINR } from '@/utils/currency';
import { formatRelativeTime, formatDateTime } from '@/utils/date';
import { Brain, RefreshCw, Loader2, BarChart3, ScrollText, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

type Tab = 'recommendations' | 'analytics' | 'activity' | 'compliance';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'recommendations', label: 'AI Recommendations', icon: <Brain className="h-4 w-4" /> },
  { id: 'analytics', label: 'Telemetry & Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'activity', label: 'Activity Audit Log', icon: <ScrollText className="h-4 w-4" /> },
  { id: 'compliance', label: 'NPCI Compliance Guard', icon: <ShieldCheck className="h-4 w-4" /> },
];

function AIRecommendationsTab() {
  const { recoveries } = useSimulator();
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.getInsights();
      if (data) setInsights(data);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, [recoveries]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-base text-slate-500 font-medium">Generating AI insights from MongoDB telemetry…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prioritized AI Recommendations</h2>
          <p className="text-base text-slate-500 mt-1">Ranked by estimated revenue impact and regulatory compliance</p>
        </div>
        <Button variant="outline" size="md" onClick={fetchInsights} className="gap-2 font-bold text-slate-700">
          <RefreshCw className="h-4 w-4" />
          Re-Analyze
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="bg-white rounded-3xl border border-slate-200 p-7 xl:p-8 flex flex-col justify-between gap-6 card-hover shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold shrink-0">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                      {ins.category}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Confidence: {typeof ins.confidenceScore === 'number' && ins.confidenceScore <= 1 ? Math.round(ins.confidenceScore * 100) : ins.confidenceScore}%
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {ins.impactMetric}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{ins.title}</h3>
              <p className="text-base text-slate-600 leading-relaxed">{ins.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">NPCI OC-136 Guarded</span>
              <Button size="sm" className="gap-1.5 font-bold">
                <Zap className="h-4 w-4" />
                {ins.recommendedAction || 'Apply Strategy'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLogTab() {
  const { activityLogs } = useSimulator();
  const [filter, setFilter] = useState('ALL');

  const filtered = activityLogs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.status === filter;
  });

  const timelineItems: TimelineItem[] = filtered.map((log) => ({
    id: log.id,
    time: formatDateTime(log.timestamp) + ' · ' + formatRelativeTime(log.timestamp),
    title: log.title,
    description: `${log.description} · Customer: ${log.customerName} · ${formatINR(log.amount)}`,
    status:
      log.status === 'SUCCESS'
        ? 'success'
        : log.status === 'WARNING'
        ? 'warning'
        : log.status === 'DANGER'
        ? 'danger'
        : 'info',
    meta: log.complianceTag ? (
      <span className="inline-block text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
        {log.complianceTag}
      </span>
    ) : undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Autonomous Execution Audit Log</h2>
          <p className="text-base text-slate-500 mt-1">Immutable timestamped audit trail of all AI recovery events</p>
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'SUCCESS', 'WARNING', 'DANGER'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                'px-4 py-2 text-sm font-bold rounded-xl transition-colors',
                filter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-7 xl:p-8 shadow-xs">
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
}

function ComplianceTab() {
  const rules = [
    {
      rule: 'NPCI UPI AutoPay Circular OC-136',
      description: 'Strict 3-presentation maximum per mandate failure cycle with mandatory 24h cooling off window.',
      status: 'ENFORCED',
      violationCount: 0,
    },
    {
      rule: 'RBI Master Directions for Recurring Payments',
      description: 'Out-of-band pre-debit advisory dispatched >= 24h prior to presentation on WhatsApp/SMS rail.',
      status: 'ENFORCED',
      violationCount: 0,
    },
    {
      rule: 'Discount Floor Ceiling Guard',
      description: 'Maximum permitted dynamic cart rescue discount locked at 10.0%. Floor protection active.',
      status: 'ENFORCED',
      violationCount: 0,
    },
    {
      rule: 'Customer Opt-Out & Revocation Webhook',
      description: 'Instant halt upon receiving mandate revocation event from PSP remitter switch.',
      status: 'ENFORCED',
      violationCount: 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Regulatory Compliance Engine</h2>
        <p className="text-base text-slate-500 mt-1">Real-time enforcement of Indian banking guidelines (NPCI & RBI)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
          <p className="text-sm font-semibold text-slate-500">Compliance Score</p>
          <p className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">100.0%</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Zero regulatory violations</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
          <p className="text-sm font-semibold text-slate-500">Mandate Penalties Prevented</p>
          <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">52</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Saved ~₹13,000 in bounce fees</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
          <p className="text-sm font-semibold text-slate-500">Cooldown Guardrails</p>
          <p className="text-3xl font-extrabold text-indigo-700 font-mono mt-1">24h Active</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">No presentation spam</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100">
          <p className="text-lg font-bold text-slate-900">Active Regulatory Guardrails</p>
        </div>
        <div className="divide-y divide-slate-100">
          {rules.map((r, i) => (
            <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">{r.rule}</p>
                <p className="text-sm text-slate-500">{r.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');

  return (
    <div className="space-y-8 xl:space-y-10 animate-fade-in w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
          Intelligence & Analytics
        </h1>
        <p className="text-base xl:text-lg text-slate-500 mt-1 font-medium">
          Autonomous AI decision telemetry, revenue analytics, and NPCI regulatory audit records.
        </p>
      </div>

      {/* Tabs (48px height) */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-6 py-3.5 text-base font-bold transition-all border-b-2 -mb-px whitespace-nowrap rounded-t-xl',
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'recommendations' && <AIRecommendationsTab />}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <RevenueRecoveryChart />
              </div>
              <div>
                <FailureBreakdownChart />
              </div>
            </div>
            <ChannelEfficiencyChart />
            <FailureHeatmap />
          </div>
        )}

        {activeTab === 'activity' && <ActivityLogTab />}

        {activeTab === 'compliance' && <ComplianceTab />}
      </div>
    </div>
  );
}
