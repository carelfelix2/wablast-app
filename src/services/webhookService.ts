import api from '@/lib/api';

export interface WebhookConfig {
  id: string;
  instanceId: string;
  url: string;
  events: string[];
  isActive: boolean;
  failureCount: number;
  lastEventAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  status: 'success' | 'failed';
  statusCode?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface RegisterWebhookRequest {
  instanceId: string;
  url: string;
  events: string[];
}

export const webhookService = {
  async getWebhooks(instanceId: string): Promise<WebhookConfig[]> {
    try {
      const response = await api.get<WebhookConfig[]>(`/webhook/${instanceId}`);
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        {
          id: 'wh_1',
          instanceId,
          url: 'https://yourapp.com/webhook',
          events: ['message.received', 'message.sent'],
          isActive: true,
          failureCount: 0,
          lastEventAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async registerWebhook(data: RegisterWebhookRequest): Promise<WebhookConfig> {
    try {
      const response = await api.post<WebhookConfig>('/webhook/register', data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: 'wh_' + Math.random().toString(36).substring(2, 9),
        ...data,
        isActive: true,
        failureCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateWebhook(
    id: string,
    data: Partial<RegisterWebhookRequest>
  ): Promise<WebhookConfig> {
    try {
      const response = await api.put<WebhookConfig>(`/webhook/${id}`, data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id,
        instanceId: data.instanceId || '',
        url: data.url || '',
        events: data.events || [],
        isActive: true,
        failureCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async deleteWebhook(id: string): Promise<void> {
    try {
      await api.delete(`/webhook/${id}`);
    } catch (error) {
      // Demo mode
      return;
    }
  },

  async toggleWebhook(id: string, isActive: boolean): Promise<WebhookConfig> {
    try {
      const response = await api.patch<WebhookConfig>(`/webhook/${id}/toggle`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id,
        instanceId: '',
        url: '',
        events: [],
        isActive,
        failureCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async testWebhook(id: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    try {
      const response = await api.post<{ success: boolean; statusCode?: number; error?: string }>(
        `/webhook/${id}/test`
      );
      return response.data;
    } catch (error: any) {
      // Demo mode
      return { success: false, error: 'Demo mode - webhook test simulated' };
    }
  },

  async getWebhookLogs(webhookId: string, limit: number = 50): Promise<WebhookLog[]> {
    try {
      const response = await api.get<WebhookLog[]>(`/webhook/${webhookId}/logs?limit=${limit}`);
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        {
          id: 'log_1',
          webhookId,
          event: 'message.received',
          payload: {
            from: '628123456789',
            message: 'Hello!',
            timestamp: new Date().toISOString(),
          },
          status: 'success',
          statusCode: 200,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getAvailableEvents(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/webhook/events');
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        'message.received',
        'message.sent',
        'message.read',
        'instance.connected',
        'instance.disconnected',
        'contact.added',
        'group.created',
      ];
    }
  },
};
