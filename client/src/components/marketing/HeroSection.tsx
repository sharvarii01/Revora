'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
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
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleLaunchConsole = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      openLoginModal();
    }
  };

  const handleInspectSession = () => {
    if (isAuthenticated) {
      router.push('/recoveries');
    } else {
      openLoginModal();
    }
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 border-b border-slate-200/80">
      {/* Glow decorative background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[450px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12 relative">
        <div className="text-center space-y-6 max-w-4xl lg:max-w-5xl mx-auto">
          {/* Regulatory Certification Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 backdrop-blur-sm px-4 py-1.5 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">NPCI Circular OC-136 & RBI 2026 Compliant</span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Zero Bounce Fees
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Autonomous AI Revenue Recovery for{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">
              Razorpay & UPI AutoPay
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Rescue failed subscription renewals and abandoned checkout carts automatically. Revora predicts salary clearing
            windows, respects mandatory 24h cooldowns, and eliminates bank penalties.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              id="hero-launch-merchant-btn"
              size="lg"
              onClick={handleLaunchConsole}
              className="w-full sm:w-auto font-bold text-base shadow-md gap-2 h-12 px-8 rounded-xl"
            >
              <span>Launch Merchant Console</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/simulator" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-12 px-8 rounded-xl shadow-xs"
              >
                <PlayCircle className="h-4 w-4 text-indigo-600" />
                <span>Test Live AI Simulator</span>
              </Button>
            </Link>
          </div>

          {/* Key Value Props Pill Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-xs sm:text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 68.4% Average Recovery Rate
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 3-Attempt Hard Stop Cap
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" /> 2-Minute Razorpay Webhook Setup
            </span>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-14 rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-8 shadow-2xl backdrop-blur-md w-full max-w-[1400px] mx-auto">
          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
              <span className="ml-2 text-xs sm:text-sm font-mono font-semibold text-slate-400">
                revora.ai/merchant-telemetry/live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[11px] gap-1.5 font-bold py-1 px-3">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Agent Active • Razorpay LIVE
              </Badge>
            </div>
          </div>

          {/* Preview Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 text-left">
            <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-100">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Rescued</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-1">₹1,84,200</p>
            </div>
            <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-100">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Recovery Rate</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">68.4%</p>
            </div>
            <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-100">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Penalties Saved</span>
              <p className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono mt-1">₹12,400</p>
            </div>
            <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-100">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">NPCI Compliance</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-1">100% Legal</p>
            </div>
          </div>

          {/* Real-time Telemetry Multi-Panel Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
            <div className="lg:col-span-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Live Autonomous Action: U30 Insufficient Funds Recovered
                    </span>
                    <Badge variant="info" className="text-[10px]">
                      Groq LLM Verified
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Customer salary cycle matched (1st of month). Scheduled 09:15 AM clearing batch. <strong className="text-slate-900">₹4,999 rescued.</strong>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleInspectSession}
                className="text-xs sm:text-sm bg-white font-bold shrink-0 shadow-2xs h-9 px-4 rounded-xl self-start sm:self-auto"
              >
                Inspect Session
              </Button>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-emerald-950">NPCI 24h Cooldown Active</p>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">Attempt 2/3 • Zero bounce penalty</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                Safe
              </span>
            </div>
          </div>
        </div>

        {/* Banking Ecosystem Trust Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200/80">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
            Built for the Indian Banking & Payments Ecosystem
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-85 grayscale hover:grayscale-0 transition-all text-xs sm:text-sm font-bold text-slate-700">
            <span className="flex items-center gap-2 text-indigo-900 font-black tracking-tighter text-base">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Razorpay Subscriptions
            </span>
            <span className="flex items-center gap-2 text-emerald-900 font-black tracking-tighter text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> NPCI UPI AutoPay 2.0
            </span>
            <span className="font-semibold text-slate-800">HDFC Bank</span>
            <span className="font-semibold text-slate-800">ICICI Bank</span>
            <span className="font-semibold text-slate-800">State Bank of India</span>
            <span className="font-semibold text-slate-800">Axis Bank</span>
            <span className="font-semibold text-slate-800">Kotak Mahindra</span>
          </div>
        </div>
      </div>
    </section>
  );
}
