'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-md mb-2">
            V
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 font-medium">Enter your merchant email to receive a password reset link</p>
        </div>

        <Card className="p-6 space-y-4 bg-white border-slate-200 shadow-sm">
          {isSubmitted ? (
            <div className="space-y-4 text-center py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Password Reset Link Sent</h3>
                <p className="text-xs text-slate-500 font-medium">
                  We have sent instructions to <strong className="text-slate-900">{email}</strong>.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full text-xs mt-2 bg-white border-slate-200 text-slate-700">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Work Email</label>
                <Input
                  type="email"
                  icon={<Mail className="h-3.5 w-3.5" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@company.com"
                  required
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full text-xs font-bold h-9 shadow-sm">
                Send Reset Link
              </Button>

              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
