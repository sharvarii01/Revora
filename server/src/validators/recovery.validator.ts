import { z } from 'zod';

export const stopRecoverySchema = z.object({
  body: z.object({
    reason: z.string().optional().default('MERCHANT_MANUAL_CANCELLATION'),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const recoveryQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional().default(50),
    offset: z.coerce.number().min(0).optional().default(0),
  }),
});
