"use client";

import { MarkdownRenderer } from "./markdown-renderer";
import { VisualizationRenderer, type VisualizationType, type VisualizationParams } from "@/components/visualizations";

interface MessagePart {
  type: string;
  text?: string;
  // ToolUIPart shape (type is `tool-${toolName}`)
  state?: string;
  input?: unknown;
  output?: unknown;
}

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  parts?: MessagePart[];
  content: string;
  agentName?: string;
  agentAvatar?: string;
  agentDomain?: string;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  parts,
  content,
  agentName,
  agentAvatar,
  agentDomain,
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

  // Collect visualization tool results from parts
  const vizParts = (parts || []).filter(
    (p) =>
      p.type === "tool-visualize" &&
      p.state === "output-available" &&
      p.output != null
  );

  return (
    <div className="flex gap-3 mb-4 max-w-3xl">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: "var(--bg-hover)" }}
      >
        {agentAvatar || "🧠"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {agentName && (
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {agentName}
            </span>
          )}
          {agentDomain && (
            <span className="agent-badge">{agentDomain}</span>
          )}
        </div>
        <div
          className="text-sm leading-relaxed break-words"
          style={{ color: "var(--text-primary)" }}
        >
          {content ? (
            <MarkdownRenderer content={content} />
          ) : isStreaming ? (
            <span className="inline-flex gap-1 ml-1">
              <span
                className="typing-dot w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--text-muted)" }}
              />
              <span
                className="typing-dot w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--text-muted)" }}
              />
              <span
                className="typing-dot w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--text-muted)" }}
              />
            </span>
          ) : null}
        </div>

        {/* Render visualization tool results */}
        {vizParts.map((p, i) => {
          const result = p.output as { type: VisualizationType; params: VisualizationParams } | null;
          if (!result?.type) return null;
          return (
            <div key={i} className="viz-wrapper mt-3">
              <VisualizationRenderer type={result.type} params={result.params || {}} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
