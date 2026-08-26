const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

class ApiError extends Error {
  response?: {
    data: any;
    status: number;
    statusText: string;
  };

  constructor(message: string, response?: { data: any; status: number; statusText: string }) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
  }
}

async function request<T = any>(
  endpoint: string,
  method: string = 'GET',
  bodyData?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('revora_access_token') ||
      localStorage.getItem('vasooli_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (bodyData !== undefined && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(bodyData);
  }

  try {
    const res = await fetch(url, fetchOptions);
    let responseData: any = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
        if (!isAuthEndpoint) {
          localStorage.removeItem('revora_access_token');
          localStorage.removeItem('revora_refresh_token');
          localStorage.removeItem('revora_merchant');
        }
      }
      throw new ApiError(responseData?.message || `Request failed with status ${res.status}`, {
        data: responseData,
        status: res.status,
        statusText: res.statusText,
      });
    }

    return {
      data: responseData,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err?.message || 'Network request failed', {
      data: null,
      status: 0,
      statusText: 'Network Error',
    });
  }
}

export const apiClient = {
  get: <T = any>(url: string, options?: RequestOptions) => request<T>(url, 'GET', undefined, options),
  post: <T = any>(url: string, data?: any, options?: RequestOptions) => request<T>(url, 'POST', data, options),
  put: <T = any>(url: string, data?: any, options?: RequestOptions) => request<T>(url, 'PUT', data, options),
  patch: <T = any>(url: string, data?: any, options?: RequestOptions) => request<T>(url, 'PATCH', data, options),
  delete: <T = any>(url: string, options?: RequestOptions) => request<T>(url, 'DELETE', undefined, options),
};

export default apiClient;
