import apiClient from '../lib/api';

export const aiService = {
  async analyzeFailure(params: {
    failureCode: string;
    amount: number;
    customerRiskScore?: number;
    customerHealthScore?: number;
    planName?: string;
  }) {
    const res = await apiClient.post('/ai/analyze-failure', params);
    return res.data.data;
  },

  async getInsights() {
    const res = await apiClient.get('/ai/insights');
    return res.data.data;
  },
};
