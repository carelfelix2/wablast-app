import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contact, Group } from '@/types/phonebook';

export interface PhonebookStore {
  contacts: Contact[];
  groups: Group[];
  selectedGroup: string | null;
  
  // Contact actions
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  // Group actions
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  // Filter actions
  setSelectedGroup: (groupId: string | null) => void;
  getContactsByGroup: (groupId: string | null) => Contact[];
  
  // Utility actions
  clearStore: () => void;
}

export const usePhonebookStore = create<PhonebookStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      groups: [],
      selectedGroup: null,

      // Contact actions
      setContacts: (contacts) => set({ contacts }),
      
      addContact: (contact) =>
        set((state) => ({
          contacts: [contact, ...state.contacts],
        })),
      
      updateContact: (id, updatedContact) =>
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? { ...contact, ...updatedContact } : contact
          ),
        })),
      
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        })),

      // Group actions
      setGroups: (groups) => set({ groups }),
      
      addGroup: (group) =>
        set((state) => ({
          groups: [group, ...state.groups],
        })),
      
      updateGroup: (id, updatedGroup) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, ...updatedGroup } : group
          ),
        })),
      
      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
          // Clear selectedGroup if deleted group is selected
          selectedGroup: state.selectedGroup === id ? null : state.selectedGroup,
          // Remove groupId from contacts in deleted group
          contacts: state.contacts.map((contact) =>
            contact.groupId === id ? { ...contact, groupId: undefined } : contact
          ),
        })),

      // Filter actions
      setSelectedGroup: (groupId) => set({ selectedGroup: groupId }),
      
      getContactsByGroup: (groupId) => {
        const state = get();
        if (!groupId) return state.contacts;
        return state.contacts.filter((contact) => contact.groupId === groupId);
      },

      // Utility actions
      clearStore: () =>
        set({
          contacts: [],
          groups: [],
          selectedGroup: null,
        }),
    }),
    {
      name: 'phonebook-storage',
    }
  )
);
