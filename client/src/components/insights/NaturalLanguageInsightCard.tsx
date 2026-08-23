'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/types/ai';
import { Brain, ArrowRight } from 'lucide-react';

export function NaturalLanguageInsightCard({ insight }: { insight: AIInsightCard }) {
  const getSeverityBadge = (severity: AIInsightCard['severity']) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="danger">High Impact</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      case 'INFO':
        return <Badge variant="info">Regulatory Notice</Badge>;
      default:
        return <Badge variant="secondary">Notice</Badge>;
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {insight.category}
            </span>
          </div>
          {getSeverityBadge(insight.severity)}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">{insight.title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{insight.description}</p>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Estimated Impact</span>
          <span className="font-bold text-emerald-700 font-mono">{insight.impactMetric}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono font-semibold">
          Confidence: {(insight.confidenceScore * 100).toFixed(0)}%
        </span>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7 gap-1 bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200"
          onClick={() => alert(`Executed recommendation: ${insight.recommendedAction}`)}
        >
          <span>{insight.recommendedAction}</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
