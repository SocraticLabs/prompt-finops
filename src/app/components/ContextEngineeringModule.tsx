"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calculator, DollarSign, TrendingUp, Zap } from "lucide-react";
import { TokenCounterForm, TokenCounterResult } from "./TokenCounter";
import { MODEL_PRICING } from "@/constants/pricing";
import { ITokenizationMetrics, IContextEngineeringMetrics } from "@/types/types";
import { trackGAEvent } from "../utils/googleAnalytics";

interface ITokenCountResult {
  inputText: string;
  tokenizer: string;
  tokenCount: number;
  tokens: number[];
  metrics: ITokenizationMetrics;
  error?: string;
}

interface ContextEngineeringModuleProps {
  onMetricsChange?: (metrics: IContextEngineeringMetrics) => void;
}

export default function ContextEngineeringModule({
  onMetricsChange,
}: ContextEngineeringModuleProps) {
  const [tokenResult, setTokenResult] = useState<ITokenCountResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialInputTokensValue = 1000;

  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo");
  const [inputTokens, setInputTokens] = useState<number>(
    initialInputTokensValue
  );
  const [outputTokens, setOutputTokens] = useState<number>(
    initialInputTokensValue / 2
  );
  const [apiCalls, setApiCalls] = useState<number>(1000);
  const [timeframe, setTimeframe] = useState<string>("monthly");
  const [outputTokenRatio, setOutputTokenRatio] = useState<number>(0.5);

  const handleTokenizerSubmit = async (
    inputText: string,
    selectedTokenizer: string
  ) => {
    setIsLoading(true);
    trackGAEvent("prompt_submit", {
      event_category: "Context Engineering",
      event_label: "Submit Prompt to Tokenizer Analysis",
      tokenizer: selectedTokenizer,
      text_length: inputText.length,
    });

    try {
      const response = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText, selectedTokenizer }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      setTokenResult(result);
      setInputTokens(result.tokenCount);
      setOutputTokens(Math.ceil(result.tokenCount * outputTokenRatio));
    } catch (error) {
      console.error("Error fetching token count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenResult) {
      setOutputTokens(Math.ceil(tokenResult.tokenCount * outputTokenRatio));
    }
  }, [tokenResult, outputTokenRatio]);

  const calculateCosts = () => {
    const model = MODEL_PRICING.find((m) => m.model === selectedModel)!;
    const inputCost = (inputTokens / 1000) * model.inputPrice;
    const outputCost = (outputTokens / 1000) * model.outputPrice;
    const costPerCall = inputCost + outputCost;

    const timeframeMultiplier: Record<string, number> = {
      hourly: 1,
      daily: 24,
      weekly: 24 * 7,
      monthly: 24 * 30,
      yearly: 24 * 365,
    };

    const multiplier = timeframeMultiplier[timeframe] ?? 1;
    const totalCost = costPerCall * apiCalls * multiplier;

    return {
      inputCost,
      outputCost,
      costPerCall,
      totalCost,
      tokenUtilization:
        ((inputTokens + outputTokens) / model.contextWindow) * 100,
    };
  };

  const costs = calculateCosts();

  const modelComparisonData = MODEL_PRICING.map((model) => {
    const inputCost = (inputTokens / 1000) * model.inputPrice;
    const outputCost = (outputTokens / 1000) * model.outputPrice;
    return {
      model: model.model,
      provider: model.provider,
      cost: (inputCost + outputCost) * apiCalls,
      inputCost,
      outputCost,
    };
  });

  // Derive context engineering metrics and propagate them to parent
  useEffect(() => {
    if (!onMetricsChange) return;
    const model = MODEL_PRICING.find((m) => m.model === selectedModel);
    if (!model) return;
    const inputCost = (inputTokens / 1000) * model.inputPrice;
    const outputCost = (outputTokens / 1000) * model.outputPrice;
    const costPerCall = inputCost + outputCost;

    const monthlyMultiplier = 24 * 30;

    onMetricsChange({
      contextWindowUtilization:
        ((inputTokens + outputTokens) / model.contextWindow) * 100,
      tokenCompressionRatio: tokenResult
        ? tokenResult.metrics.compressionRatio
        : 0,
      promptEfficiencyScore: tokenResult
        ? tokenResult.metrics.uniqueTokenRatio
        : 0,
      totalInputTokens: inputTokens,
      totalOutputTokens: outputTokens,
      costPerCall,
      monthlyCost: costPerCall * apiCalls * monthlyMultiplier,
    });
  }, [
    inputTokens,
    outputTokens,
    selectedModel,
    apiCalls,
    tokenResult,
    onMetricsChange,
  ]);

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Optimize what goes into the context window. Measure token compression,
        prompt efficiency, and context utilization to minimize LLM inference
        costs.
      </p>

      {/* Tokenization Analysis */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Tokenization Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <TokenCounterForm onSubmit={handleTokenizerSubmit} />
            {isLoading && (
              <div className="mt-6 text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Processing tokens…</p>
              </div>
            )}
          </div>
          <div>
            {tokenResult && !isLoading && (
              <TokenCounterResult result={tokenResult} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Parameters */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Cost Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
              >
                {MODEL_PRICING.map((model) => (
                  <option key={model.model} value={model.model}>
                    {model.model} ({model.provider})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Input Tokens{" "}
                {tokenResult && "(Auto-populated from tokenizer)"}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Number(e.target.value))}
                  className={`dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md ${
                    tokenResult ? "bg-gray-50" : ""
                  }`}
                  readOnly={!!tokenResult}
                />
                {tokenResult && (
                  <button
                    onClick={() => {
                      setInputTokens(initialInputTokensValue);
                      setOutputTokens(initialInputTokensValue / 2);
                    }}
                    className="dark:bg-slate-700 dark:border-slate-500 ml-2 p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Reset to default"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Output Token Ratio
              </label>
              <input
                type="number"
                value={outputTokenRatio}
                onChange={(e) => setOutputTokenRatio(Number(e.target.value))}
                className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                step="0.1"
                min="0.1"
                max="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Output Tokens (Based on ratio)
              </label>
              <input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                API Calls
              </label>
              <input
                type="number"
                value={apiCalls}
                onChange={(e) => {
                  setApiCalls(Number(e.target.value));
                  trackGAEvent("llm_api_calls_updated", {
                    event_category: "Context Engineering",
                    event_label: "LLM API Calls Number Changed",
                    value: e.target.value,
                  });
                }}
                className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Cost Breakdown</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium">Cost per Call</h4>
              <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                ${costs.costPerCall.toFixed(4)}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <Calculator className="w-6 h-6 mb-2 text-green-600 dark:text-green-400" />
              <h4 className="font-medium">Total Cost ({timeframe})</h4>
              <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                ${costs.totalCost.toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
              <h4 className="font-medium">Input Cost</h4>
              <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                ${costs.inputCost.toFixed(4)}
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <Zap className="w-6 h-6 mb-2 text-orange-600 dark:text-orange-400" />
              <h4 className="font-medium">Output Cost</h4>
              <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                ${costs.outputCost.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Context Window Utilization */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Context Window Utilization</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${Math.min(costs.tokenUtilization, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-sm mt-1">
              {costs.tokenUtilization.toFixed(1)}% of context window used
            </p>
          </div>

          {/* Token Efficiency Metrics from tokenizer */}
          {tokenResult && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <h4 className="font-medium mb-2">Prompt Efficiency Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Compression Ratio:</strong>{" "}
                  {tokenResult.metrics.compressionRatio.toFixed(2)} chars/token
                </p>
                <p>
                  <strong>Unique Token Ratio:</strong>{" "}
                  {(tokenResult.metrics.uniqueTokenRatio * 100).toFixed(1)}%
                </p>
                <p>
                  <strong>Processing Time:</strong>{" "}
                  {tokenResult.metrics.processingTimeMs.toFixed(1)}ms
                </p>
                <p>
                  <strong>Special Characters:</strong>{" "}
                  {tokenResult.metrics.specialCharTokens}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Comparison Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Cost Comparison Across Models
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelComparisonData}>
              <XAxis dataKey="model" angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(4)}`}
              />
              <Legend />
              <Bar dataKey="cost" fill="#3b82f6" name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Cost Breakdown by Provider
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelComparisonData}>
              <XAxis dataKey="provider" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(4)}`}
              />
              <Legend />
              <Bar dataKey="inputCost" fill="#10b981" name="Input Cost" />
              <Bar dataKey="outputCost" fill="#f59e0b" name="Output Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
