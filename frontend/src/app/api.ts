import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// 1. Define your Spring Boot backend base URL
const BASE_URL = 'http://localhost:8080/api';

// 2. Create the Axios instance with default configurations
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 3. Request Interceptor (JWT Authentication)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get JWT token from localStorage and add to Authorization header
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 4. Response Interceptor (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Centralized logging of API errors to help you debug during development
    console.error('API Error Response:', error.response?.data || error.message);

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn('Unauthorized! Please login again.');
          // Clear auth data and redirect to login
          ['token', 'username', 'role', 'access', 'permissions'].forEach(k => localStorage.removeItem(k));
          window.location.href = '/';
          break;
        case 403:
          console.warn('Forbidden! You do not have the required role.');
          break;
        case 500:
          console.error('Internal Server Error from Spring Boot.');
          break;
      }
    }

    return Promise.reject(error);
  }
);

// 5. Helper function for making API requests (used by services)
export async function apiRequest<T>(
  url: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const headers: any = { ...(options.headers as any) };

  // Attach JWT token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData - don't set Content-Type, let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  if (isFormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await api.request<T>({
      url,
      method: options.method || 'GET',
      data: isFormData ? options.body : options.body ? JSON.parse(options.body as string) : undefined,
      headers,
      params: options.params,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

export default api;