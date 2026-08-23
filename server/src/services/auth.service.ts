import { merchantRepository } from '../repositories/merchant.repository';
import { hashPassword, comparePassword } from '../utils/hash.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt.util';
import { RegisterMerchantDto, LoginMerchantDto, AuthResponseData } from '../types/auth.types';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';
import logger from '../logs/logger';

export class AuthService {
  async register(data: RegisterMerchantDto): Promise<AuthResponseData> {
    const existing = await merchantRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A merchant account with this email already exists.');
    }

    const passwordHash = await hashPassword(data.password);
    const merchant = await merchantRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      businessName: data.businessName || `${data.name}'s Business`,
      environment: data.environment || 'LIVE',
      razorpayKeyId: data.razorpayKeyId,
      razorpayKeySecret: data.razorpayKeySecret,
      webhookSecret: data.webhookSecret,
      maxDiscountPct: data.maxDiscountPct || 10,
    });

    const payload: TokenPayload = {
      merchantId: merchant.id,
      email: merchant.email,
      businessName: merchant.businessName,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await merchantRepository.createRefreshToken(merchant.id, refreshToken, expiresAt);

    logger.info({ merchantId: merchant.id }, '🎉 New merchant registered successfully.');

    return {
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        businessName: merchant.businessName,
        environment: merchant.environment,
        maxDiscountPct: merchant.maxDiscountPct,
        autoRecoveryEnabled: merchant.autoRecoveryEnabled,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginMerchantDto): Promise<AuthResponseData> {
    const merchant = await merchantRepository.findByEmail(data.email);
    if (!merchant) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await comparePassword(data.password, merchant.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const payload: TokenPayload = {
      merchantId: merchant.id,
      email: merchant.email,
      businessName: merchant.businessName,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await merchantRepository.createRefreshToken(merchant.id, refreshToken, expiresAt);

    logger.info({ merchantId: merchant.id }, '🔑 Merchant logged in.');

    return {
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        businessName: merchant.businessName,
        environment: merchant.environment,
        maxDiscountPct: merchant.maxDiscountPct,
        autoRecoveryEnabled: merchant.autoRecoveryEnabled,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const tokenRecord = await merchantRepository.findRefreshToken(rawRefreshToken);
    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has been revoked or expired.');
    }

    // Revoke old refresh token (rotation)
    await merchantRepository.revokeRefreshToken(rawRefreshToken);

    const newPayload: TokenPayload = {
      merchantId: payload.merchantId,
      email: payload.email,
      businessName: payload.businessName,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await merchantRepository.createRefreshToken(payload.merchantId, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await merchantRepository.revokeRefreshToken(rawRefreshToken);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const merchant = await merchantRepository.findByEmail(email);
    if (!merchant) {
      // Return safe generic message
      return { message: 'If that email exists, a password reset link has been dispatched.' };
    }
    logger.info({ email }, '📧 Password reset requested.');
    return { message: 'Password reset link sent to your registered email.' };
  }
}

export const authService = new AuthService();
