import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Creates the Google Generative AI provider.
 *
 * Key resolution order (BYOK model):
 *   1. GOOGLE_GENERATIVE_AI_API_KEY env var – optional host-level override
 *   2. apiKey param – caller passes the user's key retrieved from the DB
 *
 * The API key is NEVER accepted from the client request body.
 * It is always resolved server-side (env var or encrypted DB record).
 *
 * Throws if neither source provides a non-empty key so the caller
 * receives a clear error rather than a cryptic authentication failure.
 */
export function createProvider(apiKey?: string) {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || apiKey || "";
  if (!key) {
    throw new Error(
      "No API key available. Please add your Google AI Studio key in Settings."
    );
  }
  return createGoogleGenerativeAI({ apiKey: key });
}
