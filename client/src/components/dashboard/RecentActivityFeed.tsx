'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/date';
import { formatINR } from '@/utils/currency';
import { useSimulator } from '@/context/SimulatorContext';
import { ActivityLogItem } from '@/types/ai';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecentActivityFeed() {
  const { activityLogs } = useSimulator();

  const getStatusIcon = (status: ActivityLogItem['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'WARNING':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'DANGER':
        return <XCircle className="h-4 w-4 text-rose-600" />;
      case 'INFO':
      default:
        return <AlertTriangle className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-900">Autonomous AI Activity Stream</CardTitle>
          <CardDescription className="text-slate-500">Live telemetry of payment failures, AI retries, and recoveries</CardDescription>
        </div>
        <Link
          href="/activity"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
        >
          View Full Audit Log <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <div className="p-6 pt-4 space-y-3">
        {activityLogs.slice(0, 5).map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 hover:border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="mt-0.5">{getStatusIcon(log.status)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{log.title}</span>
                <span className="text-[10px] text-slate-400 font-medium" suppressHydrationWarning>{formatRelativeTime(log.timestamp)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">{log.description}</p>
              <div className="flex items-center gap-2 pt-1.5">
                <span className="text-[11px] font-semibold text-slate-800">{log.customerName}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[11px] font-mono font-bold text-slate-700">{formatINR(log.amount)}</span>
                {log.complianceTag && (
                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-mono">
                    {log.complianceTag}
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
