"use client";

import { useChatStore } from "@/lib/store/chat-store";
import { getAgentList } from "@/lib/ai/agents";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();
  const {
    conversations,
    activeConversationId,
    createConversation,
    setActiveConversation,
    deleteConversation,
    apiKey,
  } = useChatStore();
  const agents = getAgentList();

  const handleNewChat = () => {
    const id = createConversation();
    router.push(`/chat/${id}`);
  };

  const handleSelectChat = (id: string) => {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧠</span>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Learning Engine
          </h1>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{
            background: "var(--accent)",
            color: "white",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-3">
          <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>
            Chats
          </p>
          {conversations.length === 0 && (
            <p className="px-2 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div key={conv.id} className="group relative">
              <button
                onClick={() => handleSelectChat(conv.id)}
                className="w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer"
                style={{
                  background: activeConversationId === conv.id ? "var(--bg-hover)" : "transparent",
                  color: activeConversationId === conv.id ? "var(--text-primary)" : "var(--text-secondary)",
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
                <span className="text-xs shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(conv.updatedAt)}
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-xs transition-opacity cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>
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
              <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                {agent.domain}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => router.push("/settings")}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>⚙️</span>
          <span>Settings</span>
          {!apiKey && (
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
              style={{ background: "var(--warning)", color: "black" }}>
              Key needed
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
