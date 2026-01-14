import api from '@/lib/api';

export interface BillingInfo {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  nextBillingDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UsageMetrics {
  messagesCount: number;
  instancesCount: number;
  costThisMonth: number;
  remainingBalance: number;
}

export const billingService = {
  async getBillingInfo(): Promise<BillingInfo> {
    try {
      const response = await api.get<BillingInfo>('/billing/info');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUsageMetrics(): Promise<UsageMetrics> {
    try {
      const response = await api.get<UsageMetrics>('/billing/usage');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async generateAPIKey(): Promise<{ apiKey: string }> {
    try {
      const response = await api.post<{ apiKey: string }>('/billing/generate-api-key');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
