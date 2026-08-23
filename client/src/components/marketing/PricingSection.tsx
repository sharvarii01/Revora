'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
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
    <section id="pricing" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="default" className="text-xs font-mono uppercase font-bold">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Performance-Based. We Only Win When You Recover.
          </h2>
          <p className="text-sm text-slate-600 font-medium max-w-xl mx-auto">
            Zero upfront risk. Revora pays for itself within the first 48 hours of recovery presentations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => (
            <Card
              key={idx}
              className={`p-7 flex flex-col justify-between transition-all ${
                tier.highlighted
                  ? 'border-2 border-indigo-600 bg-white shadow-xl scale-105 relative z-10'
                  : 'border border-slate-200 bg-slate-50/70 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {tier.highlighted && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 mb-1">
                    <Sparkles className="h-3 w-3" /> Most Popular for SaaS
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">{tier.price}</span>
                    <span className="text-xs font-semibold text-slate-500">{tier.period}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium">{tier.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs">
                  <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">What’s included:</span>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-slate-700 font-medium">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200/80">
                <Link href="/dashboard">
                  <Button
                    variant={tier.highlighted ? 'default' : 'outline'}
                    size="lg"
                    className="w-full text-xs font-bold gap-1.5 shadow-sm"
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
