import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from './useUserStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.wablast.net';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useUserStore.getState();
    config.headers = config.headers || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (API_KEY) {
      config.headers.Authorization = `Bearer ${API_KEY}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useUserStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Generic request helper
export async function request<T = any>(method: 'get'|'post'|'put'|'patch'|'delete', url: string, data?: any, params?: any) {
  const res = await api.request<T>({ method, url, data, params });
  return res.data as T;
}

// Evolution API helpers
export const getInstanceStatus = (instanceId: string) => request('get', `/instance/${instanceId}/status`);
export const createInstance = (payload: any) => request('post', `/instance`, payload);
export const deleteInstance = (instanceId: string) => request('delete', `/instance/${instanceId}`);
export const getQRCode = (instanceId: string) => request<{ qrCode: string }>('get', `/instance/${instanceId}/qr`);
export const getMessages = (instanceId: string, params?: any) => request('get', `/instance/${instanceId}/messages`, undefined, params);
export const sendMessage = (instanceId: string, payload: any) => request('post', `/instance/${instanceId}/messages`, payload);
export const uploadMedia = (instanceId: string, formData: FormData) => request('post', `/instance/${instanceId}/media`, formData);
export const getContacts = (instanceId: string) => request('get', `/instance/${instanceId}/contacts`);
export const createGroup = (instanceId: string, payload: any) => request('post', `/instance/${instanceId}/groups`, payload);
export const registerWebhook = (instanceId: string, payload: any) => request('post', `/instance/${instanceId}/webhooks`, payload);
export const createAutoReply = (instanceId: string, payload: any) => request('post', `/instance/${instanceId}/auto-reply`, payload);
export const scheduleMessage = (instanceId: string, payload: any) => request('post', `/instance/${instanceId}/schedule`, payload);
