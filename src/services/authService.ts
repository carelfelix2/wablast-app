import api from '@/lib/api';
import { setAuthToken } from '@/lib/auth';
import { useUserStore } from '@/lib/useUserStore';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      const { token, user } = response.data;

      // Save token to cookies and localStorage
      setAuthToken(token);

      // Update Zustand store
      useUserStore.getState().setToken(token);
      useUserStore.getState().setUser({
        ...user,
        apiKey: '',
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      // Call logout endpoint if backend requires
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      useUserStore.getState().logout();
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
