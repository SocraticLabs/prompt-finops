export interface IModelPricing {
  model: string;
  inputPrice: number; // per 1K tokens
  outputPrice: number; // per 1K tokens
  contextWindow: number;
  provider: string;
}

export interface ITokenizationMetrics {
  compressionRatio: number;
  avgTokenLength: number;
  specialTokenCount: number;
  processingTimeMs: number;
  memoryUsageBytes: number;
  uniqueTokenRatio: number;
  tokenLengthDistribution: Record<string, number>;
  whitespaceTokens: number;
  numberTokens: number;
  specialCharTokens: number;
}

export interface IEmbeddingModelPricing {
  model: string;
  provider: string;
  pricePerMillionTokens: number;
  dimensions: number;
}

export interface IVectorDbPricing {
  name: string;
  provider: string;
  storagePerGBPerMonth: number;
  queryPer1000: number;
}

/** Metrics for the Context Engineering strategy */
export interface IContextEngineeringMetrics {
  contextWindowUtilization: number; // percentage
  tokenCompressionRatio: number; // characters per token
  promptEfficiencyScore: number; // unique token ratio (0–1)
  totalInputTokens: number;
  totalOutputTokens: number;
  costPerCall: number;
  monthlyCost: number;
}

/** Costs for the RAG pipeline strategy */
export interface IRAGPipelineCosts {
  embeddingCostPerQuery: number;
  embeddingCostMonthly: number;
  vectorDbStorageCostMonthly: number;
  retrievalCostPerQuery: number;
  injectedContextTokens: number;
  injectedContextCostPerQuery: number;
  llmCostPerQuery: number;
  totalCostPerQuery: number;
  totalMonthlyCost: number;
}

/** Side-by-side ROI comparison of both strategies */
export interface IROIComparison {
  contextEngineeringMonthlyCost: number;
  ragMonthlyCost: number;
  costDifference: number;
  costReductionPercent: number;
  recommendedApproach: "context-engineering" | "rag" | "equivalent";
  contextEngineeringCostPerQuery: number;
  ragCostPerQuery: number;
}
