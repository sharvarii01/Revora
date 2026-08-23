'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { subscriptionsService } from '@/services/subscriptions.service';
import { formatINR } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Loader2 } from 'lucide-react';

import { useSimulator } from '@/context/SimulatorContext';

export function SubscriptionTable() {
  const { recoveries } = useSimulator();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await subscriptionsService.getSubscriptions({ limit: 50 });
        if (res?.data) {
          setSubscriptions(res.data);
        }
      } catch (err) {
        console.error('Error fetching subscriptions from MongoDB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [recoveries]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 flex flex-col items-center justify-center gap-3 shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-base text-slate-500 font-medium">Loading subscriptions from database...</span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Subscription Plan</TableHead>
            <TableHead>Recurring Amount</TableHead>
            <TableHead>Mandate VPA / Bank</TableHead>
            <TableHead>Mandate Status</TableHead>
            <TableHead>Next Due / Retry</TableHead>
            <TableHead>Health</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-base font-medium">
                No active subscriptions found.
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((sub) => (
              <TableRow key={sub.id} className="hover:bg-slate-50">
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{sub.customer?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{sub.customer?.email || 'email@revora.ai'}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{sub.planName}</p>
                    <span className="text-xs text-slate-400 uppercase font-mono mt-0.5">{sub.billingCycle}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-base font-extrabold text-slate-900">{formatINR(sub.amount)}</span>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="font-mono text-xs text-slate-800 font-bold">{sub.mandate?.vpa || sub.customer?.vpa || 'Card / Netbanking'}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{sub.mandate?.bankName || 'HDFC Bank'}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      sub.mandate?.status === 'ACTIVE'
                        ? 'success'
                        : sub.mandate?.status === 'REVOKED'
                        ? 'danger'
                        : 'warning'
                    }
                    className="text-xs font-bold px-3 py-1"
                  >
                    {sub.mandate?.status || 'ACTIVE'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-slate-700 font-semibold">{formatDate(sub.nextDueDate)}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-900 font-bold font-mono">{sub.customer?.healthScore || 92}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
