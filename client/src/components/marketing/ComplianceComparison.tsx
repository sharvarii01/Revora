'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, X, ShieldCheck, AlertTriangle } from 'lucide-react';

export function ComplianceComparison() {
  const comparisonRows = [
    {
      feature: 'NPCI 3-Attempt Cap Compliance',
      traditional: 'Violates limits with 5–8 unthrottled retries',
      revora: 'Strictly halts at 3 attempts with zero violations',
      isRevoraBetter: true,
    },
    {
      feature: 'Bank Bounce & Penalty Fees',
      traditional: 'Incurs ~₹250 per failed debit charged to merchant/user',
      revora: '₹0 penalty fees via intelligent stop states',
      isRevoraBetter: true,
    },
    {
      feature: 'Mandatory 24h Cooldown Window',
      traditional: 'Retries instantly or every 4 hours (issuer throttled)',
      revora: 'Enforces compliant 24h cooldown per NPCI OC-136',
      isRevoraBetter: true,
    },
    {
      feature: 'Terminal Error Recognition (Revoked VPA / ZG)',
      traditional: 'Repeats invalid debits leading to account blocks',
      revora: 'Immediate hard stop (0 retries) + mandate re-onboard link',
      isRevoraBetter: true,
    },
    {
      feature: 'Interbank Liquidity Timing',
      traditional: 'Fires at random timestamps without banking context',
      revora: 'Batches presentations at optimal 09:15 AM clearing window',
      isRevoraBetter: true,
    },
    {
      feature: 'Customer Out-of-Band Recovery',
      traditional: 'Intrusive daily email spam',
      revora: 'WhatsApp UPI Intent payment link with 1-click Razorpay',
      isRevoraBetter: true,
    },
  ];

  return (
    <section id="compliance" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <Badge variant="success" className="text-xs font-mono uppercase font-bold">
            Zero-Violation Guarantee
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Traditional Brute-Force vs Revora Autonomous AI
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Why Western dunning scripts cause severe issuer blocks in India, and how Revora ensures full compliance.
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-lg">
          <div className="grid grid-cols-12 bg-slate-100/90 p-5 sm:p-6 text-xs sm:text-sm font-bold text-slate-700 border-b border-slate-200">
            <div className="col-span-4 sm:col-span-5">Payment Lifecycle Factor</div>
            <div className="col-span-4 sm:col-span-3 text-rose-700">Traditional Brute-Force</div>
            <div className="col-span-4 sm:col-span-4 text-emerald-700">Revora AI Platform</div>
          </div>

          <div className="divide-y divide-slate-100">
            {comparisonRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 p-5 sm:p-6 text-xs sm:text-sm items-center hover:bg-slate-50/70 transition-colors">
                <div className="col-span-4 sm:col-span-5 font-bold text-slate-900 pr-4">{row.feature}</div>
                <div className="col-span-4 sm:col-span-3 text-rose-600 font-medium flex items-start gap-2 pr-3">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-rose-500 mt-0.5" />
                  <span className="text-xs sm:text-sm leading-snug">{row.traditional}</span>
                </div>
                <div className="col-span-4 sm:col-span-4 text-emerald-800 font-semibold flex items-start gap-2">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-emerald-600 mt-0.5" />
                  <span className="text-xs sm:text-sm leading-snug">{row.revora}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
