'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/currency';
import { useSimulator } from '@/context/SimulatorContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { RevoraLogo } from '@/components/ui/RevoraLogo';

export default function CustomerPaymentPortalPage() {
  const params = useParams();
  const router = useRouter();
  const recoveryId = (params?.id as string) || 'rec_demo_u30';
  const { recoveries, triggerCustomerPaymentScenario } = useSimulator();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred'>('gpay');

  // Find corresponding recovery or default to sample
  const recovery = recoveries.find((r) => r.id === recoveryId) || recoveries[0] || {
    id: recoveryId,
    customerName: 'Sharvi Dhole',
    customerEmail: 'sharvi@saasplatform.in',
    planOrItemName: 'Pro Annual Cloud Workspace',
    amount: 4999,
    appliedDiscountPct: 5,
    status: 'PAYMENT_LINK_SENT',
  };

  const discountAmount = recovery.appliedDiscountPct > 0 ? (recovery.amount * recovery.appliedDiscountPct) / 100 : 0;
  const finalPayable = Math.max(1, recovery.amount - discountAmount);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      triggerCustomerPaymentScenario(recovery.id);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Container */}
      <div className="w-full max-w-md space-y-4">
        {/* Merchant Trust Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <RevoraLogo size="xs" />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">NovaCloud Technologies</p>
              <p className="text-[10px] text-slate-500 font-medium">Verified Razorpay Merchant</p>
            </div>
          </div>
          <Badge variant="success" className="text-[10px] gap-1 font-mono">
            <ShieldCheck className="h-3 w-3" /> 256-Bit SSL
          </Badge>
        </div>

        {/* Payment Card */}
        <Card className="p-6 bg-white border-slate-200 shadow-md space-y-5">
          {isSuccess ? (
            /* Success Confirmation Screen */
            <div className="text-center py-6 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-100 shadow-sm animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Payment Successful!</h2>
                <p className="text-xs text-slate-600 font-medium">
                  {formatINR(finalPayable)} received and verified by Razorpay.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">pay_rzp_live_{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan / Subscription:</span>
                  <span className="font-semibold text-slate-800">{recovery.planOrItemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">Mandate Reactivated</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link href="/dashboard">
                  <Button className="w-full text-xs font-bold gap-1 shadow-sm">
                    <span>View Merchant Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-medium"
                >
                  Pay another test transaction
                </button>
              </div>
            </div>
          ) : (
            /* Active Checkout Form */
            <>
              {/* Order Breakdown */}
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Summary</span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {recovery.id}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{recovery.planOrItemName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Billed to: {recovery.customerName}</p>
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-900 line-through text-slate-400">
                    {formatINR(recovery.amount)}
                  </span>
                </div>

                {/* Dynamic Incentive Offer Banner */}
                {recovery.appliedDiscountPct > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-emerald-950">
                          {recovery.appliedDiscountPct}% Recovery Incentive Applied
                        </p>
                        <p className="text-[10px] text-emerald-700 font-medium">1-Click settlement courtesy discount</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700">-{formatINR(discountAmount)}</span>
                  </div>
                )}

                {/* Total Payable */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700">Total Payable Amount:</span>
                  <span className="text-2xl font-black text-indigo-700 font-mono">{formatINR(finalPayable)}</span>
                </div>
              </div>

              {/* UPI App Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Select UPI Payment App</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Zero Surcharge</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('gpay')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedUpiApp === 'gpay'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-blue-600">
                      G
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Google Pay</p>
                      <p className="text-[10px] text-slate-500">UPI Intent</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('phonepe')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedUpiApp === 'phonepe'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                      Pe
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">PhonePe</p>
                      <p className="text-[10px] text-slate-500">Direct Debit</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('paytm')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedUpiApp === 'paytm'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-xs">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Paytm UPI</p>
                      <p className="text-[10px] text-slate-500">Instant Link</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('cred')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedUpiApp === 'cred'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      CR
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">CRED UPI</p>
                      <p className="text-[10px] text-slate-500">Rewards Ready</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pay Action Button */}
              <Button
                onClick={handlePay}
                isLoading={isProcessing}
                className="w-full text-xs font-bold h-10 shadow-md gap-2"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                <span>Authorize & Pay {formatINR(finalPayable)}</span>
              </Button>
            </>
          )}

          {/* Security Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
            <Lock className="h-3 w-3" />
            <span>Powered by Razorpay & NPCI AutoPay 2.0 Rails</span>
          </div>
        </Card>

        {/* Back link */}
        <div className="text-center">
          <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            ← Return to Merchant Console
          </Link>
        </div>
      </div>
    </div>
  );
}
