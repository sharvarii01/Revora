'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface NpciAttemptProgressProps {
  currentAttempt: number;
  maxAttempts: number;
  isTerminal?: boolean;
  cooldownHoursRemaining?: number;
  className?: string;
}

export function NpciAttemptProgress({
  currentAttempt,
  maxAttempts = 3,
  isTerminal = false,
  cooldownHoursRemaining,
  className,
}: NpciAttemptProgressProps) {
  const steps = [1, 2, 3];

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-xs', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>NPCI AutoPay Compliance Cycle</span>
        </div>
        <span className="font-mono text-xs text-slate-500 font-semibold">
          {isTerminal ? '0 Retries Allowed' : `Attempt ${Math.min(currentAttempt, maxAttempts)} of ${maxAttempts}`}
        </span>
      </div>

      {/* Visual Stepper */}
      <div className="grid grid-cols-3 gap-2.5">
        {steps.map((step) => {
          const isCompleted = currentAttempt > step;
          const isCurrent = currentAttempt === step;
          const isPending = currentAttempt < step;

          return (
            <div
              key={step}
              className={cn(
                'rounded-xl border p-3 transition-all text-center flex flex-col items-center justify-center shadow-2xs',
                isCompleted && 'border-slate-200 bg-slate-100/80 text-slate-600',
                isCurrent && !isTerminal && 'border-indigo-300 bg-indigo-50 text-indigo-700 font-bold',
                isCurrent && isTerminal && 'border-rose-300 bg-rose-50 text-rose-700 font-bold',
                isPending && 'border-slate-100 bg-slate-50 text-slate-400'
              )}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold mb-0.5">
                {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />}
                {isCurrent && !isTerminal && <Clock className="h-3.5 w-3.5 text-indigo-600 animate-spin" />}
                {isCurrent && isTerminal && <AlertCircle className="h-3.5 w-3.5 text-rose-600" />}
                <span>Attempt {step}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {step === 1 && 'Initial Presentation'}
                {step === 2 && '24h Cooldown Retry'}
                {step === 3 && 'Final Legal Retry'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Cooldown and Stop Warning Footer */}
      <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 font-medium">
        {cooldownHoursRemaining !== undefined && cooldownHoursRemaining > 0 ? (
          <span className="text-amber-700 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Cooldown Active: ~{cooldownHoursRemaining.toFixed(1)}h remaining
          </span>
        ) : currentAttempt >= maxAttempts ? (
          <span className="text-rose-700 font-bold flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Stop State: NPCI 3-Attempt Cap Reached (No further AutoPay debits)
          </span>
        ) : (
          <span className="text-emerald-700 font-bold">Valid presentation window active</span>
        )}
        <span className="font-mono text-[10px] text-slate-400">Rule: NPCI/UPI/OC-136</span>
      </div>
    </div>
  );
}
