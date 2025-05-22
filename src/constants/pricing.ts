import { IModelPricing } from "@/types/types";

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
