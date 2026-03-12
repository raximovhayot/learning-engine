"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useChatStore } from "@/lib/store/chat-store";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { conversations, setActiveConversation, apiKey } = useChatStore();

  useEffect(() => {
    const exists = conversations.find((c) => c.id === id);
    if (!exists) {
      router.push("/");
      return;
    }
    setActiveConversation(id);
  }, [id, conversations, setActiveConversation, router]);

  useEffect(() => {
    if (!apiKey) {
      router.push("/settings");
    }
  }, [apiKey, router]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatInterface conversationId={id} />
    </div>
  );
}
