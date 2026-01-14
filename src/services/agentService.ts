import api from '@/lib/api';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  status: 'online' | 'offline' | 'busy';
  assignedConversations: number;
  maxConversations: number;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  maxConversations: number;
  keywords: string[];
}

export interface UpdateAgentRequest extends CreateAgentRequest {
  id: string;
}

export interface RoutingRule {
  id: string;
  instanceId: string;
  keyword: string;
  assignedAgentId: string;
  priority: number;
  createdAt: string;
}

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await api.get<Agent[]>('/agent/list');
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        {
          id: 'agent_1',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '628123456789',
          status: 'online',
          assignedConversations: 3,
          maxConversations: 10,
          keywords: ['support', 'help', 'issue'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'agent_2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phoneNumber: '628123456790',
          status: 'online',
          assignedConversations: 5,
          maxConversations: 10,
          keywords: ['sales', 'pricing', 'order'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    try {
      const response = await api.post<Agent>('/agent/create', data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: 'agent_' + Math.random().toString(36).substring(2, 9),
        ...data,
        status: 'offline',
        assignedConversations: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateAgent(data: UpdateAgentRequest): Promise<Agent> {
    try {
      const response = await api.put<Agent>(`/agent/${data.id}`, data);
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: data.id,
        ...data,
        status: 'offline',
        assignedConversations: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async deleteAgent(id: string): Promise<void> {
    try {
      await api.delete(`/agent/${id}`);
    } catch (error) {
      // Demo mode
      return;
    }
  },

  async getRoutingRules(instanceId: string): Promise<RoutingRule[]> {
    try {
      const response = await api.get<RoutingRule[]>(
        `/agent/routing-rules/${instanceId}`
      );
      return response.data;
    } catch (error) {
      // Demo mode
      return [
        {
          id: 'rule_1',
          instanceId,
          keyword: 'support',
          assignedAgentId: 'agent_1',
          priority: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rule_2',
          instanceId,
          keyword: 'sales',
          assignedAgentId: 'agent_2',
          priority: 2,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async createRoutingRule(
    instanceId: string,
    keyword: string,
    agentId: string,
    priority: number
  ): Promise<RoutingRule> {
    try {
      const response = await api.post<RoutingRule>('/agent/routing-rules', {
        instanceId,
        keyword,
        assignedAgentId: agentId,
        priority,
      });
      return response.data;
    } catch (error) {
      // Demo mode
      return {
        id: 'rule_' + Math.random().toString(36).substring(2, 9),
        instanceId,
        keyword,
        assignedAgentId: agentId,
        priority,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async deleteRoutingRule(id: string): Promise<void> {
    try {
      await api.delete(`/agent/routing-rules/${id}`);
    } catch (error) {
      // Demo mode
      return;
    }
  },

  async assignConversation(
    agentId: string,
    conversationId: string
  ): Promise<void> {
    try {
      await api.post(`/agent/${agentId}/assign/${conversationId}`);
    } catch (error) {
      // Demo mode
      return;
    }
  },
};
