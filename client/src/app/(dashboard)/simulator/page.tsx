'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function SimulatorRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/recoveries?tab=demo'); }, [router]);
  return null;
}
