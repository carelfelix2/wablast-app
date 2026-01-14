import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MessageHistory {
  id: string;
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: Date;
  instanceId: string;
}

export interface MessageStore {
  messages: MessageHistory[];
  addMessage: (message: MessageHistory) => void;
  updateMessageStatus: (id: string, status: 'sent' | 'failed' | 'pending') => void;
  clearMessages: () => void;
  getMessagesByInstance: (instanceId: string) => MessageHistory[];
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: (message: MessageHistory) =>
        set((state) => ({
          messages: [message, ...state.messages],
        })),
      updateMessageStatus: (id: string, status: 'sent' | 'failed' | 'pending') =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, status } : msg
          ),
        })),
      clearMessages: () => set({ messages: [] }),
      getMessagesByInstance: (instanceId: string) => {
        const state = get();
        return state.messages.filter((msg) => msg.instanceId === instanceId);
      },
    }),
    {
      name: 'message-storage',
    }
  )
);
