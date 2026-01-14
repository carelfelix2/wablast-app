import api from '@/lib/api';

export interface Message {
  id: string;
  instanceId: string;
  to: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  createdAt: string;
}

export interface SendMessageRequest {
  instanceId: string;
  to: string;
  body: string;
}

export interface MessageStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export const messageService = {
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    try {
      const response = await api.post<Message>('/message/send', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMessages(
    instanceId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (instanceId) {
        params.append('instanceId', instanceId);
      }

      const response = await api.get<Message[]>(`/message/list?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMessageStats(): Promise<MessageStats> {
    try {
      const response = await api.get<MessageStats>('/message/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
