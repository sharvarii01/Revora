'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CustomerProfileHeader } from '@/components/customer/CustomerProfileHeader';
import { CustomerTimeline } from '@/components/customer/CustomerTimeline';
import { Button } from '@/components/ui/Button';
import { customersService } from '@/services/customers.service';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useSimulator } from '@/context/SimulatorContext';

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params?.id as string;
  const { customers: simCustomers, recoveries } = useSimulator();
  const [customer, setCustomer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (customerId) {
          const data = await customersService.getCustomerById(customerId);
          if (data && data.name) {
            setCustomer(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend customer fetch failed, looking up from local store:', err);
      }

      // Resilient local store fallback
      if (simCustomers && customerId) {
        const found = simCustomers.find(
          (c) => c.id === customerId || c.id.endsWith(customerId) || customerId.endsWith(c.id)
        );
        if (found) {
          const customerRecs = recoveries.filter(
            (r) => r.customerId === found.id || r.customerName === found.name
          );
          setCustomer({
            ...found,
            recoveries: customerRecs,
            totalRecovered:
              customerRecs.reduce((sum, r) => sum + r.recoveredAmount, 0) || found.totalRecovered || 14999,
          });
        }
      }
      setIsLoading(false);
    }
    load();
  }, [customerId, simCustomers, recoveries]);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-xs text-slate-400 font-medium">Loading 360° customer profile...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-16 text-center space-y-3">
        <p className="text-sm text-slate-500 font-medium">Customer profile not found.</p>
        <Link href="/customers">
          <Button size="sm" variant="outline">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-2">
        <Link href="/customers">
          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Customers</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Customer 360°: ${customer.name}`}
        description="Comprehensive audit of recurring subscriptions, UPI AutoPay mandates, and recovery communications."
      >
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => alert(`Generated Razorpay Payment Link for ${customer.name}`)}
            className="text-xs h-8 gap-1.5 bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200"
          >
            <Send className="h-3.5 w-3.5 text-indigo-600" />
            <span>Send Direct Link</span>
          </Button>
        </div>
      </PageHeader>

      {/* Customer Header & Health Card */}
      <CustomerProfileHeader customer={customer} />

      {/* Timeline & Mandate History */}
      <CustomerTimeline customerId={customer.id} />
    </div>
  );
}
