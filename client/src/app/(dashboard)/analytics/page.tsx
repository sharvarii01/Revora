'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AnalyticsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/insights?tab=analytics'); }, [router]);
  return null;
}
