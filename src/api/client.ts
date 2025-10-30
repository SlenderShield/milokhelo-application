import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, AUTH_CONFIG } from '@/src/config/apiConfig';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth
});

// Token management utilities
export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_CONFIG.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_CONFIG.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_CONFIG.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_CONFIG.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeRefreshToken();
  },
};

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await TokenManager.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (__DEV__) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and refresh tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (__DEV__) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await TokenManager.getRefreshToken();

        if (refreshToken) {
          // Attempt to refresh the token
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          await TokenManager.setToken(accessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await TokenManager.clearAll();
        // You can emit an event here to redirect to login screen
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    // Parse error message
    const errorMessage =
      (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';

    // Create formatted error object
    const formattedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

// Helper function to handle API calls with error formatting
export async function apiCall<T>(apiFunction: () => Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'API call failed');
  }
}

export default apiClient;
