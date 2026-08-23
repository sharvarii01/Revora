'use client';

import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RecoveryRecord } from '@/types/recovery';
import { RecoveryStatusBadge } from './RecoveryStatusBadge';
import { formatINR } from '@/utils/currency';
import { getNpciCodeDetail } from '@/utils/npci';
import { Search, ChevronRight } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';

export function RecoveryDataTable({ filterStatus }: { filterStatus?: string }) {
  const { recoveries, setSelectedRecovery, setIsDrawerOpen } = useSimulator();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterStatus || 'ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredData = recoveries.filter((rec) => {
    const matchesSearch =
      rec.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.planOrItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.failureCode && rec.failureCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && ['ANALYZING_AI', 'SCHEDULED_RETRY', 'PAYMENT_LINK_SENT', 'RETRY_IN_PROGRESS'].includes(rec.status)) ||
      (statusFilter === 'RECOVERED' && ['RECOVERED_AUTO_DEBIT', 'RECOVERED_VIA_LINK'].includes(rec.status)) ||
      (statusFilter === 'STOPPED' && ['STOP_NPCI_LIMIT_REACHED', 'STOP_TERMINAL_FAILURE', 'STOP_CUSTOMER_OPTED_OUT'].includes(rec.status)) ||
      rec.status === statusFilter;

    const matchesType = typeFilter === 'ALL' || rec.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRowClick = (rec: RecoveryRecord) => {
    setSelectedRecovery(rec);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, plan or bank code (U30)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active in Progress</option>
            <option value="RECOVERED">Recovered Successfully</option>
            <option value="STOPPED">Halted (Stop State)</option>
            <option value="SCHEDULED_RETRY">Retry Scheduled</option>
            <option value="STOP_NPCI_LIMIT_REACHED">NPCI Limit Breached</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Types</option>
            <option value="SUBSCRIPTION_AUTOPAY">Subscription AutoPay</option>
            <option value="CHECKOUT_ABANDONMENT">Abandoned Cart</option>
          </select>
        </div>
      </div>

      {/* Recoveries Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type & Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Failure Code</TableHead>
              <TableHead>NPCI Attempt</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-400 font-medium">
                  No recovery sessions found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((rec) => {
                const npciDetail = rec.failureCode ? getNpciCodeDetail(rec.failureCode) : null;
                const score = rec.aiDecision?.recoveryScore || 85;

                return (
                  <TableRow
                    key={rec.id}
                    onClick={() => handleRowClick(rec)}
                    className="cursor-pointer hover:bg-slate-50/90 transition-colors"
                  >
                    {/* Customer */}
                    <TableCell>
                      <div className="font-bold text-slate-900 text-base">{rec.customerName}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{rec.customerEmail}</div>
                    </TableCell>

                    {/* Plan */}
                    <TableCell>
                      <div className="text-sm font-bold text-slate-800">{rec.planOrItemName}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                        {rec.type === 'SUBSCRIPTION_AUTOPAY' ? 'UPI AutoPay' : 'Checkout Cart'}
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <div className="font-mono font-extrabold text-slate-900 text-base">
                        {formatINR(rec.amount)}
                      </div>
                    </TableCell>

                    {/* Failure Code */}
                    <TableCell>
                      {rec.failureCode ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                            {rec.failureCode}
                          </span>
                          <span className="text-xs text-slate-500 truncate max-w-[140px] font-medium">
                            {npciDetail?.name || 'Failed'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">—</span>
                      )}
                    </TableCell>

                    {/* NPCI Attempt */}
                    <TableCell>
                      <span className="font-mono font-bold text-sm text-slate-700">
                        {rec.currentAttempt}/{rec.maxAttempts}
                      </span>
                    </TableCell>

                    {/* AI Score */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={score >= 80 ? 'bg-emerald-500 h-full' : score >= 50 ? 'bg-amber-500 h-full' : 'bg-rose-500 h-full'}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-slate-800">{score}%</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <RecoveryStatusBadge status={rec.status} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(rec);
                        }}
                        className="text-slate-400 hover:text-slate-900"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-medium">
        <span>Showing {filteredData.length} recovery sessions</span>
        <span className="font-mono">Deterministic Rule Engine & Gemini 2.5 Active</span>
      </div>
    </div>
  );
}
