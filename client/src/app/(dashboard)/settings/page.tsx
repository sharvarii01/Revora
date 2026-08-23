'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { Check, Save, Loader2, User, Link2, ShieldCheck, Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

type Tab = 'profile' | 'connections' | 'rules' | 'notifications';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'profile', label: 'Merchant Profile', icon: <User className="h-4 w-4" /> },
  { id: 'connections', label: 'API & Gateway Connections', icon: <Link2 className="h-4 w-4" /> },
  { id: 'rules', label: 'Recovery Rules & Policy', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notification Channels', icon: <Bell className="h-4 w-4" /> },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-8 py-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-base font-semibold text-slate-700 block mb-2">{children}</label>;
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [maxDiscount, setMaxDiscount] = useState(String(user?.maxDiscountPct || 10));
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || '');
      setMaxDiscount(String(user.maxDiscountPct || 10));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authService.updateSettings({
        businessName,
        maxDiscountPct: parseFloat(maxDiscount) || 10,
        autoRecoveryEnabled: true,
      });
      await refreshUser();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 xl:space-y-10 animate-fade-in w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
          Settings & Policies
        </h1>
        <p className="text-base xl:text-lg text-slate-500 mt-1 font-medium">
          Manage your merchant credentials, Razorpay API integrations, and NPCI regulatory policies.
        </p>
      </div>

      {/* Tabs (48px height) */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-6 py-3.5 text-base font-bold transition-all border-b-2 -mb-px whitespace-nowrap rounded-t-xl',
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {activeTab === 'profile' && (
          <SectionCard
            title="Merchant Account Details"
            description="Your organization details visible on invoices and customer recovery notifications."
          >
            <div className="space-y-6">
              <div>
                <Label>Business Name</Label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <Label>Work Email (Read-Only)</Label>
                <input
                  type="email"
                  value={user?.email || 'sharvi@saasplatform.in'}
                  disabled
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-base text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <Label>Merchant ID</Label>
                <input
                  type="text"
                  value={user?.id || 'mer_demo_1'}
                  disabled
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-base font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'connections' && (
          <SectionCard
            title="Payment Gateway Integration"
            description="Active webhooks and credentials for Razorpay UPI AutoPay."
          >
            <div className="space-y-6">
              <div>
                <Label>Razorpay Key ID</Label>
                <input
                  type="text"
                  value={(user as any)?.razorpayKeyId || 'rzp_live_k8a92m8190'}
                  readOnly
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-base font-mono text-slate-700"
                />
              </div>

              <div>
                <Label>Webhook Secret</Label>
                <input
                  type="password"
                  value="whsec_revora_razorpay_hmac_2026"
                  readOnly
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-base font-mono text-slate-700"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Webhook Active on Razorpay Live Sandbox
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  https://api.revora.ai/api/webhooks/razorpay
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'rules' && (
          <SectionCard
            title="Recovery Guardrails & NPCI Caps"
            description="Configure automated discount ceilings and presentation limits."
          >
            <div className="space-y-6">
              <div>
                <Label>Max Dynamic Discount Ceiling (%)</Label>
                <div className="max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono font-bold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  AI will never offer discounts above this ceiling during cart or subscription rescue.
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-5">
                <p className="text-sm font-bold text-indigo-900 mb-1">NPCI AutoPay Circular OC-136 Cap Locked</p>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Revora strictly limits auto-debit retries to 3 attempts with a mandatory 24-hour cooldown period.
                  This setting cannot be altered to guarantee zero bank penalties.
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'notifications' && (
          <SectionCard
            title="Customer Communication Channels"
            description="Enable or configure out-of-band payment link dispatch rails."
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div>
                  <p className="text-base font-bold text-slate-900">WhatsApp Business API</p>
                  <p className="text-xs text-slate-500">Dispatch one-click UPI intent recovery links on WhatsApp</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Enabled
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div>
                  <p className="text-base font-bold text-slate-900">Email Pre-Debit Advisory</p>
                  <p className="text-xs text-slate-500">RBI-mandated 24h courtesy notification before AutoPay debit</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Enabled
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div>
                  <p className="text-base font-bold text-slate-900">SMS Fallback Rail</p>
                  <p className="text-xs text-slate-500">Dispatch SMS link if WhatsApp message cannot be delivered</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                  Standby
                </span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" size="md" disabled={isSaving} className="gap-2 shadow-sm font-bold">
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving to MongoDB…
              </>
            ) : isSaved ? (
              <>
                <Check className="h-5 w-5 text-emerald-400" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
