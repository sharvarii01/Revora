import { NPCI_FAILURE_CODES, NpciCodeDetail } from '@/constants/npciRules';

export function getNpciCodeDetail(code?: string | null): NpciCodeDetail {
  if (!code) {
    return {
      code: 'UNKNOWN',
      name: 'Unknown Failure',
      category: 'TRANSIENT',
      description: 'Payment authorization failed due to unknown bank reason',
      recommendedAction: 'Analyze telemetry and inspect Razorpay error response',
      maxAttempts: 3,
    };
  }

  const normalized = code.trim().toUpperCase();
  return (
    NPCI_FAILURE_CODES[normalized] || {
      code: normalized,
      name: `Bank Code ${normalized}`,
      category: 'TRANSIENT',
      description: `Payment execution error returned with code ${normalized}`,
      recommendedAction: 'Schedule retry after standard 24h NPCI cooldown',
      maxAttempts: 3,
    }
  );
}

export function isTerminalNpciCode(code?: string | null): boolean {
  const detail = getNpciCodeDetail(code);
  return detail.category === 'TERMINAL';
}
