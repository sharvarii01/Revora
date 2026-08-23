import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/revora'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  
  JWT_SECRET: z.string().default('revora_super_secret_jwt_access_key_2026'),
  JWT_REFRESH_SECRET: z.string().default('revora_super_secret_jwt_refresh_key_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  RAZORPAY_KEY_ID: z.string().default('rzp_test_revora_live_sandbox'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_revora_sandbox_key'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('whsec_revora_razorpay_hmac_2026'),
  
  GEMINI_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),
  CLIENT_ORIGIN: z.string().default('http://localhost:3005'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
