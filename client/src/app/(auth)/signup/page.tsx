'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Building } from 'lucide-react';
import { RevoraLogo } from '@/components/ui/RevoraLogo';

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await signup({ businessName, merchantName, email, password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <RevoraLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Merchant Account</h1>
          <p className="text-xs text-slate-500 font-medium">Start recovering lost revenue with Revora AI</p>
        </div>

        {/* Signup Card */}
        <Card className="p-6 space-y-4 bg-white border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Legal Business Name</label>
              <Input
                icon={<Building className="h-3.5 w-3.5" />}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme SaaS Pvt Ltd"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Merchant Legal Name</label>
              <Input
                icon={<User className="h-3.5 w-3.5" />}
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Rohan Mehra"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Work Email</label>
              <Input
                type="email"
                icon={<Mail className="h-3.5 w-3.5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@acme.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Input
                type="password"
                icon={<Lock className="h-3.5 w-3.5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full text-xs font-bold h-9 mt-2 shadow-sm">
              Create Account & Launch Agent
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-slate-500 border-t border-slate-100 font-medium">
            Already registered?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Sign In
            </Link>
          </div>
        </Card>

        {/* Regulatory Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>NPCI UPI AutoPay & RBI Recurring Mandate Compliant</span>
        </div>
      </div>
    </div>
  );
}
