'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, ShieldCheck, Brain, ShoppingCart, CheckCircle2, Zap, Lock, Sparkles } from 'lucide-react';

export function FeatureShowcase() {
  const features = [
    {
      icon: <Clock className="h-5 w-5 text-indigo-600" />,
      title: 'Smart Clearing Window Retries',
      subtitle: 'Payday & Interbank Liquidity Sync',
      description:
        'Analyzes Indian salary credit cycles (1st–5th and 28th–31st) and schedules retries during optimal 09:15 AM interbank clearing batches.',
      pill: 'Code U30 Intelligence',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      title: 'NPCI 3-Attempt Hard Stop Guardian',
      subtitle: 'Zero Bounce Fee Guarantee',
      description:
        'Enforces mandatory 24h cooldowns and halts recurring debits strictly at 3 attempts per NPCI OC-136, eliminating costly ~₹250 bank bounce penalties.',
      pill: '100% RBI Compliant',
    },
    {
      icon: <ShoppingCart className="h-5 w-5 text-amber-600" />,
      title: 'Abandoned Checkout Recovery Nudges',
      subtitle: 'Margin-Floor Protected Discounts',
      description:
        'Dispatches 3-stage progressive nudges with personalized dynamic discounts (e.g. 5% offer) strictly respecting your gross margin ceiling.',
      pill: 'Up to 61% Conversion',
    },
    {
      icon: <Brain className="h-5 w-5 text-indigo-600" />,
      title: 'Explainable AI Decision Audit',
      subtitle: 'Groq LLM + Gemini Inference',
      description:
        'Every presentation schedule, customer message, and stop state contains full natural-language explainability and confidence scoring in your audit ledger.',
      pill: 'Full Audit Trail',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <Badge variant="default" className="text-xs font-mono uppercase font-bold">
            Autonomous Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Engineered Specifically for the Indian Payments Stack
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Traditional US/EU dunning tools blindly retry cards and trigger bank penalties. Revora is natively designed for
            NPCI UPI AutoPay, e-Mandates, and Razorpay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
          {features.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 sm:p-7 bg-slate-50/70 border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 hover:bg-white transition-all flex flex-col justify-between rounded-3xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                    {item.pill}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-1">{item.subtitle}</p>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium">{item.description}</p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Active across recurring cycles</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
