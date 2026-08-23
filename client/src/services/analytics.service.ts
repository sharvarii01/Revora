import apiClient from '../lib/api';

export const analyticsService = {
  async getSummary() {
    const res = await apiClient.get('/analytics/summary');
    return res.data.data;
  },

  async getTimeseries() {
    const res = await apiClient.get('/analytics/timeseries');
    return res.data.data;
  },

  async getFailureReasons() {
    const res = await apiClient.get('/analytics/failure-reasons');
    return res.data.data;
  },

  async getChannelEfficiency() {
    const res = await apiClient.get('/analytics/channels');
    return res.data.data;
  },

  async getActivityLogs(params?: { limit?: number; offset?: number }) {
    const res = await apiClient.get('/analytics/activity-logs', { params });
    return res.data;
  },
};
