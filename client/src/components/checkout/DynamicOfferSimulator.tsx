'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/currency';
import { ShieldCheck } from 'lucide-react';

export function DynamicOfferSimulator() {
  const [maxDiscount] = useState(10);
  const sampleCart = 4999;

  const stage1Price = sampleCart;
  const stage2Price = sampleCart * 0.95; // 5% off
  const stage3Price = sampleCart * (1 - maxDiscount / 100);

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900">Autonomous Dynamic Incentive Funnel</CardTitle>
            <CardDescription className="text-slate-500">Margin-aware dynamic discount limits for checkout drop-offs</CardDescription>
          </div>
          <Badge variant="success" className="text-[10px] gap-1 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Margin Floor Protected
          </Badge>
        </div>
      </CardHeader>

      <div className="p-6 pt-4 space-y-4">
        {/* Stages Progression */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Stage 1 (T+15m)</span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">Gentle Cart Nudge</p>
            <p className="text-sm font-bold font-mono text-slate-900 mt-1">{formatINR(stage1Price)}</p>
            <span className="text-[10px] text-slate-500 font-medium">0% Discount (Direct Link)</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
            <span className="text-[10px] text-amber-800 uppercase font-bold">Stage 2 (T+3h)</span>
            <p className="text-xs font-bold text-amber-950 mt-0.5">Micro Incentive (5%)</p>
            <p className="text-sm font-bold font-mono text-emerald-700 mt-1">{formatINR(stage2Price)}</p>
            <span className="text-[10px] text-amber-700 font-medium">Saves {formatINR(sampleCart * 0.05)}</span>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-xs">
            <span className="text-[10px] text-indigo-800 uppercase font-bold">Stage 3 (T+24h)</span>
            <p className="text-xs font-bold text-indigo-950 mt-0.5">Final Ceiling Offer ({maxDiscount}%)</p>
            <p className="text-sm font-bold font-mono text-indigo-700 mt-1">{formatINR(stage3Price)}</p>
            <span className="text-[10px] text-indigo-700 font-medium">Saves {formatINR(sampleCart * (maxDiscount / 100))}</span>
          </div>
        </div>

        {/* Policy Floor Note */}
        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium leading-tight">
            Stage 4 (T+48h): If unresponsive, recovery terminates instantly. <strong className="text-slate-900 font-bold">Zero customer spam.</strong>
          </span>
          <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
            Hard Stop at T+48h
          </Badge>
        </div>
      </div>
    </Card>
  );
}
