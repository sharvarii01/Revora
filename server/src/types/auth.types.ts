export interface RegisterMerchantDto {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  environment?: 'TEST' | 'LIVE';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  webhookSecret?: string;
  maxDiscountPct?: number;
}

export interface LoginMerchantDto {
  email: string;
  password: string;
}

export interface AuthResponseData {
  merchant: {
    id: string;
    name: string;
    email: string;
    businessName: string;
    environment: string;
    maxDiscountPct: number;
    autoRecoveryEnabled: boolean;
  };
  accessToken: string;
  refreshToken: string;
}
