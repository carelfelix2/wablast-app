export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  notes?: string;
  groupId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  groupName: string;
  description?: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  contactId: string;
  groupId: string;
  createdAt: string;
}

export interface CreateContactRequest {
  name: string;
  phoneNumber: string;
  notes?: string;
  groupId?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateContactRequest {
  name?: string;
  phoneNumber?: string;
  notes?: string;
  groupId?: string;
  status?: 'active' | 'inactive';
}

export interface CreateGroupRequest {
  groupName: string;
  description?: string;
  contactIds?: string[];
}

export interface UpdateGroupRequest {
  groupName?: string;
  description?: string;
}

export interface AddContactToGroupRequest {
  contactId: string;
}
