'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/currency';
import { TrendingUp, ShieldCheck, Sparkles, ArrowRight, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function RoiCalculator() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [monthlyGmv, setMonthlyGmv] = useState(5000000); // 50 Lakhs default
  const [failureRate, setFailureRate] = useState(12); // 12% default
  const [ticketSize, setTicketSize] = useState(2500); // Avg transaction size

  // Computations
  const failedVolume = (monthlyGmv * failureRate) / 100;
  const estimatedRecovered = failedVolume * 0.684; // 68.4% average recovery rate
  const bouncePenaltiesPrevented = (failedVolume / ticketSize) * 250 * 0.7; // ~₹250 penalty per failed auto debit
  const totalAnnualSavings = (estimatedRecovered + bouncePenaltiesPrevented) * 12;
  const estimatedRevoraFee = estimatedRecovered * 0.008; // 0.8% performance fee
  const roiMultiple = Math.round(estimatedRecovered / (estimatedRevoraFee || 1));

  return (
    <section id="calculator" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <Badge variant="default" className="text-xs font-mono uppercase font-bold">
            Interactive Calculator
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            How Much Revenue Is Leaking From Your Business?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Input your monthly recurring subscription GMV to see how much revenue Revora AI will rescue for you every month.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto">
          {/* Left Column: Sliders Input Card */}
          <Card className="lg:col-span-6 p-6 sm:p-8 bg-white border-slate-200 shadow-md rounded-3xl space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Your Payment Metrics</span>
              <span className="text-xs font-mono font-medium text-slate-400">Real-Time Simulation</span>
            </h3>

            {/* Slider 1: Monthly GMV */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Monthly Subscription GMV</span>
                <span className="font-mono font-black text-indigo-700 text-sm">{formatINR(monthlyGmv)}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="50000000"
                step="500000"
                value={monthlyGmv}
                onChange={(e) => setMonthlyGmv(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹5 Lakhs</span>
                <span>₹2.5 Cr</span>
                <span>₹5 Crores</span>
              </div>
            </div>

            {/* Slider 2: Failed Payment Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Recurring Payment Failure Rate</span>
                <span className="font-mono font-black text-rose-600 text-sm">{failureRate}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={failureRate}
                onChange={(e) => setFailureRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>3% (Low)</span>
                <span>12% (Average Indian SaaS)</span>
                <span>30% (High Churn)</span>
              </div>
            </div>

            {/* Slider 3: Average Ticket Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Average Plan / Ticket Value</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatINR(ticketSize)}</span>
              </div>
              <input
                type="range"
                min="499"
                max="25000"
                step="500"
                value={ticketSize}
                onChange={(e) => setTicketSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹499 (D2C / Micro)</span>
                <span>₹2,500 (Pro Plan)</span>
                <span>₹25,000 (Enterprise)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-medium">
              💡 <strong>Did you know?</strong> In India, over 14% of recurring UPI AutoPay mandates fail transiently due to
              salary day mismatches (error code <code>U30</code>) and banking clearing batch congestion.
            </div>
          </Card>

          {/* Right Column: Dynamic Projected Results Card */}
          <Card className="lg:col-span-6 p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border-0 shadow-xl rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Projected AI Recovery Output
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  68.4% Recovery Rate
                </span>
              </div>

              <div>
                <span className="text-xs text-indigo-200 font-medium">Monthly Rescued Revenue</span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                  {formatINR(estimatedRecovered)}
                </p>
                <p className="text-xs text-indigo-300 mt-1">Directly deposited to your Razorpay settlement account</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-indigo-900/60 border border-indigo-800/60">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold">Bank Penalties Saved</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{formatINR(bouncePenaltiesPrevented)}/mo</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-900/60 border border-indigo-800/60">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold">Annual Total Impact</span>
                  <p className="text-base font-bold text-emerald-300 font-mono mt-0.5">
                    {formatINR(totalAnnualSavings, { compact: true })}/yr
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Estimated ROI Multiple:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{roiMultiple}x Return on Spend</span>
              </div>

              <Button
                size="lg"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/dashboard');
                  } else {
                    openLoginModal();
                  }
                }}
                className="w-full font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-md gap-2 text-xs"
              >
                <span>Claim Your Recovered Revenue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
