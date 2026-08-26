'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function PricingSection() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();
  const tiers = [
    {
      name: 'Starter Sandbox',
      price: '₹0',
      period: 'Forever free',
      description: 'Ideal for early-stage SaaS exploring AutoPay recovery and compliance.',
      features: [
        'Up to ₹2,00,000 recovered GMV/mo',
        'NPCI 3-Attempt Hard Stop Guardian',
        'Mandatory 24h Cooldown Engine',
        'Standard Email & SMS Link Nudges',
        'Interactive AI Scenario Simulator',
      ],
      cta: 'Start Free Sandbox',
      highlighted: false,
    },
    {
      name: 'Growth AI Agent',
      price: '₹4,999',
      period: '/mo + 0.8% of recovered',
      description: 'For scaling subscription businesses and D2C brands wanting maximum recovery.',
      features: [
        'Unlimited Recovered Revenue volume',
        'Groq + Gemini AI Explainable Engine',
        'WhatsApp UPI Intent Direct Links',
        'Payday Clearing Window Optimizer',
        'Dynamic Abandoned Cart Discount Nudges',
        'Real-Time Webhook Telemetry & Logs',
      ],
      cta: 'Launch Growth Agent',
      highlighted: true,
    },
    {
      name: 'Enterprise Scale',
      price: 'Custom',
      period: 'Volume-based pricing',
      description: 'For high-volume merchants needing dedicated PSP routing & SLA guarantees.',
      features: [
        'Multi-PSP Routing (Razorpay + Cashfree)',
        'Custom Clearing Windows per Issuer Bank',
        'Dedicated Slack & Engineering Support',
        'Custom Webhook Integration & Onboarding',
        '99.99% Uptime SLA',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white border-b border-slate-200/80">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <Badge variant="default" className="text-xs font-mono uppercase font-bold">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Performance-Based. We Only Win When You Recover.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Zero upfront risk. Revora pays for itself within the first 48 hours of recovery presentations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          {tiers.map((tier, idx) => (
            <Card
              key={idx}
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                tier.highlighted
                  ? 'border-2 border-indigo-600 bg-white shadow-2xl scale-105 relative z-10'
                  : 'border border-slate-200 bg-slate-50/70 shadow-xs hover:shadow-md hover:bg-white'
              }`}
            >
              <div className="space-y-5">
                {tier.highlighted && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-1">
                    <Sparkles className="h-3.5 w-3.5" /> Most Popular for SaaS
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-2.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">{tier.price}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500">{tier.period}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-medium leading-relaxed">{tier.description}</p>
                </div>

                <div className="pt-5 border-t border-slate-200 space-y-3 text-xs sm:text-sm">
                  <span className="font-bold text-slate-900 text-[11px] sm:text-xs uppercase tracking-wider">What’s included:</span>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-slate-700 font-medium">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-200/80">
                <Button
                  variant={tier.highlighted ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push('/dashboard');
                    } else {
                      openLoginModal();
                    }
                  }}
                  className="w-full text-xs sm:text-sm font-bold gap-2 shadow-sm h-11 rounded-xl"
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
