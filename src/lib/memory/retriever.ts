import { searchMemories } from "./store";

export async function getRelevantMemories(
  userId: string,
  query: string
): Promise<string> {
  const results = await searchMemories(userId, query, 8);

  if (results.length === 0) return "";

  const relevantResults = results.filter(
    (r) => r.similarity > 0.3
  );

  if (relevantResults.length === 0) return "";

  const memoryLines = relevantResults.map(
    (r) => `- [${r.type}] ${r.content} (confidence: ${(r.confidence * 100).toFixed(0)}%)`
  );

  return `## What you remember about this user:\n${memoryLines.join("\n")}`;
}
