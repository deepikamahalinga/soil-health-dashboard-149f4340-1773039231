// soilreport.api.ts

import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export interface SoilReport {
  id: string;
  state: string;
  // Add other fields as needed
}

export interface SoilReportFilters {
  state?: string;
  // Add other filter fields
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// API Client Class
export class SoilReportApi {
  private client: AxiosInstance;
  private baseUrl: string;
  private retryAttempts = 3;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;
        
        if (!originalRequest || originalRequest._retry) {
          return Promise.reject(this.handleError(error));
        }

        if (error.response?.status === 429 && originalRequest.retryCount < this.retryAttempts) {
          originalRequest._retry = true;
          originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
          
          // Exponential backoff
          const backoff = Math.pow(2, originalRequest.retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoff));
          
          return this.client(originalRequest);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    return {
      message: error.response?.data?.message || 'An unexpected error occurred',
      code: error.response?.status?.toString(),
      details: error.response?.data
    };
  }

  async getAllSoilReports(
    filters?: SoilReportFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<SoilReport[]>> {
    try {
      const params = {
        ...filters,
        ...pagination,
        ...sort
      };
      
      const response = await this.client.get('/soilreports', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  async getSoilReportById(id: string): Promise<ApiResponse<SoilReport>> {
    try {
      const response = await this.client.get(`/soilreports/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  async createSoilReport(data: Omit<SoilReport, 'id'>): Promise<ApiResponse<SoilReport>> {
    try {
      const response = await this.client.post('/soilreports', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  async updateSoilReport(
    id: string,
    data: Partial<Omit<SoilReport, 'id'>>
  ): Promise<ApiResponse<SoilReport>> {
    try {
      const response = await this.client.put(`/soilreports/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  async deleteSoilReport(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete(`/soilreports/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }
}

// Export singleton instance
export const soilReportApi = new SoilReportApi();

// Export hooks/utilities for loading states (if using React)
export const useApiLoading = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const withLoading = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, withLoading };
};