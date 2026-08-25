'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  CreditCard,
  Zap,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  ShieldX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useSimulator } from '@/context/SimulatorContext';
import { paymentsService } from '@/services/payments.service';

interface PaymentWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type FailureScenario =
  | 'SUCCESS'
  | 'U30'
  | 'TIMEOUT'
  | 'DAILY_LIMIT'
  | 'INVALID_MPIN'
  | 'CHECKOUT_ABANDONED'
  | 'NETWORK_ERROR';

type PaymentType = 'ONE_TIME' | 'SUBSCRIPTION' | 'CHECKOUT';

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface PaymentDetails {
  amount: string;
  orderId: string;
  paymentType: PaymentType;
  upiId: string;
}

const STEPS = [
  { id: 1, label: 'Customer', icon: User },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Scenario', icon: Zap },
  { id: 4, label: 'AI Strategy', icon: Brain },
];

const FAILURE_SCENARIOS: Array<{
  id: FailureScenario;
  label: string;
  code?: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  aiAction: string;
}> = [
  {
    id: 'SUCCESS',
    label: 'Payment Success',
    description: 'Payment processes immediately. Captured and settled in MongoDB.',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    aiAction: 'Payment captured. Live dashboard revenue and telemetry updated.',
  },
  {
    id: 'U30',
    label: 'Insufficient Funds (U30)',
    code: 'U30',
    description: "Low bank balance. AI detects salary cycle and schedules retry in 24h.",
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    aiAction: 'AI schedules retry for 09:15 AM tomorrow (NPCI batch window). WhatsApp advisory sent.',
  },
  {
    id: 'INVALID_MPIN',
    label: 'Invalid MPIN / Auth (ZM)',
    code: 'ZM',
    description: "UPI PIN failed. AI sends an instant smart payment link instead.",
    icon: <ShieldX className="h-4 w-4" />,
    color: 'border-rose-200 bg-rose-50 text-rose-700',
    aiAction: 'AI dispatches UPI intent payment link via WhatsApp without burning auto-debit retries.',
  },
  {
    id: 'CHECKOUT_ABANDONED',
    label: 'Cart Abandoned',
    description: 'Customer dropped off at checkout. AI sends timed discount nudge.',
    icon: <Clock className="h-4 w-4" />,
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    aiAction: 'AI applies margin-aware 5% discount link and dispatches WhatsApp nudge.',
  },
  {
    id: 'TIMEOUT',
    label: 'Gateway Timeout (U69)',
    code: 'U69',
    description: 'Bank payment switch timed out. Transient issue with high recovery rate.',
    icon: <Clock className="h-4 w-4" />,
    color: 'border-slate-200 bg-slate-50 text-slate-700',
    aiAction: 'AI classifies as transient gateway timeout and schedules retry after 6h cooldown.',
  },
  {
    id: 'NETWORK_ERROR',
    label: 'Bank Downtime',
    description: 'Intermittent connectivity failure. Issuing bank unreachable momentarily.',
    icon: <Wifi className="h-4 w-4" />,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    aiAction: 'AI retries in 2h after switch recovery and sends courtesy WhatsApp pre-debit notice.',
  },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-6 px-1">
      {STEPS.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all duration-200 shrink-0 font-bold',
                  isActive && 'border-indigo-600 bg-indigo-600 text-white shadow-xs',
                  isDone && 'border-emerald-500 bg-emerald-500 text-white',
                  !isActive && !isDone && 'border-slate-200 bg-white text-slate-400'
                )}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step {step.id}</p>
                <p
                  className={cn(
                    'text-xs font-bold',
                    isActive ? 'text-indigo-700' : isDone ? 'text-emerald-700' : 'text-slate-600'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2.5 transition-colors duration-300',
                  step.id < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function PaymentWizard({ isOpen, onClose }: PaymentWizardProps) {
  const { refreshData, setSelectedRecovery, setIsDrawerOpen } = useSimulator();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [payment, setPayment] = useState<PaymentDetails>({
    amount: '',
    orderId: `ORD-${Date.now().toString().slice(-6)}`,
    paymentType: 'SUBSCRIPTION',
    upiId: '',
  });
  const [scenario, setScenario] = useState<FailureScenario>('U30');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setCustomer({ name: '', email: '', phone: '', company: '' });
      setPayment({ amount: '', orderId: `ORD-${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 900 + 100)}`, paymentType: 'SUBSCRIPTION', upiId: '' });
      setScenario('U30');
    }, 300);
  };

  const handleStartRecovery = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const created = await paymentsService.createPayment({
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim() || '+91 98765 43210',
          company: customer.company.trim() || undefined,
        },
        amount: parseFloat(payment.amount) || 4999,
        orderId: payment.orderId,
        paymentType: payment.paymentType,
        upiId: payment.upiId || `${customer.name.toLowerCase().replace(/\s+/g, '')}@okhdfcbank`,
        scenario: scenario,
        failureCode: scenario === 'INVALID_MPIN' ? 'ZM' : scenario === 'TIMEOUT' ? 'UT' : 'U30',
        bank: 'HDFC Bank',
      });

      await refreshData();

      if (created?.recovery) {
        setSelectedRecovery({
          id: created.recovery.id || created.recovery._id,
          customerId: created.customer?.id || created.customerId,
          customerName: created.customer?.name || created.customerName || customer.name,
          customerEmail: created.customer?.email || created.customerEmail || customer.email,
          customerPhone: created.customer?.phone || created.customerPhone || customer.phone,
          type: created.recovery.type || 'SUBSCRIPTION_AUTOPAY',
          planOrItemName: created.recovery.planOrItemName || `${customer.company || 'Pro'} Plan`,
          amount: created.amount || created.recovery.originalAmount || 0,
          recoveredAmount: created.recovery.recoveredAmount || 0,
          appliedDiscountPct: created.recovery.appliedDiscountPct || 0,
          status: created.recovery.status || 'SCHEDULED_RETRY',
          failureCode: created.failureCode || 'U30',
          failureReason: created.errorDescription || 'Debit failed: Insufficient funds in account',
          failureCategory: 'TRANSIENT',
          currentAttempt: 1,
          maxAttempts: 3,
          cooldownHoursRemaining: 24,
          paymentLinkUrl: created.recovery.paymentLinkUrl,
          aiDecision: {
            model: 'Gemini 2.5 Flash',
            action: 'SCHEDULE_RETRY',
            recoveryScore: 85,
            riskScore: 15,
            confidence: 0.92,
            headline: 'AI Recovery Strategy Formulated',
            rationale: 'Evaluated under NPCI Circular OC-136. 24-hour mandatory cooldown enforced.',
            complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
            customerMessagePreview: `Hi ${customer.name}, payment scheduled for retry.`,
          },
          retryTimeline: [
            {
              attemptNumber: 1,
              scheduledFor: new Date().toISOString(),
              status: 'failed',
              errorCode: 'U30',
              cooldownHoursMet: 24,
            },
          ],
          notificationHistory: [
            {
              channel: 'WHATSAPP',
              recipient: customer.phone,
              messageBody: `Hi ${customer.name}, recovery update.`,
              status: 'DELIVERED',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error('Error creating payment in MongoDB:', err);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const selectedScenario = FAILURE_SCENARIOS.find((s) => s.id === scenario);
  const canProceedStep1 = customer.name.trim().length > 0 && customer.email.trim().length > 0;
  const canProceedStep2 = payment.amount.trim().length > 0 && parseFloat(payment.amount) > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-start p-4 sm:p-6 lg:p-8 pointer-events-none">
      {/* Crisp Backdrop (NO blur overlay, leaves dashboard screen 100% visible and sharp) */}
      <div
        className="fixed inset-0 bg-slate-900/15 transition-opacity duration-200 pointer-events-auto"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Right Corner-Anchored Floating Panel (fits content naturally, NO excessive full-height stretching!) */}
      <div className="relative z-10 w-full max-w-xl xl:max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden pointer-events-auto animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create & Simulate Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Step {step} of 4 — {STEPS[step - 1].label} Details
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto">
          <StepIndicator currentStep={step} />

          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="e.g. vikram.m@zenithcloud.io"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone (WhatsApp Rail)</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+91 98450 11223"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Company / Organization</label>
                  <input
                    type="text"
                    value={customer.company}
                    onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                    placeholder="Zenith Cloud Technologies"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {step === 2 && (
            <div className="space-y-4 animate-slide-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Amount (₹) *</label>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                    placeholder="14500"
                    min="1"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Merchant Order ID</label>
                  <input
                    type="text"
                    value={payment.orderId}
                    onChange={(e) => setPayment({ ...payment, orderId: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-mono text-slate-700 bg-slate-100/70"
                  />
                </div>
                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Payment Workflow Type *</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['SUBSCRIPTION', 'ONE_TIME', 'CHECKOUT'] as PaymentType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPayment({ ...payment, paymentType: type })}
                        className={cn(
                          'h-11 rounded-xl border-2 text-xs font-bold transition-all',
                          payment.paymentType === type
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {type === 'SUBSCRIPTION' ? 'UPI AutoPay' : type === 'ONE_TIME' ? 'One-Time' : 'Checkout Cart'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Customer UPI ID / VPA</label>
                  <input
                    type="text"
                    value={payment.upiId}
                    onChange={(e) => setPayment({ ...payment, upiId: e.target.value })}
                    placeholder="vikrammalhotra@okhdfcbank"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Scenario Selection */}
          {step === 3 && (
            <div className="space-y-3.5 animate-slide-in-up">
              <p className="text-xs text-slate-500 font-medium">
                Choose the payment failure or success event. Revora AI will autonomously handle retries and compliance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {FAILURE_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScenario(s.id)}
                    className={cn(
                      'text-left p-3.5 rounded-2xl border-2 transition-all',
                      scenario === s.id
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn('p-1.5 rounded-lg shrink-0', s.color)}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900">{s.label}</p>
                          {s.code && (
                            <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {s.code}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: AI Strategy Preview */}
          {step === 4 && selectedScenario && (
            <div className="space-y-4 animate-slide-in-up">
              {/* Summary Card */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{customer.name || 'Demo Customer'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
                      ₹{parseFloat(payment.amount || '4999').toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scenario</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedScenario.label}</p>
                  </div>
                </div>
              </div>

              {/* AI Strategy Actions */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-white space-y-2.5">
                <p className="text-xs font-bold text-slate-900">
                  Autonomous AI Execution Pipeline:
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Payment record persisted in MongoDB', status: scenario === 'SUCCESS' ? 'success' : 'danger', icon: '💳' },
                    { label: 'AI classifies bank failure telemetry & reason code', status: 'info', icon: '🧠', skip: scenario === 'SUCCESS' },
                    { label: 'Customer recovery health score & probability evaluated', status: 'info', icon: '📊', skip: scenario === 'SUCCESS' },
                    { label: 'Retry scheduled with mandatory NPCI 24h cooldown', status: 'warning', icon: '⏱️', skip: scenario === 'SUCCESS' || scenario === 'INVALID_MPIN' || scenario === 'CHECKOUT_ABANDONED' },
                    { label: 'Out-of-band WhatsApp pre-debit advisory generated', status: 'info', icon: '💬' },
                    { label: selectedScenario.aiAction, status: 'success', icon: '✅' },
                  ]
                    .filter((f) => !f.skip)
                    .map((flow, i) => (
                      <div key={i} className="flex gap-2.5 items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs shrink-0">
                          {flow.icon}
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{flow.label}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* NPCI Compliance Note */}
              {scenario !== 'SUCCESS' && (
                <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-3 flex items-center gap-2.5">
                  <span className="text-lg shrink-0">🛡️</span>
                  <p className="text-[11px] text-emerald-900 font-semibold leading-relaxed">
                    NPCI UPI AutoPay Circular OC-136 compliant — max 3 presentations with 24h mandatory cooldown.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
            className="gap-1.5 font-bold text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 4 ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
              className="gap-1.5 font-bold shadow-xs"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleStartRecovery}
              isLoading={isLoading}
              disabled={isLoading}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-xs font-bold text-white disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              Start Recovery
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
