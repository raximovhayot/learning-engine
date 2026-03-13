"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useChatStore } from "@/lib/store/chat-store";

export default function Home() {
  const router = useRouter();
  const { createConversation, createServerConversation, user, hydrated } =
    useChatStore();

  const handleNewChat = async () => {
    if (user) {
      const id = await createServerConversation();
      router.push(`/chat/${id}`);
    } else {
      const id = createConversation();
      router.push(`/chat/${id}`);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <span className="text-6xl mb-6">🧠</span>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Learning Engine
        </h1>
        <p
          className="text-base mb-8 max-w-md text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          AI-powered interactive learning with multi-agent orchestration. Each
          question is routed to a specialist: Math, Physics, Code, or General.
        </p>
        <button
          onClick={handleNewChat}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          style={{ background: "var(--accent)", color: "white" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
        >
          Start Learning →
        </button>
        {hydrated && !user && (
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <button
              onClick={() => router.push("/login")}
              className="underline cursor-pointer"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </button>{" "}
            to save your API key and conversation history.
          </p>
        )}
      </main>
    </div>
  );
}
