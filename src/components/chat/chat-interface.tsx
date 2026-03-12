"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useMemo, useState } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { MessageBubble } from "./message-bubble";
import { InputBar } from "./input-bar";

interface ChatInterfaceProps {
  conversationId: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { apiKey, updateConversationTitle } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agentInfo, setAgentInfo] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const titleUpdatedRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { apiKey },
      }),
    [apiKey]
  );

  const { messages, status, sendMessage, error } = useChat({
    id: conversationId,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length >= 2 && !titleUpdatedRef.current) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        const content =
          firstUserMsg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("") || "";
        if (content) {
          const title =
            content.length > 40 ? content.slice(0, 40) + "..." : content;
          updateConversationTitle(conversationId, title);
          titleUpdatedRef.current = true;
        }
      }
    }
  }, [messages, conversationId, updateConversationTitle]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastAssistant = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (lastAssistant && !agentInfo) {
        setAgentInfo({ name: "Learning Engine", avatar: "🧠" });
      }
    }
  }, [messages, agentInfo]);

  const handleSend = (content: string) => {
    sendMessage({ text: content });
  };

  const getMessageText = (message: (typeof messages)[number]): string => {
    return (
      message.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("") || ""
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <header
        className="h-12 flex items-center px-4 border-b shrink-0"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        {agentInfo && (
          <div className="flex items-center gap-2">
            <span>{agentInfo.avatar}</span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {agentInfo.name}
            </span>
          </div>
        )}
        {!agentInfo && (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            🧠 New conversation
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-5xl mb-4">🧠</span>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome to Learning Engine
            </h2>
            <p
              className="text-sm max-w-md"
              style={{ color: "var(--text-secondary)" }}
            >
              Ask me anything. I&apos;ll route your question to the best
              specialist agent — Math, Physics, Code, or General knowledge.
            </p>
            <div className="flex gap-2 mt-6 flex-wrap justify-center">
              {[
                "Teach me about derivatives",
                "Why do satellites orbit?",
                "Explain recursion in Python",
                "What caused World War I?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={!apiKey}
                  className="px-3 py-2 rounded-xl text-xs transition-colors border cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={getMessageText(message)}
            agentName={
              message.role === "assistant" ? agentInfo?.name : undefined
            }
            agentAvatar={
              message.role === "assistant" ? agentInfo?.avatar : undefined
            }
          />
        ))}

        {isLoading &&
          (messages.length === 0 ||
            messages[messages.length - 1]?.role === "user") && (
            <MessageBubble
              role="assistant"
              content=""
              agentName={agentInfo?.name || "Thinking..."}
              agentAvatar={agentInfo?.avatar || "🧠"}
              isStreaming
            />
          )}

        {error && (
          <div
            className="max-w-3xl mx-auto p-3 rounded-lg text-sm mb-4"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "var(--danger)",
            }}
          >
            <strong>Error:</strong>{" "}
            {error.message || "Something went wrong. Check your API key."}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <InputBar onSend={handleSend} isLoading={isLoading} disabled={!apiKey} />
    </div>
  );
}
