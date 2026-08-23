import { MerchantModel, IMerchant } from '../models/Merchant.model';
import { RefreshTokenModel, IRefreshToken } from '../models/RefreshToken.model';

export class MerchantRepository {
  async findById(id: string): Promise<any | null> {
    const doc: any = await MerchantModel.findById(id).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async findByEmail(email: string): Promise<any | null> {
    const doc: any = await MerchantModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    businessName?: string;
    environment?: string;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    webhookSecret?: string;
    maxDiscountPct?: number;
  }): Promise<any> {
    const doc: any = await MerchantModel.create({
      ...data,
      email: data.email.toLowerCase(),
    });
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async update(id: string, data: Partial<IMerchant>): Promise<any | null> {
    const doc: any = await MerchantModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async createRefreshToken(merchantId: string, token: string, expiresAt: Date): Promise<any> {
    const doc: any = await RefreshTokenModel.create({
      merchantId,
      token,
      expiresAt,
    });
    return { ...doc.toJSON(), id: doc._id.toString() };
  }

  async findRefreshToken(token: string): Promise<any | null> {
    const doc: any = await RefreshTokenModel.findOne({ token }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await RefreshTokenModel.updateMany({ token }, { $set: { revoked: true } });
  }

  async revokeAllMerchantTokens(merchantId: string): Promise<void> {
    await RefreshTokenModel.updateMany({ merchantId }, { $set: { revoked: true } });
  }
}

export const merchantRepository = new MerchantRepository();
