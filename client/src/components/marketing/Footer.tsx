'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { RevoraLogo } from '@/components/ui/RevoraLogo';

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <RevoraLogo variant="glow" size="sm" />
              <span className="text-base font-bold text-white tracking-tight">Revora</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                AI Revenue Recovery Platform
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              The autonomous AI revenue recovery platform purpose-built for the Indian SaaS & subscription ecosystem. Rescuing
              Razorpay subscriptions with zero bank bounce penalties under NPCI Circular OC-136.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>NPCI AutoPay 2.0 & RBI Recurring Mandate Compliant</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Merchant Console
                </Link>
              </li>
              <li>
                <Link href="/simulator" className="hover:text-white transition-colors">
                  AI Scenario Simulator
                </Link>
              </li>
              <li>
                <Link href="/recoveries" className="hover:text-white transition-colors">
                  Recovery Command Center
                </Link>
              </li>
              <li>
                <Link href="/insights" className="hover:text-white transition-colors">
                  Money Leakage Audits
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory & Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compliance & API</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="http://localhost:5000/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Swagger API Specs
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:text-white transition-colors">
                  NPCI OC-136 Guidelines
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:text-white transition-colors">
                  RBI Recurring Mandates
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:5000/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  System Health & Uptime
                </a>
              </li>
            </ul>
          </div>

          {/* Ready to Launch */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get Started</h4>
            <p className="text-slate-400">Launch the interactive console in sandbox mode with pre-seeded NPCI failure sessions.</p>
            <Link href="/dashboard" className="inline-block pt-1">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-sm">
                <span>Open Console</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Revora Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Security & Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
