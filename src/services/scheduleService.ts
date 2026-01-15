import api from '@/lib/api';

export interface ScheduledMessage {
  id: string;
  instanceId: string;
  recipients: string[];
  message: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  instanceId: string;
  recipients: string[];
  message: string;
  scheduledAt: string;
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {
  id: string;
}

export const scheduleService = {
  async getScheduledMessages(instanceId: string): Promise<ScheduledMessage[]> {
    try {
      const response = await api.get<ScheduledMessage[]>(`/schedule/${instanceId}`);
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        {
          id: 'sch_1',
          instanceId,
          recipients: ['628123456789'],
          message: 'Reminder: Your appointment is tomorrow at 2 PM',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async createSchedule(data: CreateScheduleRequest): Promise<ScheduledMessage> {
    try {
      const response = await api.post<ScheduledMessage>('/schedule/create', data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: 'sch_' + Math.random().toString(36).substring(2, 9),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateSchedule(data: UpdateScheduleRequest): Promise<ScheduledMessage> {
    try {
      const response = await api.put<ScheduledMessage>(`/schedule/${data.id}`, data);
      return response.data;
    } catch (error) {
      // Demo mode
      const { id, ...rest } = data;
      return {
        id,
        ...rest,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async cancelSchedule(id: string): Promise<void> {
    try {
      await api.post(`/schedule/${id}/cancel`);
    } catch (error) {
      // Demo mode
      return;
    }
  },

  async deleteSchedule(id: string): Promise<void> {
    try {
      await api.delete(`/schedule/${id}`);
    } catch (error) {
      // Demo mode
      return;
    }
  },
};
