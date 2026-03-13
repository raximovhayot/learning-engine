import { generateObject } from "ai";
import { createProvider } from "@/lib/ai/provider";
import { z } from "zod";

const memorySchema = z.object({
  memories: z.array(
    z.object({
      type: z.enum([
        "fact",
        "preference",
        "goal",
        "skill_level",
        "episodic",
      ]),
      content: z.string().describe("A concise, self-contained memory statement"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("How confident we are this is true (0-1)"),
    })
  ),
});

export type ExtractedMemory = z.infer<typeof memorySchema>["memories"][number];

const EXTRACTION_PROMPT = `You are a memory extraction system for a learning platform. Analyze the conversation and extract important facts about the user that would be useful for future tutoring sessions.

Extract ONLY new, non-trivial information. Focus on:
- Facts: things the user has told you about themselves (name, age, school, interests)
- Preferences: how the user prefers to learn (visual, examples-first, formal, etc.)
- Goals: what the user wants to learn or achieve
- Skill levels: what the user already knows or struggles with
- Episodic: notable events from the conversation (solved a hard problem, got confused on a topic)

Rules:
- Each memory should be a complete, self-contained statement
- Do NOT extract trivial greetings or generic statements
- Do NOT extract information about the AI tutor itself
- If there is nothing meaningful to extract, return an empty array
- Keep memories concise (under 100 characters each)`;

export async function extractMemories(
  userMessage: string,
  assistantMessage: string
): Promise<ExtractedMemory[]> {
  const google = createProvider();

  try {
    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: memorySchema,
      system: EXTRACTION_PROMPT,
      prompt: `User: ${userMessage}\n\nAssistant: ${assistantMessage}`,
      temperature: 0.3,
      maxOutputTokens: 1024,
    });

    return object.memories;
  } catch {
    return [];
  }
}
