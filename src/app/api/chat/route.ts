import { streamText } from "ai";
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

  const lastUserMessage = messages
    .filter((m: { role: string }) => m.role === "user")
    .pop();

  let agentId = requestedAgentId;
  if (!agentId && lastUserMessage) {
    agentId = await routeToAgent(lastUserMessage.content, apiKey);
  }
  agentId = agentId || "general";

  const agent = getAgent(agentId);
  const google = createProvider(apiKey);

  const result = streamText({
    model: google(agent.model),
    system: agent.systemPrompt,
    messages,
    temperature: agent.temperature,
    maxOutputTokens: 4096,
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "X-Agent-Id": agentId,
      "X-Agent-Name": agent.name,
      "X-Agent-Avatar": agent.avatar,
    },
  });
}
