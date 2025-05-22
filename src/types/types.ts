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
