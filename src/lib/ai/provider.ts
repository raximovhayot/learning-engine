import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createProvider(apiKey?: string) {
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || apiKey || "",
  });
}
