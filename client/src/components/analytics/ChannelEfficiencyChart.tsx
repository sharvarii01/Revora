'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/services/analytics.service';
import { formatINR } from '@/utils/currency';
import { Loader2 } from 'lucide-react';

export function ChannelEfficiencyChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsService.getChannelEfficiency();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching channel efficiency from MongoDB backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-slate-900">Recovery Channel Conversion Efficiency</CardTitle>
        <CardDescription className="text-slate-500">Throughput across AutoPay retries, WhatsApp payment links, and checkout nudges</CardDescription>
      </CardHeader>
      <div className="p-6 pt-4 h-64 w-full flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Loading channels...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="channel" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: any) => [formatINR(Number(value)), 'Recovered Amount']}
              />
              <Bar dataKey="recoveredAmount" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function FailureHeatmap() {
  const hours = ['00:00', '03:00', '06:00', '09:15 (Batch)', '12:00', '15:00', '18:00', '21:00'];
  const codes = ['U30 Insufficient', 'UT Timeout', 'ZM Invalid MPIN', 'U54 Daily Limit'];

  const heatmapData = [
    [10, 15, 20, 92, 45, 30, 25, 18],
    [65, 55, 35, 12, 18, 40, 60, 48],
    [5, 5, 10, 25, 50, 45, 65, 80],
    [8, 5, 5, 15, 30, 45, 75, 90],
  ];

  return (
    <Card className="flex flex-col bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-slate-900">Bank Failure Heatmap (Hour of Day vs Failure Code)</CardTitle>
        <CardDescription className="text-slate-500">Identifies optimal low-congestion bank presentation windows</CardDescription>
      </CardHeader>
      <div className="p-6 pt-4 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left font-semibold text-slate-500 pb-2 w-36">Failure Reason</th>
                {hours.map((h) => (
                  <th key={h} className="text-center font-mono font-semibold text-slate-500 pb-2 px-1">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-1.5">
              {codes.map((code, rIdx) => (
                <tr key={code}>
                  <td className="font-semibold text-slate-900 py-1.5 pr-2 truncate text-xs">{code}</td>
                  {heatmapData[rIdx].map((val, cIdx) => {
                    const isSuccessPeak = rIdx === 0 && cIdx === 3;
                    return (
                      <td key={cIdx} className="p-1 text-center">
                        <div
                          className={`h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                            isSuccessPeak
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                              : val > 60
                              ? 'bg-rose-100 text-rose-800'
                              : val > 30
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {val}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <strong className="text-emerald-700 font-bold">09:15 AM Batch:</strong> Statistically yields the highest recovery success
          rate (+34%) post-NEFT/RTGS salary clearance cycles across HDFC, ICICI, and SBI.
        </p>
      </div>
    </Card>
  );
}
