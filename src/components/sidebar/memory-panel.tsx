"use client";

import { useState, useEffect, useCallback } from "react";
import { useChatStore } from "@/lib/store/chat-store";

interface Memory {
  id: string;
  type: string;
  content: string;
  confidence: number;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  fact: "📝",
  preference: "💡",
  goal: "🎯",
  skill_level: "📊",
  episodic: "💭",
};

export function MemoryPanel() {
  const { user } = useChatStore();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchMemories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (expanded && user) {
      fetchMemories();
    }
  }, [expanded, user, fetchMemories]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAll = async () => {
    if (!confirm("Delete all memories? This cannot be undone.")) return;
    await fetch("/api/memories", { method: "DELETE" });
    setMemories([]);
  };

  if (!user) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2 py-1 text-xs font-medium uppercase tracking-wider cursor-pointer"
        style={{ color: "var(--text-muted)" }}
      >
        <span>{expanded ? "▾" : "▸"}</span>
        <span>Memories</span>
        {memories.length > 0 && (
          <span
            className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--accent)",
              color: "white",
              fontSize: "0.65rem",
            }}
          >
            {memories.length}
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-1">
          {loading && (
            <p
              className="px-2 py-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Loading memories...
            </p>
          )}

          {!loading && memories.length === 0 && (
            <p
              className="px-2 py-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              No memories yet. Chat to build memories!
            </p>
          )}

          {memories.map((memory) => (
            <div
              key={memory.id}
              className="group flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-xs relative"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="shrink-0 mt-0.5">
                {TYPE_ICONS[memory.type] || "📝"}
              </span>
              <span className="flex-1 leading-relaxed">{memory.content}</span>
              <button
                onClick={() => handleDelete(memory.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded transition-opacity cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                title="Delete memory"
              >
                ✕
              </button>
            </div>
          ))}

          {memories.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full px-2 py-1.5 mt-1 text-xs rounded-lg transition-colors cursor-pointer"
              style={{ color: "var(--danger)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Clear all memories
            </button>
          )}

          {!loading && (
            <button
              onClick={fetchMemories}
              className="w-full px-2 py-1 text-xs rounded-lg transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              ↻ Refresh
            </button>
          )}
        </div>
      )}
    </div>
  );
}
