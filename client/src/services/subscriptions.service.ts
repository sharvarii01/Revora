import apiClient from '../lib/api';

export const subscriptionsService = {
  async getSubscriptions(params?: { status?: string; limit?: number; offset?: number }) {
    const res = await apiClient.get('/subscriptions', { params });
    return res.data;
  },

  async getSubscriptionById(id: string) {
    const res = await apiClient.get(`/subscriptions/${id}`);
    return res.data.data;
  },

  async createSubscription(data: any) {
    const res = await apiClient.post('/subscriptions', data);
    return res.data.data;
  },
};
