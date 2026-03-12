import { db } from ".";
import { eq, desc } from "drizzle-orm";
import {
  profiles,
  conversations,
  messages,
  apiKeys,
  type NewConversation,
  type NewMessage,
} from "./schema";
import { encrypt, decrypt } from "@/lib/crypto";

export async function getOrCreateProfile(id: string, email: string) {
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [profile] = await db
    .insert(profiles)
    .values({ id, email })
    .returning();
  return profile;
}

export async function getUserConversations(userId: string) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversation(id: string) {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return conv ?? null;
}

export async function createConversation(data: NewConversation) {
  const [conv] = await db.insert(conversations).values(data).returning();
  return conv;
}

export async function updateConversationTitle(id: string, title: string) {
  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

export async function deleteConversation(id: string) {
  await db.delete(conversations).where(eq(conversations.id, id));
}

export async function getConversationMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createMessage(data: NewMessage) {
  const [msg] = await db.insert(messages).values(data).returning();
  return msg;
}

export async function getUserApiKey(userId: string, provider = "google") {
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .limit(1);

  if (!key || key.provider !== provider) return null;

  try {
    return decrypt(key.encryptedKey, key.iv);
  } catch {
    return null;
  }
}

export async function setUserApiKey(
  userId: string,
  plainKey: string,
  provider = "google"
) {
  const { encrypted, iv } = encrypt(plainKey);

  const existing = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(apiKeys)
      .set({
        encryptedKey: encrypted,
        iv,
        provider,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, existing[0].id));
  } else {
    await db.insert(apiKeys).values({
      userId,
      provider,
      encryptedKey: encrypted,
      iv,
    });
  }
}

export async function deleteUserApiKey(userId: string) {
  await db.delete(apiKeys).where(eq(apiKeys.userId, userId));
}
