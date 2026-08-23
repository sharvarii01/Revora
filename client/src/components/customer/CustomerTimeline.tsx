'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';

export function CustomerTimeline({ customerId }: { customerId: string }) {
  const customerEvents = [
    {
      title: 'AutoPay Presentation Scheduled (24h Cooldown)',
      date: '2026-08-21T08:16:10+05:30',
      description: 'AI analyzed code U30. Scheduled Attempt 2 for 22 Aug at 09:15 AM.',
      status: 'scheduled',
      amount: 4999,
      tag: 'NPCI_OC136_COMPLIANT',
    },
    {
      title: 'WhatsApp Pre-Debit Courtesy Notification Sent',
      date: '2026-08-21T08:16:05+05:30',
      description: 'Polite pre-retry reminder dispatched with instant 1-click Razorpay payment link.',
      status: 'sent',
      amount: 4999,
    },
    {
      title: 'Recurring Debit Failed (U30 Insufficient Balance)',
      date: '2026-08-21T08:15:22+05:30',
      description: 'HDFC Bank returned U30. Attempt 1/3 consumed.',
      status: 'failed',
      amount: 4999,
    },
    {
      title: 'Previous Renewal Cleared Successfully',
      date: '2026-07-21T09:15:00+05:30',
      description: 'UPI AutoPay debit cleared on Attempt 1.',
      status: 'success',
      amount: 4999,
    },
  ];

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-slate-900">Mandate Lifecycle & Recovery Timeline</CardTitle>
        <CardDescription className="text-slate-500">Chronological log of bank presentations, AI schedules, and customer communications</CardDescription>
      </CardHeader>

      <div className="p-6 pt-4 space-y-4">
        {customerEvents.map((evt, idx) => (
          <div key={idx} className="relative flex items-start gap-4 pb-4 last:pb-0 border-l-2 border-indigo-100 pl-4 ml-2">
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                <span className="text-[10px] text-slate-400 font-medium">{formatDateTime(evt.date)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">{evt.description}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono font-bold text-slate-900">{formatINR(evt.amount)}</span>
                {evt.tag && (
                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-mono">
                    {evt.tag}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
