import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    businessName: z.string().optional(),
    environment: z.enum(['TEST', 'LIVE']).optional().default('LIVE'),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
    webhookSecret: z.string().optional(),
    maxDiscountPct: z.number().min(0).max(50).optional().default(10),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    businessName: z.string().optional(),
    maxDiscountPct: z.number().min(0).max(50).optional(),
    autoRecoveryEnabled: z.boolean().optional(),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
});
