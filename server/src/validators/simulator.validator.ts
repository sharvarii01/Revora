import { z } from 'zod';

export const simulatorTriggerSchema = z.object({
  body: z.object({
    scenario: z.enum([
      'AUTOPAY_INSUFFICIENT_FUNDS_U30',
      'AUTOPAY_NPCI_LIMIT_BREACH',
      'AUTOPAY_TERMINAL_VPA_REVOKED_ZG',
      'CHECKOUT_ABANDONED_TIER1',
      'CHECKOUT_ABANDONED_DYNAMIC_DISCOUNT',
      'SIMULATE_CUSTOMER_PAYMENT',
    ]),
    customerName: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    amount: z.number().positive().optional(),
    attemptNumber: z.number().int().min(1).max(3).optional(),
    recoveryId: z.string().optional(),
  }),
});
