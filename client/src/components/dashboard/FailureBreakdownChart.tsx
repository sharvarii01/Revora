'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyticsService } from '@/services/analytics.service';
import { formatINR } from '@/utils/currency';
import { Loader2 } from 'lucide-react';

export function FailureBreakdownChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsService.getFailureReasons();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching failure reasons from MongoDB backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="flex flex-col bg-white rounded-3xl border-slate-200 shadow-xs overflow-hidden">
      <CardHeader className="p-7 xl:p-8 pb-4 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Bank Failure Reason Distribution</CardTitle>
        <CardDescription className="text-sm text-slate-500 mt-1">Breakdown by NPCI UPI AutoPay error codes</CardDescription>
      </CardHeader>
      <div className="p-7 xl:p-8 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[380px] xl:min-h-[420px]">
        {isLoading ? (
          <div className="h-64 w-full flex items-center justify-center gap-3 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Loading failure telemetry...</span>
          </div>
        ) : (
          <>
            <div className="h-64 w-64 xl:h-72 xl:w-72 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontSize: '14px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value} failed debits (${formatINR(item.payload.amount)})`,
                      item.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 w-full space-y-3">
              {data.map((item) => (
                <div key={item.code} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="font-mono text-slate-900 font-bold">{item.code}</span>
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 font-mono">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
