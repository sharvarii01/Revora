'use client';

import React from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecoveryRecord } from '@/types/recovery';
import { RecoveryStatusBadge } from './RecoveryStatusBadge';
import { NpciAttemptProgress } from './NpciAttemptProgress';
import { AiExplainabilityCard } from './AiExplainabilityCard';
import { formatINR } from '@/utils/currency';
import { formatDate, formatDateTime, formatRelativeTime } from '@/utils/date';
import { getNpciCodeDetail } from '@/utils/npci';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export interface RecoveryDetailDrawerProps {
  recovery: RecoveryRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecoveryDetailDrawer({ recovery, isOpen, onClose }: RecoveryDetailDrawerProps) {
  const { triggerCustomerPaymentScenario } = useSimulator();

  if (!recovery) return null;

  const codeDetail = getNpciCodeDetail(recovery.failureCode);
  const isTerminal = recovery.failureCategory === 'TERMINAL';

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Recovery Session: ${recovery.id}`}
      description={`Initiated ${formatRelativeTime(recovery.createdAt)}`}
      width="xl"
    >
      <div className="space-y-6">
        {/* Top Overview Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Recoverable Amount
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {formatINR(recovery.amount || (recovery as any).originalAmount || 0)}
              </span>
              {recovery.appliedDiscountPct > 0 && (
                <Badge variant="success" className="text-[10px]">
                  {recovery.appliedDiscountPct}% Discount Applied
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">{recovery.planOrItemName}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Current Status
            </span>
            <RecoveryStatusBadge status={recovery.status} />
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Customer Profile
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{recovery.customerName}</p>
                <p className="text-[10px] text-slate-400 font-mono">{recovery.customerId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 truncate max-w-[160px]">{recovery.customerEmail}</p>
                <p className="text-[10px] text-slate-400">Email Channel</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{recovery.customerPhone}</p>
                <p className="text-[10px] text-slate-400">WhatsApp Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* NPCI Attempt Progress Tracker */}
        {recovery.type === 'SUBSCRIPTION_AUTOPAY' && (
          <NpciAttemptProgress
            currentAttempt={recovery.currentAttempt}
            maxAttempts={recovery.maxAttempts}
            isTerminal={isTerminal}
            cooldownHoursRemaining={recovery.cooldownHoursRemaining}
          />
        )}

        {/* AI Explainability & Audit Engine */}
        {recovery.aiDecision && <AiExplainabilityCard decision={recovery.aiDecision} />}

        {/* Bank Error Analysis Details */}
        {recovery.failureCode && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Bank Failure Diagnosis (NPCI Code)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">NPCI Error Code:</span>
                <span className="font-mono font-bold text-slate-900">
                  {recovery.failureCode} – {codeDetail.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Category:</span>
                <Badge
                  variant={
                    recovery.failureCategory === 'TERMINAL'
                      ? 'danger'
                      : recovery.failureCategory === 'ACTION_REQUIRED'
                      ? 'warning'
                      : 'default'
                  }
                  className="font-mono text-[10px]"
                >
                  {recovery.failureCategory}
                </Badge>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-500 font-medium mb-1">Reason Narrative:</p>
                <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                  {recovery.failureReason}
                </p>
              </div>
              {recovery.stopReason && (
                <div className="pt-2 border-t border-slate-100 text-rose-700">
                  <p className="font-semibold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-rose-600" /> Stop State Reason:
                  </p>
                  <p className="text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-1 font-medium">
                    {recovery.stopReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Link Generator and Quick Recovery CTA */}
        {recovery.paymentLinkUrl && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950">Active Smart Payment Link</span>
              <Badge variant="success" className="text-[10px]">
                UPI Intent Ready
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={recovery.paymentLinkUrl || `http://localhost:3005/pay/${recovery.id}`}
                className="h-8 flex-1 rounded-lg border border-indigo-200 bg-white px-3 font-mono text-xs text-indigo-900 shadow-2xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => {
                  navigator.clipboard.writeText(recovery.paymentLinkUrl || `http://localhost:3005/pay/${recovery.id}`);
                }}
              >
                Copy Link
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 font-bold gap-1 shadow-xs"
                onClick={() => {
                  window.open(`/pay/${recovery.id}`, '_blank');
                }}
              >
                <span>Open Pay Portal</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Retry Timeline */}
        {recovery.retryTimeline && recovery.retryTimeline.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Presentation Attempt History
            </h4>
            <div className="space-y-2">
              {recovery.retryTimeline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                      {item.attemptNumber}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.status === 'success'
                          ? 'Debited Successfully'
                          : item.status === 'failed'
                          ? `Attempt Failed (${item.errorCode || 'U30'})`
                          : 'Scheduled Next Presentation'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {formatDateTime(item.executedAt || item.scheduledFor)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        item.status === 'success'
                          ? 'text-emerald-700'
                          : item.status === 'failed'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.cooldownHoursMet > 0 && (
                      <p className="text-[9px] text-slate-400 font-mono">+{item.cooldownHoursMet}h cooldown</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons in Drawer Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs bg-white border-slate-200 text-slate-700"
          >
            Close Inspector
          </Button>

          {recovery.status !== 'RECOVERED_AUTO_DEBIT' && recovery.status !== 'RECOVERED_VIA_LINK' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                triggerCustomerPaymentScenario(recovery.id);
                onClose();
              }}
              className="text-xs gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Simulate Customer Payment</span>
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
