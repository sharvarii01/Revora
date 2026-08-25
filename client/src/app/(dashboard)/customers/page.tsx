'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { customersService } from '@/services/customers.service';
import { formatINR } from '@/utils/currency';
import { useSimulator } from '@/context/SimulatorContext';
import { PaymentWizard } from '@/components/payments/PaymentWizard';
import { Search, Users, Plus, Upload, Sparkles, TrendingUp, Shield, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

function CustomerCard({ customer }: { customer: any }) {
  const healthColor =
    (customer.healthScore || 85) >= 80
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : (customer.healthScore || 85) >= 60
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-7 card-hover flex flex-col justify-between gap-5 shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl gradient-brand text-white font-extrabold text-lg shrink-0 shadow-xs">
              {customer.name?.[0] || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">{customer.name}</p>
              <p className="text-sm text-slate-500 font-medium truncate">{customer.email}</p>
            </div>
          </div>
          <span className={cn('text-xs font-bold px-3 py-1 rounded-full border shrink-0', healthColor)}>
            {customer.healthScore || 85}/100
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3.5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Recovered</p>
            <p className="text-lg font-extrabold text-emerald-900 font-mono">
              {formatINR(customer.totalRecovered ?? customer.lifetimeRecovered ?? 0, { hideDecimals: true })}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-3.5">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Recovery %</p>
            <p className="text-lg font-extrabold text-amber-900 font-mono">
              {customer.recoveryProbability || 80}%
            </p>
          </div>
        </div>

        {/* VPA */}
        {customer.vpa && (
          <p className="text-xs font-mono text-slate-500 bg-slate-50 rounded-xl px-3.5 py-2.5 truncate border border-slate-100">
            {customer.vpa}
          </p>
        )}
      </div>

      {/* CTA */}
      <Link href={`/customers/${customer.id}`} className="w-full">
        <Button variant="outline" size="md" className="w-full gap-2 text-slate-800 hover:text-indigo-700 hover:border-indigo-300 font-bold">
          View Full Profile <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

export default function CustomersPage() {
  const { recoveries } = useSimulator();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const loadCustomers = async () => {
    try {
      const res = await customersService.getCustomers({ limit: 100 });
      if (res?.data) setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers from MongoDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [recoveries]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vpa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 xl:space-y-10 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-base xl:text-lg text-slate-500 mt-1 font-medium">
            {customers.length} customer profiles · AI-scored health & lifetime recovery metrics.
          </p>
        </div>
      </div>

      {/* Summary Stats Row */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Customers</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{customers.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Avg Health Score</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                {Math.round(customers.reduce((sum, c) => sum + (c.healthScore || 80), 0) / customers.length)}/100
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Avg Recovery Rate</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                {Math.round(customers.reduce((sum, c) => sum + (c.recoveryProbability || 80), 0) / customers.length)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Input (48px) */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email or VPA…"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-base text-slate-500 font-medium">Loading customer database…</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-indigo-600" />}
          title="No customers found"
          description={
            searchTerm
              ? `No customer profiles matching "${searchTerm}". Try adjusting your search term.`
              : 'Your customer directory is empty. Customers will automatically appear here whenever a payment is initiated.'
          }
          primaryAction={
            <Button size="md" onClick={() => setIsWizardOpen(true)} className="gap-2 font-bold shadow-sm">
              <Plus className="h-5 w-5" />
              <span>Create First Payment</span>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}

      <PaymentWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
