import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('revora_access_token') || localStorage.getItem('vasooli_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data envelope and handle 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // If unauthorized, clear tokens
      const isAuthEndpoint = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('revora_access_token');
        localStorage.removeItem('revora_refresh_token');
        localStorage.removeItem('revora_merchant');
        localStorage.removeItem('vasooli_access_token');
        localStorage.removeItem('vasooli_refresh_token');
        localStorage.removeItem('vasooli_merchant');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
