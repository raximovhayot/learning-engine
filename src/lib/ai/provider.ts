import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Creates the Google Generative AI provider using the server-side env var.
 * The API key is NEVER accepted from client input – it must be set via
 * the GOOGLE_GENERATIVE_AI_API_KEY environment variable.
 */
export function createProvider() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set. " +
        "Please configure it before starting the server."
    );
  }
  return createGoogleGenerativeAI({ apiKey });
}
