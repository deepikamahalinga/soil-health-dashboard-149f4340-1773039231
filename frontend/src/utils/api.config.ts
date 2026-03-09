import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface RequestConfig extends AxiosRequestConfig {
  requiresAuth?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: RequestConfig): RequestConfig => {
    // Add auth token if required
    if (config.requiresAuth !== false) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<ApiError> => {
    let errorResponse: ApiError = {
      message: 'An unexpected error occurred',
    };

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      errorResponse.status = status;

      switch (status) {
        case 401:
          errorResponse.message = 'Unauthorized access';
          errorResponse.code = 'UNAUTHORIZED';
          // Handle token expiration
          localStorage.removeItem('authToken');
          break;
        case 403:
          errorResponse.message = 'Forbidden access';
          errorResponse.code = 'FORBIDDEN';
          break;
        case 404:
          errorResponse.message = 'Resource not found';
          errorResponse.code = 'NOT_FOUND';
          break;
        case 500:
          errorResponse.message = 'Internal server error';
          errorResponse.code = 'SERVER_ERROR';
          break;
        default:
          errorResponse.message = error.response.data?.message || 'Request failed';
          errorResponse.code = 'REQUEST_FAILED';
      }
    } else if (error.request) {
      // Request made but no response received
      errorResponse = {
        message: 'No response from server',
        code: 'NO_RESPONSE',
      };
    }

    return Promise.reject(errorResponse);
  }
);

export type { ApiError, RequestConfig };
export default api;