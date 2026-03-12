export interface Agent {
  id: string;
  name: string;
  avatar: string;
  domain: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
}

export interface Conversation {
  id: string;
  title: string;
  agentId: string | null;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  createdAt: number;
}

export interface ApiKeyConfig {
  provider: "google";
  key: string;
  model: string;
}
