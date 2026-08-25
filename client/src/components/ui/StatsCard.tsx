'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // percentage change, positive = up, negative = down
  icon?: React.ReactNode;
  accentColor?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue';
  className?: string;
  animate?: boolean;
}

const accentConfig = {
  indigo: {
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
    bar: 'bg-indigo-500',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    bar: 'bg-emerald-500',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    bar: 'bg-rose-500',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    bar: 'bg-amber-500',
  },
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    bar: 'bg-blue-500',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  accentColor = 'indigo',
  className,
  animate = true,
}: StatsCardProps) {
  const accent = accentConfig[accentColor];

  const changeIsPositive = change !== undefined && change > 0;
  const changeIsNegative = change !== undefined && change < 0;
  const changeIsNeutral = change !== undefined && change === 0;

  return (
    <div
      className={cn(
        'relative bg-white rounded-3xl border border-slate-200 p-7 xl:p-8 min-h-[165px] flex flex-col justify-between overflow-hidden card-hover shadow-xs',
        animate && 'animate-fade-in',
        className
      )}
    >
      {/* Subtle top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', accent.bar)} />

      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-500 mb-1.5">{title}</p>
            <p className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
              {value}
            </p>
          </div>

          {icon && (
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 shadow-xs', accent.iconBg, accent.iconText)}>
              {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{subtitle}</p>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {changeIsPositive && (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold text-emerald-700">
                +{Math.abs(change).toFixed(1)}%
              </span>
            </>
          )}
          {changeIsNegative && (
            <>
              <TrendingDown className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="text-sm font-bold text-rose-700">
                {change.toFixed(1)}%
              </span>
            </>
          )}
          {changeIsNeutral && (
            <>
              <Minus className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-500">0%</span>
            </>
          )}
          <span className="text-xs text-slate-400 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
}
