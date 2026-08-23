'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function ActivityRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/insights?tab=activity'); }, [router]);
  return null;
}
