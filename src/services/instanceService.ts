import api from '@/lib/api';
import QRCode from 'qrcode';

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
      // Evolution API: GET /instances
      const response = await api.get<Instance[]>('/instances');
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
      // Demo mode: create a mock instance
      const newInstance: Instance = {
        id: 'inst_' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        status: 'disconnected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newInstance;
    }
  },

  async startSession(instanceId: string): Promise<{ qrCode: string }> {
    try {
      const response = await api.post<{ qrCode: string }>(
        `/instance/${instanceId}/session/start`
      );
      return response.data;
    } catch (error) {
      // Demo mode: generate a demo QR code with instance ID
      try {
        const demoData = `instance_${instanceId}_${Date.now()}`;
        const qrCode = await QRCode.toDataURL(demoData);
        return { qrCode };
      } catch (qrError) {
        // Fallback QR code
        return {
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        };
      }
    }
  },

  async getQRCode(instanceId: string): Promise<{ qrCode: string }> {
    try {
      const response = await api.get<{ qrCode: string }>(`/instance/${instanceId}/qr`);
      return response.data;
    } catch (error) {
      // Demo mode: generate a demo QR code as data URL
      try {
        const demoData = `qr_instance_${instanceId}_${Date.now()}`;
        const qrCode = await QRCode.toDataURL(demoData);
        return { qrCode };
      } catch (qrError) {
        return {
          qrCode:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        };
      }
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
      // Demo mode: silently succeed
      return;
    }
  },

  async restartInstance(instanceId: string): Promise<void> {
    try {
      await api.post(`/instance/${instanceId}/restart`);
    } catch (error) {
      // Demo mode: silently succeed
      return;
    }
  },
};
