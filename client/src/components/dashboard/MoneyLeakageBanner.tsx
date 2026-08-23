'use client';

import React from 'react';
import { formatINR } from '@/utils/currency';
import { ShieldCheck, AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function MoneyLeakageBanner() {
  const { metrics } = useSimulator();

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/50 p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Autonomous Money Leakage Protection Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Revora has protected {formatINR(metrics.recoveredRevenue)} from recurring churn this cycle.
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            All failed presentations are evaluated through NPCI UPI AutoPay Circulars OC-136/141. Retries are scheduled
            strictly within valid banking hours (09:15 AM - 11:30 AM) with zero regulatory penalties.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs">
          <div className="border-r border-slate-200 pr-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Recovery Rate</p>
            <p className="text-xl font-bold text-emerald-600">{metrics.recoverySuccessRate}%</p>
          </div>
          <div className="border-r border-slate-200 pr-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Penalties Prevented</p>
            <p className="text-xl font-bold text-slate-900">{metrics.npciViolationsPrevented}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Avg Retries</p>
            <p className="text-xl font-bold text-slate-900">{metrics.averageRetriesToSuccess}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
