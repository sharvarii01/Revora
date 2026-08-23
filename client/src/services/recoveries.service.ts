import apiClient from '../lib/api';

export interface RecoveryFilters {
  status?: string;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const recoveriesService = {
  async getRecoveries(filters?: RecoveryFilters) {
    const res = await apiClient.get('/recoveries', { params: filters });
    return res.data;
  },

  async getRecoveryById(id: string) {
    const res = await apiClient.get(`/recoveries/${id}`);
    return res.data.data;
  },

  async stopRecovery(id: string, reason?: string, notes?: string) {
    const res = await apiClient.post(`/recoveries/${id}/stop`, { reason, notes });
    return res.data.data;
  },

  async deleteRecovery(id: string) {
    const res = await apiClient.delete(`/recoveries/${id}`);
    return res.data;
  },
};
