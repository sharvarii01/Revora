'use client';

import React from 'react';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { AIDecisionDetail } from '@/types/recovery';
import { Brain, ShieldCheck, MessageSquare } from 'lucide-react';

export function AiExplainabilityCard({ decision }: { decision: AIDecisionDetail }) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Explainable AI Decision Audit
              <span className="font-medium text-[10px] text-slate-400">({decision.model})</span>
            </h4>
            <p className="text-[11px] text-indigo-600 font-semibold">{decision.headline}</p>
          </div>
        </div>
        <Badge variant="success" className="text-[10px]">
          {(decision.confidence * 100).toFixed(0)}% Confidence
        </Badge>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-600 font-semibold">Recovery Probability</span>
            <span className="text-emerald-700 font-bold">{decision.recoveryScore}%</span>
          </div>
          <Progress value={decision.recoveryScore} indicatorClassName="bg-emerald-600" className="h-1.5" />
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-600 font-semibold">Risk Score</span>
            <span className="text-rose-700 font-bold">{decision.riskScore}%</span>
          </div>
          <Progress value={decision.riskScore} indicatorClassName="bg-rose-600" className="h-1.5" />
        </div>
      </div>

      {/* Decision Rationale */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Autonomous Reasoning
        </span>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-medium">
          {decision.rationale}
        </p>
      </div>

      {/* Customer Message Preview */}
      {decision.customerMessagePreview && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> Customer Notification Preview
          </span>
          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px]">
            {decision.customerMessagePreview}
          </p>
        </div>
      )}

      {/* Compliance Rule Applied */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2.5 font-mono">
        <span className="flex items-center gap-1 text-emerald-700 font-bold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Regulatory Verified
        </span>
        <span className="text-slate-600">{decision.complianceRule}</span>
      </div>
    </div>
  );
}
