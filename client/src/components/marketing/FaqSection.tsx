'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Revora prevent bank bounce fees and issuer penalties?',
      a: 'Under NPCI Circular OC-136, banks charge hefty bounce penalties (~₹250 per failed presentation) when automated recurring debits exceed 3 attempts or ignore cooldowns. Revora strictly enforces a 3-attempt lifetime cap per billing cycle, applies a mandatory 24-hour cooldown, and halts immediately on terminal revocation codes (like ZG), ensuring zero penalty liability.',
    },
    {
      q: 'How does the 2-minute Razorpay integration work?',
      a: 'You simply add your Revora Webhook URL to your Razorpay Dashboard under Settings → Webhooks, and subscribe to subscription.charged.failed, payment.failed, and payment.captured. Revora immediately ingests real-time events, runs AI decision models, and begins automated recovery without modifying your core checkout code.',
    },
    {
      q: 'What is code U30 and how does Revora resolve it?',
      a: 'U30 is the official NPCI error code for "Insufficient Funds / Liquidity Shortage". Revora recognizes that U30 is transient and correlates with monthly salary paydays (1st–5th of the month). It schedules presentation retries during the 09:15 AM interbank clearing window when customer bank balances are highest.',
    },
    {
      q: 'How do customers pay if AutoPay presentations are halted?',
      a: 'When an AutoPay mandate reaches its compliant stop state (3 attempts consumed), Revora automatically generates a personalized, authenticated WhatsApp / SMS payment link with UPI Intent (GPay, PhonePe, Paytm, CRED) allowing the customer to clear the invoice in 1 click.',
    },
    {
      q: 'Can I set custom discount limits for abandoned checkout carts?',
      a: 'Yes! Inside your Merchant Policy Settings, you can configure your exact dynamic discount ceiling (e.g. 5% or 10% maximum). Revora will never generate promotional recovery incentives that violate your gross margin floor.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-3">
          <Badge variant="default" className="text-xs font-mono uppercase font-bold">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Everything You Need to Know About NPCI AutoPay Recovery
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Clear answers on compliance, automated AI retry mechanisms, and Razorpay integration.
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Card
                key={idx}
                className="bg-white border-slate-200 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/60">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
