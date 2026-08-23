'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // e.g. +12.5%
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last month',
  icon,
  variant = 'default',
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const borderAccents = {
    default: 'hover:border-slate-300',
    success: 'hover:border-emerald-300',
    warning: 'hover:border-amber-300',
    danger: 'hover:border-rose-300',
  };

  return (
    <Card className={cn('p-5 flex flex-col justify-between transition-all bg-white border-slate-200 shadow-xs hover:shadow-sm', borderAccents[variant], className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="my-2.5">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 text-[11px] pt-2 border-t border-slate-100">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-semibold',
              isPositive && 'text-emerald-600',
              isNegative && 'text-rose-600',
              !isPositive && !isNegative && 'text-slate-500'
            )}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
          <span className="text-slate-400 font-medium">{changeLabel}</span>
        </div>
      )}
    </Card>
  );
}
