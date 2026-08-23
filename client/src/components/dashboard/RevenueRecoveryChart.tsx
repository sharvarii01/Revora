'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '@/services/analytics.service';
import { formatINR } from '@/utils/currency';
import { Loader2 } from 'lucide-react';

export function RevenueRecoveryChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsService.getTimeseries();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load timeseries from MongoDB backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="flex flex-col bg-white rounded-3xl border-slate-200 shadow-xs overflow-hidden">
      <CardHeader className="p-7 xl:p-8 pb-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Revenue Recovery & Leakage Trends</CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">30-day performance of failed subscriptions vs AI-recovered revenue</CardDescription>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-3 w-3 rounded-full bg-indigo-600" />
              <span className="text-slate-700">Recovered (₹)</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="text-slate-700">Failed at Risk (₹)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="p-7 xl:p-8 h-[380px] xl:h-[420px] w-full flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Loading telemetry from MongoDB...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="recoveredGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={13} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={13}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: any, name: any) => {
                  const label = name === 'recoveredRevenue' ? 'Recovered Revenue' : 'Failed Revenue';
                  return [formatINR(Number(value)), label];
                }}
              />
              <Area
                type="monotone"
                dataKey="recoveredRevenue"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#recoveredGradient)"
              />
              <Area
                type="monotone"
                dataKey="failedRevenue"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#failedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
