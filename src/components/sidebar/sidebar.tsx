"use client";

import { useChatStore } from "@/lib/store/chat-store";
import { getAgentList } from "@/lib/ai/agents";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MemoryPanel } from "./memory-panel";

export function Sidebar() {
  const router = useRouter();
  const {
    conversations,
    activeConversationId,
    createConversation,
    setActiveConversation,
    deleteConversation,
    apiKey,
    user,
    setUser,
    loadConversations,
    createServerConversation,
    deleteServerConversation,
  } = useChatStore();
  const agents = getAgentList();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            name: authUser.user_metadata?.name,
          });
          loadConversations();
        } else {
          setUser(null);
        }
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name,
          });
          loadConversations();
        } else {
          setUser(null);
        }
      });
      subscription = data.subscription;
    } catch {
      setUser(null);
    }

    return () => subscription?.unsubscribe();
  }, [setUser, loadConversations]);

  const handleNewChat = async () => {
    if (user) {
      const id = await createServerConversation();
      router.push(`/chat/${id}`);
    } else {
      const id = createConversation();
      router.push(`/chat/${id}`);
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  };

  const handleDeleteChat = (id: string) => {
    if (user) {
      deleteServerConversation(id);
    } else {
      deleteConversation(id);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col border-r"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧠</span>
          <h1
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Learning Engine
          </h1>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{ background: "var(--accent)", color: "white" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-3">
          <p
            className="px-2 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Chats
          </p>
          {conversations.length === 0 && (
            <p
              className="px-2 py-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div key={conv.id} className="group relative">
              <button
                onClick={() => handleSelectChat(conv.id)}
                className="w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer"
                style={{
                  background:
                    activeConversationId === conv.id
                      ? "var(--bg-hover)"
                      : "transparent",
                  color:
                    activeConversationId === conv.id
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (activeConversationId !== conv.id) {
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeConversationId !== conv.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <span
                  className="text-xs shrink-0 ml-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatRelativeTime(conv.updatedAt)}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(conv.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-xs transition-opacity cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <MemoryPanel />

        <div className="mb-3">
          <p
            className="px-2 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Agents
          </p>
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{agent.avatar}</span>
              <span>{agent.name}</span>
              <span
                className="text-xs ml-auto"
                style={{ color: "var(--text-muted)" }}
              >
                {agent.domain}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-3 border-t flex flex-col gap-1"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.push("/learn")}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span>📚</span>
          <span>Learn</span>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span>⚙️</span>
          <span>Settings</span>
          {!apiKey && !user && (
            <span
              className="ml-auto text-xs px-1.5 py-0.5 rounded"
              style={{ background: "var(--warning)", color: "black" }}
            >
              Key needed
            </span>
          )}
        </button>
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span>👤</span>
            <span className="truncate">{user.name || user.email}</span>
            <span
              className="ml-auto text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Sign out
            </span>
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span>🔑</span>
            <span>Sign in</span>
          </button>
        )}
      </div>
    </aside>
  );
}
