import api from '@/lib/api';
import type {
  Contact,
  Group,
  CreateContactRequest,
  UpdateContactRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddContactToGroupRequest,
} from '@/types/phonebook';

export const contactService = {
  // Get all contacts
  async getContacts(groupId?: string): Promise<Contact[]> {
    try {
      const params = groupId ? `?groupId=${groupId}` : '';
      const response = await api.get<Contact[]>(`/api/contacts${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single contact
  async getContact(id: string): Promise<Contact> {
    try {
      const response = await api.get<Contact>(`/api/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create contact
  async createContact(data: CreateContactRequest): Promise<Contact> {
    try {
      const response = await api.post<Contact>('/api/contacts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update contact
  async updateContact(id: string, data: UpdateContactRequest): Promise<Contact> {
    try {
      const response = await api.put<Contact>(`/api/contacts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete contact
  async deleteContact(id: string): Promise<void> {
    try {
      await api.delete(`/api/contacts/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Bulk delete contacts
  async bulkDeleteContacts(ids: string[]): Promise<void> {
    try {
      await api.post('/api/contacts/bulk-delete', { ids });
    } catch (error) {
      throw error;
    }
  },
};

export const groupService = {
  // Get all groups
  async getGroups(): Promise<Group[]> {
    try {
      const response = await api.get<Group[]>('/api/groups');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single group
  async getGroup(id: string): Promise<Group> {
    try {
      const response = await api.get<Group>(`/api/groups/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get group members
  async getGroupMembers(id: string): Promise<Contact[]> {
    try {
      const response = await api.get<Contact[]>(`/api/groups/${id}/members`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create group
  async createGroup(data: CreateGroupRequest): Promise<Group> {
    try {
      const response = await api.post<Group>('/api/groups', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update group
  async updateGroup(id: string, data: UpdateGroupRequest): Promise<Group> {
    try {
      const response = await api.put<Group>(`/api/groups/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete group
  async deleteGroup(id: string): Promise<void> {
    try {
      await api.delete(`/api/groups/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Add contact to group
  async addContactToGroup(groupId: string, data: AddContactToGroupRequest): Promise<void> {
    try {
      await api.post(`/api/groups/${groupId}/addContact`, data);
    } catch (error) {
      throw error;
    }
  },

  // Remove contact from group
  async removeContactFromGroup(groupId: string, contactId: string): Promise<void> {
    try {
      await api.delete(`/api/groups/${groupId}/contacts/${contactId}`);
    } catch (error) {
      throw error;
    }
  },

  // Broadcast message to group
  async broadcastToGroup(groupId: string, message: string, instanceId: string): Promise<void> {
    try {
      await api.post(`/api/groups/${groupId}/broadcast`, {
        message,
        instanceId,
      });
    } catch (error) {
      throw error;
    }
  },
};
