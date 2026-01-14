import api from '@/lib/api';

export interface MessageTemplate {
  id: string;
  instanceId: string;
  name: string;
  category: string;
  content: string;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  instanceId: string;
  name: string;
  category: string;
  content: string;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {
  id: string;
}

export const templateService = {
  async getTemplates(instanceId: string): Promise<MessageTemplate[]> {
    try {
      const response = await api.get<MessageTemplate[]>(`/template/${instanceId}`);
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        {
          id: 'tpl_1',
          instanceId,
          name: 'Welcome Message',
          category: 'greeting',
          content: 'Welcome to our service! We\'re glad to have you.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tpl_2',
          instanceId,
          name: 'Order Confirmation',
          category: 'order',
          content: 'Thank you for your order #{{orderId}}. Expected delivery: {{deliveryDate}}',
          variables: ['orderId', 'deliveryDate'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tpl_3',
          instanceId,
          name: 'Support Ticket',
          category: 'support',
          content: 'Your support ticket #{{ticketId}} has been created. We\'ll respond within 24 hours.',
          variables: ['ticketId'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async createTemplate(data: CreateTemplateRequest): Promise<MessageTemplate> {
    try {
      const response = await api.post<MessageTemplate>('/template/create', data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: 'tpl_' + Math.random().toString(36).substring(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateTemplate(data: UpdateTemplateRequest): Promise<MessageTemplate> {
    try {
      const response = await api.put<MessageTemplate>(`/template/${data.id}`, data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: data.id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      await api.delete(`/template/${id}`);
    } catch (error) {
      // Demo mode
      return;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/template/categories');
      return response.data;
    } catch (error) {
      // Demo mode
      return ['greeting', 'order', 'support', 'promotional', 'notification'];
    }
  },
};
