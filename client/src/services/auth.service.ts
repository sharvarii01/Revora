import apiClient from '../lib/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName?: string;
}

export interface MerchantUser {
  id: string;
  name: string;
  email: string;
  businessName: string;
  environment: 'TEST' | 'LIVE';
  maxDiscountPct: number;
  autoRecoveryEnabled: boolean;
  hasRazorpayKeys?: boolean;
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await apiClient.post('/auth/login', payload);
    return res.data.data;
  },

  async register(payload: RegisterPayload) {
    const res = await apiClient.post('/auth/register', payload);
    return res.data.data;
  },

  async getProfile(): Promise<MerchantUser> {
    const res = await apiClient.get('/merchant/profile');
    return res.data.data;
  },

  async updateSettings(data: Partial<MerchantUser & { razorpayKeyId?: string; razorpayKeySecret?: string; webhookSecret?: string }>) {
    const res = await apiClient.put('/merchant/settings', data);
    return res.data.data;
  },

  async logout() {
    try {
      const refreshToken = typeof window !== 'undefined'
        ? (localStorage.getItem('revora_refresh_token') || localStorage.getItem('vasooli_refresh_token'))
        : null;
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('revora_access_token');
        localStorage.removeItem('revora_refresh_token');
        localStorage.removeItem('revora_merchant');
        localStorage.removeItem('vasooli_access_token');
        localStorage.removeItem('vasooli_refresh_token');
        localStorage.removeItem('vasooli_merchant');
      }
    }
  },
};
