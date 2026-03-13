import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { getAgent } from "@/lib/ai/agents";
import { routeToAgent } from "@/lib/ai/orchestrator";
import { createClient } from "@/lib/supabase/server";
import { getRelevantMemories } from "@/lib/memory/retriever";
import { extractMemories } from "@/lib/memory/extractor";
import { storeMemories } from "@/lib/memory/store";
import { visualizationTools } from "@/lib/ai/tools";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

// 20 requests per minute per IP (or user ID when authenticated)
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  // Rate limiting – keyed on user IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, remaining, resetMs } = rateLimit(
    ip,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before sending another message.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(resetMs / 1000)),
        },
      }
    );
  }

  // Validate that the server-side API key is configured
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Service is not configured. Please set the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, agentId: requestedAgentId, conversationId } =
    await req.json();

  // Add remaining rate limit info to response headers
  const responseHeaders: Record<string, string> = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(remaining),
  };

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch {
    // Auth failure is non-fatal; continue without user context
  }

  const google = createProvider();
  const modelMessages = await convertToModelMessages(messages);

  const lastUserMessage = modelMessages
    .filter((m) => m.role === "user")
    .pop();
  const lastUserText =
    lastUserMessage && typeof lastUserMessage.content === "string"
      ? lastUserMessage.content
      : lastUserMessage &&
          Array.isArray(lastUserMessage.content) &&
          lastUserMessage.content[0]?.type === "text"
        ? lastUserMessage.content[0].text
        : "";

  let agentId = requestedAgentId;
  if (!agentId && lastUserText) {
    agentId = await routeToAgent(lastUserText);
  }
  agentId = agentId || "general";

  const agent = getAgent(agentId);

  let systemPrompt = agent.systemPrompt;
  if (userId && lastUserText) {
    try {
      const memoryContext = await getRelevantMemories(userId, lastUserText);
      if (memoryContext) {
        systemPrompt = `${agent.systemPrompt}\n\n${memoryContext}\n\nUse these memories to personalize your response. Reference what you know about the user when relevant, but don't explicitly list memories.`;
      }
    } catch {
      // Memory retrieval failed silently
    }
  }

  const result = streamText({
    model: google(agent.model),
    system: systemPrompt,
    messages: modelMessages,
    temperature: agent.temperature,
    maxOutputTokens: 4096,
    tools: visualizationTools,
    stopWhen: stepCountIs(3),
    onFinish: async ({ text: assistantText }) => {
      if (userId && lastUserText && assistantText) {
        try {
          const extracted = await extractMemories(lastUserText, assistantText);
          if (extracted.length > 0) {
            await storeMemories(userId, extracted, conversationId || null);
          }
        } catch {
          // Memory extraction failed silently
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    headers: responseHeaders,
    messageMetadata: ({ part }) => {
      if (part.type === "text-start" || part.type === "text-end") {
        return {
          agentId,
          agentName: agent.name,
          agentAvatar: agent.avatar,
          agentDomain: agent.domain,
        };
      }
      return undefined;
    },
  });
}
