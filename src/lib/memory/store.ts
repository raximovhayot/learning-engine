import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { generateEmbedding, generateEmbeddings } from "./embeddings";
import type { ExtractedMemory } from "./extractor";

export async function storeMemories(
  userId: string,
  extracted: ExtractedMemory[],
  conversationId: string | null
) {
  if (extracted.length === 0) return;

  const texts = extracted.map((m) => m.content);
  const embeddings = await generateEmbeddings(texts);

  const values = extracted.map((m, i) => ({
    userId,
    type: m.type,
    content: m.content,
    embedding: embeddings[i],
    sourceConversationId: conversationId,
    confidence: m.confidence,
  }));

  await db.insert(memories).values(values);
}

export async function searchMemories(
  userId: string,
  query: string,
  limit = 10
) {
  const queryEmbedding = await generateEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const results = await db
    .select({
      id: memories.id,
      type: memories.type,
      content: memories.content,
      confidence: memories.confidence,
      similarity: sql<number>`1 - (${memories.embedding} <=> ${vectorStr}::vector)`,
      createdAt: memories.createdAt,
    })
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(sql`${memories.embedding} <=> ${vectorStr}::vector`)
    .limit(limit);

  await db
    .update(memories)
    .set({
      accessCount: sql`${memories.accessCount} + 1`,
      lastAccessedAt: new Date(),
    })
    .where(
      sql`${memories.id} IN (${sql.join(
        results.map((r) => sql`${r.id}`),
        sql`, `
      )})`
    )
    .catch(() => {});

  return results;
}

export async function getUserMemories(userId: string) {
  return db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt));
}

export async function deleteMemory(id: string, userId: string) {
  await db
    .delete(memories)
    .where(sql`${memories.id} = ${id} AND ${memories.userId} = ${userId}`);
}

export async function deleteAllUserMemories(userId: string) {
  await db.delete(memories).where(eq(memories.userId, userId));
}
