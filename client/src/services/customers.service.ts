import apiClient from '../lib/api';

export const customersService = {
  async getCustomers(params?: { search?: string; limit?: number; offset?: number }) {
    const res = await apiClient.get('/customers', { params });
    return res.data;
  },

  async getCustomerById(id: string) {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data.data;
  },

  async createCustomer(data: any) {
    const res = await apiClient.post('/customers', data);
    return res.data.data;
  },

  async updateCustomer(id: string, data: any) {
    const res = await apiClient.patch(`/customers/${id}`, data);
    return res.data.data;
  },
};
