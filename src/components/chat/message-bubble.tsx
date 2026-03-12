"use client";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  agentName?: string;
  agentAvatar?: string;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  agentName,
  agentAvatar,
  isStreaming,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-2xl px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4 max-w-3xl">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: "var(--bg-hover)" }}
      >
        {agentAvatar || "🧠"}
      </div>
      <div className="flex-1 min-w-0">
        {agentName && (
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            {agentName}
          </p>
        )}
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap break-words"
          style={{ color: "var(--text-primary)" }}
        >
          {content}
          {isStreaming && !content && (
            <span className="inline-flex gap-1 ml-1">
              <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--text-muted)" }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--text-muted)" }} />
              <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--text-muted)" }} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
