'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/utils/cn';
import { ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RevoraLogo } from '@/components/ui/RevoraLogo';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center group">
          <RevoraLogo size="md" showWordmark tagline="Revenue Recovery Platform" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Navigation
        </p>
        <div className="space-y-1.5">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3.5 rounded-2xl px-3.5 py-3 h-12 transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-base leading-tight', isActive ? 'font-bold' : 'font-medium')}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-0.5 font-normal truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Compliance Status Card */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-900">NPCI Compliant</span>
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              100%
            </span>
          </div>
          <p className="text-xs text-emerald-700 leading-snug">
            3-attempt limit & 24h cooldown active
          </p>
        </div>
      </div>

      {/* AI Status Card */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-3.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-indigo-900">AI Agent</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">Live</span>
            </span>
          </div>
          <p className="text-xs text-indigo-700 mt-1 leading-snug font-medium">Gemini 2.5 Flash active</p>
        </div>
      </div>

      {/* User Account Info */}
      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
            {user?.businessName?.charAt(0) || user?.name?.charAt(0) || 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.businessName || 'Merchant'}
            </p>
            <p className="text-xs text-slate-500 truncate font-medium">
              {user?.email || 'merchant@revora.ai'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
