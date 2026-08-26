'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { RecoveryDetailDrawer } from '@/components/recovery/RecoveryDetailDrawer';
import { useSimulator } from '@/context/SimulatorContext';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { selectedRecovery, isDrawerOpen, setIsDrawerOpen } = useSimulator();
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Loading Revora Console…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      {/* Fixed Sidebar (280px wide) */}
      <Sidebar />

      {/* Main Content Area (Fluid full-width 90-95% screen) */}
      <div className="flex-1 flex flex-col ml-[280px] min-w-0">
        <Topbar />
        <main className="flex-1 w-full px-8 xl:px-12 2xl:px-16 py-8 pb-16">
          {children}
        </main>
      </div>

      {/* Global Recovery Detail Drawer */}
      <RecoveryDetailDrawer
        recovery={selectedRecovery}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

