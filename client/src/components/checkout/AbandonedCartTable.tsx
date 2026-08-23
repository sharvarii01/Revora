'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { recoveriesService } from '@/services/recoveries.service';
import { formatINR } from '@/utils/currency';
import { formatRelativeTime } from '@/utils/date';
import { ExternalLink, Loader2 } from 'lucide-react';

export function AbandonedCartTable() {
  const [carts, setCarts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await recoveriesService.getRecoveries({ type: 'CHECKOUT_ABANDONMENT' });
        if (res?.data) {
          setCarts(res.data);
        }
      } catch (err) {
        console.error('Error fetching abandoned carts from MongoDB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const getStageBadge = (status: string, discount: number) => {
    if (status.startsWith('RECOVERED')) {
      return <Badge variant="success" className="text-xs font-bold px-3 py-1">Recovered & Paid</Badge>;
    }
    if (discount >= 10) {
      return <Badge variant="default" className="text-xs font-bold px-3 py-1">Stage 3: 10% Floor</Badge>;
    }
    if (discount >= 5) {
      return <Badge variant="warning" className="text-xs font-bold px-3 py-1">Stage 2: 5% Offer</Badge>;
    }
    return <Badge variant="info" className="text-xs font-bold px-3 py-1">Stage 1: Nudge (0%)</Badge>;
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 flex flex-col items-center justify-center gap-3 shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-base text-slate-500 font-medium">Loading checkout drop-offs from database...</span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Items Dropped</TableHead>
            <TableHead>Cart Value</TableHead>
            <TableHead>Abandoned</TableHead>
            <TableHead>Recovery Stage</TableHead>
            <TableHead>Discount Applied</TableHead>
            <TableHead>Link Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-base font-medium">
                No abandoned checkout sessions found.
              </TableCell>
            </TableRow>
          ) : (
            carts.map((cart) => (
              <TableRow key={cart.id} className="hover:bg-slate-50">
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{cart.customer?.name || 'Shopper'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{cart.customer?.email || 'email@customer.in'}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-slate-800 font-bold truncate max-w-[200px]">{cart.planOrItemName}</p>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-base font-extrabold text-slate-900">{formatINR(cart.originalAmount || cart.amount)}</span>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-slate-500 font-medium font-mono" suppressHydrationWarning>
                    {formatRelativeTime(cart.createdAt)}
                  </span>
                </TableCell>

                <TableCell>{getStageBadge(cart.status, cart.appliedDiscountPct)}</TableCell>

                <TableCell>
                  <span className="font-mono text-sm text-emerald-700 font-extrabold">
                    {cart.appliedDiscountPct > 0 ? `-${cart.appliedDiscountPct}%` : '0%'}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge variant={cart.paymentLinkUrl ? 'success' : 'secondary'} className="text-xs font-bold px-3 py-1">
                    {cart.paymentLinkUrl ? 'Link Active' : 'Queued'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 font-bold"
                    onClick={() => {
                      if (cart.paymentLinkUrl) window.open(cart.paymentLinkUrl, '_blank');
                    }}
                  >
                    <span>Pay Link</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
