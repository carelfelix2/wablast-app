import api from '@/lib/api';

export interface AutoReplyRule {
  id: string;
  instanceId: string;
  keyword: string;
  matchType: 'exact' | 'contains' | 'regex';
  replyMessage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutoReplyRequest {
  instanceId: string;
  keyword: string;
  matchType: 'exact' | 'contains' | 'regex';
  replyMessage: string;
}

export interface UpdateAutoReplyRequest extends CreateAutoReplyRequest {
  id: string;
}

export const autoReplyService = {
  async getAutoReplies(instanceId: string): Promise<AutoReplyRule[]> {
    try {
      const response = await api.get<AutoReplyRule[]>(`/auto-reply/${instanceId}`);
      return response.data;
    } catch (error) {
      // Demo mode: return mock data
      return [
        {
          id: 'ar_1',
          instanceId,
          keyword: 'hello',
          matchType: 'contains',
          replyMessage: 'Hi! Thanks for reaching out. We\'ll get back to you soon.',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'ar_2',
          instanceId,
          keyword: 'price',
          matchType: 'contains',
          replyMessage: 'Our pricing starts at Rp 100,000. Contact sales for more details.',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async createAutoReply(data: CreateAutoReplyRequest): Promise<AutoReplyRule> {
    try {
      const response = await api.post<AutoReplyRule>('/auto-reply/create', data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: 'ar_' + Math.random().toString(36).substring(2, 9),
        ...data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateAutoReply(data: UpdateAutoReplyRequest): Promise<AutoReplyRule> {
    try {
      const response = await api.put<AutoReplyRule>(`/auto-reply/${data.id}`, data);
      return response.data;
    } catch (error) {
      // Demo mode
      const { id, ...rest } = data;
      return {
        id,
        ...rest,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async deleteAutoReply(id: string): Promise<void> {
    try {
      await api.delete(`/auto-reply/${id}`);
    } catch (error) {
      // Demo mode: silently succeed
      return;
    }
  },

  async toggleAutoReply(id: string, isActive: boolean): Promise<AutoReplyRule> {
    try {
      const response = await api.patch<AutoReplyRule>(`/auto-reply/${id}/toggle`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      // Demo mode: return mock updated data
      return {
        id,
        instanceId: '',
        keyword: '',
        matchType: 'exact',
        replyMessage: '',
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },
};
