'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { CustomerProfile } from '@/types/customer';
import { formatINR } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Mail, Phone, CreditCard, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

export function CustomerProfileHeader({ customer }: { customer: CustomerProfile }) {
  return (
    <Card className="p-6 space-y-6 bg-white border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 text-xl font-bold border border-indigo-100 shadow-xs">
            {customer.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
              <Badge variant={customer.optedOut ? 'danger' : 'success'}>
                {customer.optedOut ? 'Opted Out' : 'Active Mandate'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Member since {formatDate(customer.memberSince)} • ID: <span className="font-mono">{customer.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right border-r border-slate-100 pr-4">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Customer LTV</span>
            <p className="text-lg font-bold text-slate-900 font-mono">{formatINR(customer.lifetimeValue)}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">AI Recovered</span>
            <p className="text-lg font-bold text-emerald-600 font-mono">{formatINR(customer.totalRecovered)}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <Mail className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-slate-400 text-[10px] font-semibold">Email Address</p>
            <p className="font-semibold text-slate-800">{customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <Phone className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-slate-400 text-[10px] font-semibold">Phone Number</p>
            <p className="font-semibold text-slate-800">{customer.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-slate-400 text-[10px] font-semibold">UPI VPA / Bank Rail</p>
            <p className="font-mono text-slate-800 font-bold">{customer.vpa || 'Card e-Mandate'}</p>
          </div>
        </div>
      </div>

      {/* AI Health & Risk Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-indigo-600" /> Account Health Score
            </span>
            <span className="font-bold text-indigo-700">{customer.healthScore}/100</span>
          </div>
          <Progress value={customer.healthScore} indicatorClassName="bg-indigo-600" className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Recovery Probability
            </span>
            <span className="font-bold text-emerald-700">{customer.recoveryProbability}%</span>
          </div>
          <Progress value={customer.recoveryProbability} indicatorClassName="bg-emerald-600" className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-600" /> Churn & Default Risk
            </span>
            <span className="font-bold text-rose-700">{customer.riskScore}%</span>
          </div>
          <Progress value={customer.riskScore} indicatorClassName="bg-rose-600" className="h-2" />
        </div>
      </div>
    </Card>
  );
}
