'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 border-b border-slate-200/80">
      {/* Glow decorative background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Regulatory Certification Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">NPCI Circular OC-136 & RBI 2026 Compliant</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Zero Bounce Fees
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Autonomous AI Revenue Recovery for{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">
              Razorpay & UPI AutoPay
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Rescue failed subscription renewals and abandoned checkout carts automatically. Revora predicts salary clearing
            windows, respects mandatory 24h cooldowns, and eliminates bank penalties.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto font-bold text-sm shadow-md gap-2 h-11 px-6">
                <span>Launch Merchant Console</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/simulator" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold text-sm bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-11 px-6 shadow-xs"
              >
                <PlayCircle className="h-4 w-4 text-indigo-600" />
                <span>Test Live AI Simulator</span>
              </Button>
            </Link>
          </div>

          {/* Key Value Props Pill Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 68.4% Average Recovery Rate
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 3-Attempt Hard Stop Cap
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-indigo-600" /> 2-Minute Razorpay Webhook Setup
            </span>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-white/95 p-4 sm:p-6 shadow-xl backdrop-blur-md max-w-5xl mx-auto">
          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
              <span className="ml-2 text-xs font-mono font-semibold text-slate-400">
                revora.ai/merchant-telemetry/live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[10px] gap-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Agent Active • Razorpay LIVE
              </Badge>
            </div>
          </div>

          {/* Preview Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Rescued</span>
              <p className="text-lg font-black text-emerald-700 font-mono">₹1,84,200</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recovery Rate</span>
              <p className="text-lg font-black text-slate-900 font-mono">68.4%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Penalties Saved</span>
              <p className="text-lg font-black text-indigo-700 font-mono">₹12,400</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">NPCI Score</span>
              <p className="text-lg font-black text-emerald-700 font-mono">100% Legal</p>
            </div>
          </div>

          {/* Real-time Telemetry Row */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Live Autonomous Action: U30 Insufficient Funds Recovered
                  </span>
                  <Badge variant="info" className="text-[9px]">
                    Groq LLM Verified
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Customer salary cycle matched (1st of month). Scheduled 09:15 AM clearing batch. <strong>₹4,999 rescued.</strong>
                </p>
              </div>
            </div>
            <Link href="/recoveries">
              <Button size="sm" variant="outline" className="text-xs bg-white font-bold shrink-0">
                Inspect Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Banking Ecosystem Trust Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Built for the Indian Banking & Payments Ecosystem
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-indigo-900 font-black tracking-tighter text-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Razorpay Subscriptions
            </span>
            <span className="flex items-center gap-1.5 text-emerald-900 font-black tracking-tighter text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> NPCI UPI AutoPay 2.0
            </span>
            <span className="font-semibold text-slate-800">HDFC Bank</span>
            <span className="font-semibold text-slate-800">ICICI Bank</span>
            <span className="font-semibold text-slate-800">State Bank of India</span>
            <span className="font-semibold text-slate-800">Axis Bank</span>
          </div>
        </div>
      </div>
    </section>
  );
}
