'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, LogIn, Sparkles, Mail, Lock, X } from 'lucide-react';
import { RevoraLogo } from '@/components/ui/RevoraLogo';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal();
    };
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

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
      if (ok) {
        closeLoginModal();
      } else {
        setErrorMsg('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await demoLogin();
      closeLoginModal();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demo login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeLoginModal}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-[420px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 space-y-5 my-auto transform transition-all animate-scale-up">
          {/* Close Button */}
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-1.5 pt-1">
            <Link href="/" onClick={closeLoginModal} className="group mb-1 inline-block">
              <RevoraLogo size="sm" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to Revora</h2>
            <p className="text-xs text-slate-500 font-normal">Autonomous AI Revenue Recovery Platform</p>
          </div>

          {/* Quick Demo Access Pill Box */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-slate-50 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
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
                  id="modal-login-email"
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
                <Link
                  href="/forgot-password"
                  onClick={closeLoginModal}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="modal-login-password"
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
              Sign In to Console
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-xs text-slate-500 font-normal">
            New merchant?{' '}
            <Link
              href="/signup"
              onClick={closeLoginModal}
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Create account →
            </Link>
          </p>

          {/* Regulatory Compliance Footer */}
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-normal text-center pt-1 border-t border-slate-100">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>NPCI UPI AutoPay & RBI 2026 Compliant</span>
          </div>
        </div>
      </div>
  );
}
