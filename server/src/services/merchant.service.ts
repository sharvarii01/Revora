import { merchantRepository } from '../repositories/merchant.repository';
import { NotFoundError } from '../utils/errors';

export class MerchantService {
  async getProfile(merchantId: string) {
    const merchant = await merchantRepository.findById(merchantId);
    if (!merchant) throw new NotFoundError('Merchant profile not found.');

    return {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      businessName: merchant.businessName,
      environment: merchant.environment,
      maxDiscountPct: merchant.maxDiscountPct,
      autoRecoveryEnabled: merchant.autoRecoveryEnabled,
      hasRazorpayKeys: !!merchant.razorpayKeyId,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    };
  }

  async updateSettings(
    merchantId: string,
    data: {
      businessName?: string;
      maxDiscountPct?: number;
      autoRecoveryEnabled?: boolean;
      razorpayKeyId?: string;
      razorpayKeySecret?: string;
      webhookSecret?: string;
    }
  ) {
    const updated = await merchantRepository.update(merchantId, data);
    if (!updated) throw new NotFoundError('Merchant not found.');
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      businessName: updated.businessName,
      environment: updated.environment,
      maxDiscountPct: updated.maxDiscountPct,
      autoRecoveryEnabled: updated.autoRecoveryEnabled,
    };
  }
}

export const merchantService = new MerchantService();
