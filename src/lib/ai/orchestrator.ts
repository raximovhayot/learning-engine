import { generateText } from "ai";
import { createProvider } from "./provider";
import { AGENTS } from "./agents";

const VALID_AGENT_IDS = ["math", "physics", "code", "general"];

export async function routeToAgent(
  userMessage: string,
  apiKey?: string
): Promise<string> {
  const google = createProvider(apiKey);
  const orchestrator = AGENTS.orchestrator;

  try {
    const { text } = await generateText({
      model: google(orchestrator.model),
      system: orchestrator.systemPrompt,
      prompt: userMessage,
      temperature: orchestrator.temperature,
      maxOutputTokens: 10,
    });

    const agentId = text.trim().toLowerCase();

    if (VALID_AGENT_IDS.includes(agentId)) {
      return agentId;
    }

    return "general";
  } catch {
    return "general";
  }
}
