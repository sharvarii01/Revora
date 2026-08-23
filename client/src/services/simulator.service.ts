import apiClient from '../lib/api';

export const simulatorService = {
  async triggerScenario(params: {
    scenario: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    amount?: number;
    attemptNumber?: number;
    recoveryId?: string;
  }) {
    const res = await apiClient.post('/simulator/trigger-event', params);
    return res.data.data;
  },
};
