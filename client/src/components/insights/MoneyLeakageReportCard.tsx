'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/currency';
import { CheckCircle2 } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function MoneyLeakageReportCard() {
  const { metrics } = useSimulator();

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900">Daily AI Money Leakage Report</CardTitle>
            <CardDescription className="text-slate-500">Real-time audit of churn risk vs recovered capital</CardDescription>
          </div>
          <Badge variant="success" className="text-[10px] gap-1 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Live Audit
          </Badge>
        </div>
      </CardHeader>

      <div className="p-6 pt-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Today's Lost at Risk
            </span>
            <p className="text-base font-bold text-rose-600 font-mono mt-0.5">{formatINR(metrics.moneyLeakageToday)}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              AI Recovered Today
            </span>
            <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">
              {formatINR(metrics.moneyLeakageToday * 0.68)}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Active Recovery Rate
            </span>
            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{metrics.recoverySuccessRate}%</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Average Attempts
            </span>
            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{metrics.averageRetriesToSuccess}</p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
          <p className="font-bold text-slate-900">AI Revenue Operations Summary:</p>
          <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
            37 subscription mandates recovered in current cycle. 12 mandates reached compliance stop states (NPCI 3-attempt limit
            or VPA revocation) with zero bank chargeback penalties incurred.
          </p>
        </div>
      </div>
    </Card>
  );
}
