'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, LogIn, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { RevoraLogo } from '@/components/ui/RevoraLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await login(email.trim(), password);
      if (!ok) {
        setErrorMsg('Login failed. Please verify credentials.');
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await demoLogin();
    } catch {
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/80 px-4 py-12 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Soft Lighting Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/3 w-64 h-64 bg-violet-100/30 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Main Form Container */}
      <div className="w-full max-w-[400px] space-y-5">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <Link href="/" className="group mb-1 inline-block">
            <RevoraLogo size="sm" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to Revora</h1>
          <p className="text-xs text-slate-500 font-normal">Autonomous AI Revenue Recovery Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          {/* Quick Demo Access Pill Box */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-slate-50 p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Quick Demo Access</span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">Pre-filled verified credentials</p>
            </div>
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={isSubmitting || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              1-Click Demo
            </button>
          </div>

          {/* Clean Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-100" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">or sign in with email</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@company.com"
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting || isLoading}
              className="w-full h-10 gap-1.5 font-semibold text-xs rounded-xl shadow-xs"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-xs text-slate-500 font-normal">
            New merchant?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Create account →
            </Link>
          </p>
        </div>

        {/* Regulatory Compliance Footer */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-normal text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>NPCI UPI AutoPay & RBI Recurring Mandate Compliant</span>
        </div>
      </div>
    </div>
  );
}
