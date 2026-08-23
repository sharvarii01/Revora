'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/currency';
import { Clock, ShieldCheck } from 'lucide-react';

export function RetryCalendarQueue() {
  const queueBatches = [
    {
      time: 'Tomorrow, 09:15 AM',
      tag: 'Morning Clearing Batch (Optimal)',
      mandatesCount: 8,
      totalAmount: 38400,
      banks: ['HDFC Bank', 'ICICI Bank', 'Axis Bank'],
      complianceNote: '24h+ Cooldown Verified',
    },
    {
      time: 'Tomorrow, 11:30 AM',
      tag: 'Pre-Lunch Settlement Batch',
      mandatesCount: 4,
      totalAmount: 14200,
      banks: ['State Bank of India', 'Kotak Bank'],
      complianceNote: '24h+ Cooldown Verified',
    },
    {
      time: '23 Aug, 09:15 AM',
      tag: 'Attempt 3 Final Legal Window',
      mandatesCount: 3,
      totalAmount: 21900,
      banks: ['HDFC Bank', 'Punjab National Bank'],
      complianceNote: 'Final Presentation Allowed',
    },
  ];

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900">Autonomous Banking Batch Queue</CardTitle>
            <CardDescription className="text-slate-500">Upcoming scheduled UPI AutoPay presentation windows</CardDescription>
          </div>
          <Badge variant="success" className="text-[10px] gap-1 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> NPCI OC-136 Cooldowns Met
          </Badge>
        </div>
      </CardHeader>

      <div className="p-6 pt-4 space-y-3">
        {queueBatches.map((batch, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:border-slate-200 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{batch.time}</span>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{batch.tag}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Routing across: <span className="text-slate-700 font-semibold">{batch.banks.join(', ')}</span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col sm:items-end justify-between border-t sm:border-t-0 border-slate-200/80 pt-2 sm:pt-0">
              <span className="text-xs font-mono font-bold text-slate-900">{formatINR(batch.totalAmount)}</span>
              <span className="text-[10px] text-emerald-700 font-bold">{batch.mandatesCount} Mandates Queued</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
