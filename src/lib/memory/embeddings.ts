import { embed, embedMany } from "ai";
import { createProvider } from "@/lib/ai/provider";

const EMBEDDING_MODEL = "gemini-embedding-001";

export async function generateEmbedding(text: string): Promise<number[]> {
  const google = createProvider();
  const { embedding } = await embed({
    model: google.embedding(EMBEDDING_MODEL),
    value: text,
    providerOptions: {
      google: { outputDimensionality: 768 },
    },
  });
  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const google = createProvider();
  const { embeddings } = await embedMany({
    model: google.embedding(EMBEDDING_MODEL),
    values: texts,
    providerOptions: {
      google: { outputDimensionality: 768 },
    },
  });
  return embeddings;
}
