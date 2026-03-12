import { streamText, convertToModelMessages } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { getAgent } from "@/lib/ai/agents";
import { routeToAgent } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  const { messages, apiKey, agentId: requestedAgentId } = await req.json();

  if (!apiKey && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "No API key provided. Add your Google AI Studio key in settings.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

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
    agentId = await routeToAgent(lastUserText, apiKey);
  }
  agentId = agentId || "general";

  const agent = getAgent(agentId);
  const google = createProvider(apiKey);

  const result = streamText({
    model: google(agent.model),
    system: agent.systemPrompt,
    messages: modelMessages,
    temperature: agent.temperature,
    maxOutputTokens: 4096,
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
