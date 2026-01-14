import api from '@/lib/api';

export interface Instance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  phone?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstanceRequest {
  name: string;
}

export const instanceService = {
  async getInstances(): Promise<Instance[]> {
    try {
      const response = await api.get<Instance[]>('/instance/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createInstance(data: CreateInstanceRequest): Promise<Instance> {
    try {
      const response = await api.post<Instance>('/instance/create', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async startSession(instanceId: string): Promise<{ qrCode: string }> {
    try {
      const response = await api.post<{ qrCode: string }>(
        `/instance/${instanceId}/session/start`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getInstanceStatus(instanceId: string): Promise<Instance> {
    try {
      const response = await api.get<Instance>(`/instance/${instanceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteInstance(instanceId: string): Promise<void> {
    try {
      await api.delete(`/instance/${instanceId}`);
    } catch (error) {
      throw error;
    }
  },

  async restartInstance(instanceId: string): Promise<void> {
    try {
      await api.post(`/instance/${instanceId}/restart`);
    } catch (error) {
      throw error;
    }
  },
};
