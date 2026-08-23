'use client';

import React, { useState } from 'react';
import { Search, Bell, Plus, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSimulator } from '@/context/SimulatorContext';
import { Button } from '@/components/ui/Button';
import { PaymentWizard } from '@/components/payments/PaymentWizard';
import { formatRelativeTime } from '@/utils/date';

export function Topbar() {
  const { user, logout } = useAuth();
  const { activityLogs } = useSimulator();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const recentNotifs = activityLogs.slice(0, 3);
  const unreadCount = recentNotifs.length;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-8 xl:px-12 2xl:px-16 backdrop-blur-md">
        {/* Left: Global Search (48px height) */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers, payments, UPI IDs…"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              aria-label="Global search"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Environment indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
              Razorpay {user?.environment || 'LIVE'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              id="topbar-notifications"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
                </span>
              )}
            </button>

            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-fade-in-scale">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <span className="text-base font-bold text-slate-900">Notifications</span>
                    <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                    {recentNotifs.map((log) => (
                      <div key={log.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-bold text-slate-900 leading-snug">{log.title}</p>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {log.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium font-mono" suppressHydrationWarning>
                          {formatRelativeTime(log.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User logout */}
          <button
            id="topbar-logout"
            onClick={logout}
            title="Log out"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* PRIMARY CTA (48px height) */}
          <Button
            id="topbar-new-payment"
            size="md"
            onClick={() => setIsWizardOpen(true)}
            className="gap-2 font-bold shadow-sm h-12 px-6 text-base rounded-xl"
          >
            <Plus className="h-5 w-5" />
            <span>New Payment</span>
          </Button>
        </div>
      </header>

      {/* Payment Creation Wizard */}
      <PaymentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
}
