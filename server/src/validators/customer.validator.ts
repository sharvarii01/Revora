import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    vpa: z.string().optional(),
    razorpayCustId: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    vpa: z.string().optional(),
    optedOut: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});
