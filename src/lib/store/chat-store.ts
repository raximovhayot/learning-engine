import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Conversation } from "@/lib/types";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  apiKey: string;
  user: AuthUser | null;
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  setApiKey: (key: string) => void;
  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | undefined;

  loadConversations: () => Promise<void>;
  createServerConversation: () => Promise<string>;
  deleteServerConversation: (id: string) => Promise<void>;
  updateServerConversationTitle: (id: string, title: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      apiKey: "",
      user: null,
      hydrated: false,

      setHydrated: (v: boolean) => set({ hydrated: v }),
      setUser: (user: AuthUser | null) => set({ user }),

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

      loadConversations: async () => {
        try {
          const res = await fetch("/api/conversations");
          if (!res.ok) return;
          const data = await res.json();
          const mapped: Conversation[] = data.map(
            (c: { id: string; title: string; lastAgentId: string | null; createdAt: string; updatedAt: string }) => ({
              id: c.id,
              title: c.title,
              agentId: c.lastAgentId,
              messages: [],
              createdAt: new Date(c.createdAt).getTime(),
              updatedAt: new Date(c.updatedAt).getTime(),
            })
          );
          set({ conversations: mapped });
        } catch {
          // Fall back to local conversations
        }
      },

      createServerConversation: async () => {
        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (!res.ok) return get().createConversation();
          const conv = await res.json();
          const mapped: Conversation = {
            id: conv.id,
            title: conv.title,
            agentId: null,
            messages: [],
            createdAt: new Date(conv.createdAt).getTime(),
            updatedAt: new Date(conv.updatedAt).getTime(),
          };
          set((state) => ({
            conversations: [mapped, ...state.conversations],
            activeConversationId: conv.id,
          }));
          return conv.id;
        } catch {
          return get().createConversation();
        }
      },

      deleteServerConversation: async (id: string) => {
        get().deleteConversation(id);
        try {
          await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        } catch {
          // Already removed from local state
        }
      },

      updateServerConversationTitle: async (id: string, title: string) => {
        get().updateConversationTitle(id, title);
        try {
          await fetch(`/api/conversations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
        } catch {
          // Already updated in local state
        }
      },
    }),
    {
      name: "learning-engine-store",
      partialize: (state) => ({
        conversations: state.conversations,
        apiKey: state.apiKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
