'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function SubscriptionsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/recoveries?tab=subscriptions'); }, [router]);
  return null;
}
