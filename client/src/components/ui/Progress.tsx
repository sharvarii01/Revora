'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60', className)} {...props}>
      <div
        className={cn('h-full bg-indigo-600 transition-all duration-300 ease-in-out', indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
