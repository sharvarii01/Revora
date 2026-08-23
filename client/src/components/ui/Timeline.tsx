'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface TimelineItem {
  id: string;
  time?: string;
  title: string;
  description?: string;
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  meta?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  compact?: boolean;
}

const statusConfig = {
  success: {
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-100',
    connector: 'border-emerald-100',
  },
  warning: {
    dot: 'bg-amber-500',
    ring: 'ring-amber-100',
    connector: 'border-amber-100',
  },
  danger: {
    dot: 'bg-rose-500',
    ring: 'ring-rose-100',
    connector: 'border-rose-100',
  },
  info: {
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-100',
    connector: 'border-indigo-100',
  },
  neutral: {
    dot: 'bg-slate-400',
    ring: 'ring-slate-100',
    connector: 'border-slate-100',
  },
};

export function Timeline({ items, className, compact = false }: TimelineProps) {
  if (items.length === 0) {
    return (
      <p className="text-base text-slate-400 text-center py-10 font-medium">
        No audit events recorded yet.
      </p>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const cfg = statusConfig[item.status];

        return (
          <div key={item.id} className="flex gap-4">
            {/* Connector column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 shadow-xs',
                  cfg.ring
                )}
              >
                <span className={cn('h-3 w-3 rounded-full', cfg.dot)} />
              </div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 border-l-2 border-dashed my-1.5', cfg.connector)} />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-7', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn('font-bold text-slate-900', compact ? 'text-sm' : 'text-base')}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className={cn('text-slate-600 mt-1 leading-relaxed', compact ? 'text-xs' : 'text-sm')}>
                      {item.description}
                    </p>
                  )}
                  {item.meta && (
                    <div className="mt-2">{item.meta}</div>
                  )}
                </div>
                {item.time && (
                  <span
                    className="shrink-0 text-xs text-slate-400 font-medium font-mono mt-0.5"
                    suppressHydrationWarning
                  >
                    {item.time}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
