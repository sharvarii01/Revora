import apiClient from '../lib/api';

export interface CreatePaymentPayload {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  customerId?: string;
  amount: number;
  currency?: string;
  orderId?: string;
  paymentType?: 'ONE_TIME' | 'SUBSCRIPTION' | 'CHECKOUT';
  upiId?: string;
  scenario?: string;
  failureCode?: string;
  bank?: string;
  status?: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
}

export const paymentsService = {
  async getPayments(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const res = await apiClient.get('/payments', { params });
    return res.data;
  },

  async getPaymentById(id: string) {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data.data;
  },

  async createPayment(data: CreatePaymentPayload) {
    const res = await apiClient.post('/payments', data);
    return res.data.data;
  },

  async updatePayment(id: string, data: any) {
    const res = await apiClient.patch(`/payments/${id}`, data);
    return res.data.data;
  },

  async deletePayment(id: string) {
    const res = await apiClient.delete(`/payments/${id}`);
    return res.data.data;
  },

  async capturePayment(id: string) {
    const res = await apiClient.post(`/payments/${id}/capture`);
    return res.data.data;
  },
};
