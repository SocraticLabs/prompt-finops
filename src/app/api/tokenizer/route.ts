// pages/api/tokenizer.ts
import tiktoken from "tiktoken";
import { NextResponse, NextRequest } from "next/server";

interface TokenizationMetrics {
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

function calculateMetrics(
  inputText: string,
  tokens: number[],
  encoding: tiktoken.Tiktoken,
  processingTimeMs: number
): TokenizationMetrics {
  const uniqueTokens = new Set(tokens);
  const uniqueTokenRatio = uniqueTokens.size / tokens.length;

  const tokenLengthDist: Record<string, number> = {};
  tokens.forEach((token) => {
    const decoded = encoding.decode(new Uint32Array([token]));
    const length = decoded.length;
    tokenLengthDist[length] = (tokenLengthDist[length] || 0) + 1;
  });

  // Count special characters
  const specialCharCount = (inputText.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const numberCount = (inputText.match(/\d+/g) || []).length;
  const whitespaceCount = (inputText.match(/\s+/g) || []).length;

  // Calculate compression ratio (characters per token)
  const compressionRatio = inputText.length / tokens.length;

  /**
   * @description Very naive calculation assuming 2 bytes per character (UTF-16) for the input text and 4 bytes per token (32-bit int) for the numerical token array.
   * @description It does not account for the actual memory used by the encoding object, loading the LLM context and, especially, the LLM inference.
   * @todo Implement a more accurate memory usage calculation focusing on LLM inference costs.
   */
  const memoryUsageBytes = tokens.length * 4 + inputText.length * 2;

  return {
    compressionRatio,
    avgTokenLength: inputText.length / tokens.length,
    specialTokenCount: specialCharCount,
    processingTimeMs,
    memoryUsageBytes,
    uniqueTokenRatio,
    tokenLengthDistribution: tokenLengthDist,
    whitespaceTokens: whitespaceCount,
    numberTokens: numberCount,
    specialCharTokens: specialCharCount,
  };
}

export async function POST(request: NextRequest) {
  try {
    const startTime = performance.now();
    const { inputText, selectedTokenizer } = await request.json();

    const encoding = tiktoken.get_encoding(selectedTokenizer);
    const tokens = encoding.encode(inputText);

    const processingTimeMs = performance.now() - startTime;
    const metrics = calculateMetrics(
      inputText,
      Array.from(tokens),
      encoding,
      processingTimeMs
    );

    const response = {
      inputText,
      tokenizer: selectedTokenizer,
      tokenCount: tokens.length,
      tokens: tokens,
      metrics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in tokenization:", error);
    return NextResponse.json({ message: "internal server error" });
  }
}
