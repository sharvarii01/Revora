import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  merchantId: string;
  email: string;
  businessName: string;
}

const JWT_SECRET = env?.JWT_SECRET || 'revora_super_secret_jwt_access_key_2026';
const JWT_REFRESH_SECRET = env?.JWT_REFRESH_SECRET || 'revora_super_secret_jwt_refresh_key_2026';
const JWT_EXPIRES_IN = (env?.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (env?.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
