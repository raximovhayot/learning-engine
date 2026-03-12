import { streamText, convertToModelMessages } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { getAgent } from "@/lib/ai/agents";
import { routeToAgent } from "@/lib/ai/orchestrator";
import { createClient } from "@/lib/supabase/server";
import { getUserApiKey } from "@/lib/db/queries";
import { getRelevantMemories } from "@/lib/memory/retriever";
import { extractMemories } from "@/lib/memory/extractor";
import { storeMemories } from "@/lib/memory/store";

export async function POST(req: Request) {
  const {
    messages,
    apiKey: clientApiKey,
    agentId: requestedAgentId,
    conversationId,
  } = await req.json();

  let resolvedApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  let userId: string | null = null;

  if (!resolvedApiKey) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const serverKey = await getUserApiKey(user.id);
      if (serverKey) resolvedApiKey = serverKey;
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) userId = user.id;
  }

  if (!resolvedApiKey && !clientApiKey) {
    return new Response(
      JSON.stringify({
        error:
          "No API key provided. Add your Google AI Studio key in settings.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const effectiveKey = resolvedApiKey || clientApiKey;
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
    agentId = await routeToAgent(lastUserText, effectiveKey);
  }
  agentId = agentId || "general";

  const agent = getAgent(agentId);
  const google = createProvider(effectiveKey);

  let systemPrompt = agent.systemPrompt;
  if (userId && lastUserText) {
    try {
      const memoryContext = await getRelevantMemories(
        userId,
        lastUserText,
        effectiveKey
      );
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
    onFinish: async ({ text: assistantText }) => {
      if (userId && lastUserText && assistantText) {
        try {
          const extracted = await extractMemories(
            lastUserText,
            assistantText,
            effectiveKey
          );
          if (extracted.length > 0) {
            await storeMemories(
              userId,
              extracted,
              conversationId || null,
              effectiveKey
            );
          }
        } catch {
          // Memory extraction failed silently
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
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
