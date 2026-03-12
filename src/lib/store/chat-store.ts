import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Conversation } from "@/lib/types";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  apiKey: string;

  setApiKey: (key: string) => void;
  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      apiKey: "",

      setApiKey: (key: string) => set({ apiKey: key }),

      createConversation: () => {
        const id = nanoid();
        const conversation: Conversation = {
          id,
          title: "New Chat",
          agentId: null,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id: string | null) =>
        set({ activeConversationId: id }),

      updateConversationTitle: (id: string, title: string) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        })),

      deleteConversation: (id: string) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id
              ? null
              : state.activeConversationId,
        })),

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find(
          (c) => c.id === state.activeConversationId
        );
      },
    }),
    {
      name: "learning-engine-store",
      partialize: (state) => ({
        conversations: state.conversations,
        apiKey: state.apiKey,
      }),
    }
  )
);
