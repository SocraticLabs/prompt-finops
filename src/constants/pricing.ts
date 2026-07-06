import { IModelPricing, IEmbeddingModelPricing, IVectorDbPricing } from "@/types/types";

/**
 * @description: Hardcoded Model pricing information
 * @todo: Either find a general API that provides pricing information
 *      OR fetch this data from the respective APIs (i.e.: OpenAI API etc.)
 *      OR if the LLM providers' APIs do not provide the pricing information, then develop
 *         a web scraper that scrapes the pricing information from the respective websites.
 */
export const MODEL_PRICING: IModelPricing[] = [
  {
    model: "gpt-4-turbo",
    inputPrice: 0.01,
    outputPrice: 0.03,
    contextWindow: 128000,
    provider: "OpenAI",
  },
  {
    model: "gpt-4",
    inputPrice: 0.03,
    outputPrice: 0.06,
    contextWindow: 8192,
    provider: "OpenAI",
  },
  {
    model: "gpt-3.5-turbo",
    inputPrice: 0.0015,
    outputPrice: 0.002,
    contextWindow: 16385,
    provider: "OpenAI",
  },
  {
    model: "claude-2.1",
    inputPrice: 0.008,
    outputPrice: 0.024,
    contextWindow: 200000,
    provider: "Anthropic",
  },
  {
    model: "claude-instant",
    inputPrice: 0.00163,
    outputPrice: 0.00551,
    contextWindow: 100000,
    provider: "Anthropic",
  },
  {
    model: "palm2",
    inputPrice: 0.0005,
    outputPrice: 0.0005,
    contextWindow: 8192,
    provider: "Google",
  },
];

/** Embedding model pricing (price per 1 million tokens) */
export const EMBEDDING_MODEL_PRICING: IEmbeddingModelPricing[] = [
  {
    model: "text-embedding-3-small",
    provider: "OpenAI",
    pricePerMillionTokens: 0.02,
    dimensions: 1536,
  },
  {
    model: "text-embedding-3-large",
    provider: "OpenAI",
    pricePerMillionTokens: 0.13,
    dimensions: 3072,
  },
  {
    model: "text-embedding-ada-002",
    provider: "OpenAI",
    pricePerMillionTokens: 0.1,
    dimensions: 1536,
  },
];

/** Vector database pricing – storage cost per GB/month and query cost per 1 000 queries */
export const VECTOR_DB_PRICING: IVectorDbPricing[] = [
  {
    name: "Pinecone Serverless",
    provider: "Pinecone",
    storagePerGBPerMonth: 0.33,
    queryPer1000: 0.08,
  },
  {
    name: "Weaviate Cloud",
    provider: "Weaviate",
    storagePerGBPerMonth: 0.05,
    queryPer1000: 0,
  },
  {
    name: "Chroma (self-hosted)",
    provider: "Chroma",
    storagePerGBPerMonth: 0,
    queryPer1000: 0,
  },
  {
    name: "Qdrant Cloud",
    provider: "Qdrant",
    storagePerGBPerMonth: 0.07,
    queryPer1000: 0,
  },
];
