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
import { Database, DollarSign, Search, Layers } from "lucide-react";
import { MODEL_PRICING, EMBEDDING_MODEL_PRICING, VECTOR_DB_PRICING } from "@/constants/pricing";
import { IRAGPipelineCosts } from "@/types/types";

interface RAGCostModuleProps {
  onCostsChange?: (costs: IRAGPipelineCosts) => void;
}

export default function RAGCostModule({ onCostsChange }: RAGCostModuleProps) {
  // LLM settings (RAG uses a smaller prompt because retrieval handles context)
  const [llmModel, setLlmModel] = useState<string>("gpt-3.5-turbo");
  const [baseInputTokens, setBaseInputTokens] = useState<number>(200);
  const [outputTokens, setOutputTokens] = useState<number>(500);

  // Embedding settings
  const [embeddingModel, setEmbeddingModel] = useState<string>(
    "text-embedding-3-small"
  );

  // Vector DB settings
  const [vectorDb, setVectorDb] = useState<string>("Pinecone Serverless");
  const [vectorDbStorageGb, setVectorDbStorageGb] = useState<number>(1);

  // Retrieval settings
  const [chunksPerQuery, setChunksPerQuery] = useState<number>(5);
  const [avgChunkSizeTokens, setAvgChunkSizeTokens] = useState<number>(200);

  // Scale settings
  const [queriesPerMonth, setQueriesPerMonth] = useState<number>(10000);

  const calculateCosts = (): IRAGPipelineCosts => {
    const selectedLlm = MODEL_PRICING.find((m) => m.model === llmModel)!;
    const selectedEmbedding = EMBEDDING_MODEL_PRICING.find(
      (e) => e.model === embeddingModel
    )!;
    const selectedVectorDb = VECTOR_DB_PRICING.find(
      (db) => db.name === vectorDb
    )!;

    // Embedding cost per query (query text is embedded on every request)
    // Assume average query length of 50 tokens
    const avgQueryTokens = 50;
    const embeddingCostPerQuery =
      (avgQueryTokens / 1_000_000) * selectedEmbedding.pricePerMillionTokens;
    const embeddingCostMonthly = embeddingCostPerQuery * queriesPerMonth;

    // Vector DB cost
    const vectorDbStorageCostMonthly =
      vectorDbStorageGb * selectedVectorDb.storagePerGBPerMonth;
    const retrievalCostPerQuery =
      (selectedVectorDb.queryPer1000 / 1000);

    // Context injection: retrieved chunks add tokens to the LLM prompt
    const injectedContextTokens = chunksPerQuery * avgChunkSizeTokens;
    const totalInputTokens = baseInputTokens + injectedContextTokens;
    const injectedContextCostPerQuery =
      (injectedContextTokens / 1000) * selectedLlm.inputPrice;

    // LLM cost per query
    const llmInputCost = (totalInputTokens / 1000) * selectedLlm.inputPrice;
    const llmOutputCost = (outputTokens / 1000) * selectedLlm.outputPrice;
    const llmCostPerQuery = llmInputCost + llmOutputCost;

    const totalCostPerQuery =
      embeddingCostPerQuery + retrievalCostPerQuery + llmCostPerQuery;

    const totalMonthlyCost =
      embeddingCostMonthly +
      vectorDbStorageCostMonthly +
      retrievalCostPerQuery * queriesPerMonth +
      llmCostPerQuery * queriesPerMonth;

    return {
      embeddingCostPerQuery,
      embeddingCostMonthly,
      vectorDbStorageCostMonthly,
      retrievalCostPerQuery,
      injectedContextTokens,
      injectedContextCostPerQuery,
      llmCostPerQuery,
      totalCostPerQuery,
      totalMonthlyCost,
    };
  };

  const costs = calculateCosts();

  useEffect(() => {
    onCostsChange?.(costs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    llmModel,
    baseInputTokens,
    outputTokens,
    embeddingModel,
    vectorDb,
    vectorDbStorageGb,
    chunksPerQuery,
    avgChunkSizeTokens,
    queriesPerMonth,
  ]);

  const costBreakdownData = [
    { name: "LLM Inference", cost: costs.llmCostPerQuery * queriesPerMonth },
    { name: "Embeddings", cost: costs.embeddingCostMonthly },
    {
      name: "Vector DB Storage",
      cost: costs.vectorDbStorageCostMonthly,
    },
    {
      name: "Retrieval Queries",
      cost: costs.retrievalCostPerQuery * queriesPerMonth,
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Model retrieval-augmented generation pipeline costs including embeddings,
        vector database storage, retrieval queries, and context injection
        overhead.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RAG Configuration */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">LLM Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  LLM Model
                </label>
                <select
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                >
                  {MODEL_PRICING.map((m) => (
                    <option key={m.model} value={m.model}>
                      {m.model} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Base System Prompt Tokens (without context)
                </label>
                <input
                  type="number"
                  value={baseInputTokens}
                  onChange={(e) => setBaseInputTokens(Number(e.target.value))}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Output Tokens per Query
                </label>
                <input
                  type="number"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Number(e.target.value))}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                  min={1}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">
              Embedding Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Embedding Model
                </label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                >
                  {EMBEDDING_MODEL_PRICING.map((e) => (
                    <option key={e.model} value={e.model}>
                      {e.model} ({e.provider}) — $
                      {e.pricePerMillionTokens}/M tokens
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Vector DB &amp; Retrieval
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vector Database
                </label>
                <select
                  value={vectorDb}
                  onChange={(e) => setVectorDb(e.target.value)}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                >
                  {VECTOR_DB_PRICING.map((db) => (
                    <option key={db.name} value={db.name}>
                      {db.name} — ${db.storagePerGBPerMonth}/GB/mo, $
                      {db.queryPer1000}/1k queries
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vector DB Storage (GB)
                </label>
                <input
                  type="number"
                  value={vectorDbStorageGb}
                  onChange={(e) =>
                    setVectorDbStorageGb(Number(e.target.value))
                  }
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                  min={0}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chunks Retrieved per Query
                </label>
                <input
                  type="number"
                  value={chunksPerQuery}
                  onChange={(e) => setChunksPerQuery(Number(e.target.value))}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Average Chunk Size (tokens)
                </label>
                <input
                  type="number"
                  value={avgChunkSizeTokens}
                  onChange={(e) =>
                    setAvgChunkSizeTokens(Number(e.target.value))
                  }
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Queries per Month
                </label>
                <input
                  type="number"
                  value={queriesPerMonth}
                  onChange={(e) => setQueriesPerMonth(Number(e.target.value))}
                  className="dark:bg-slate-700 dark:border-slate-500 w-full p-2 border rounded-md"
                  min={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Cards */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">RAG Pipeline Cost Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Layers className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
            <h4 className="font-medium text-sm">LLM Cost / Query</h4>
            <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              ${costs.llmCostPerQuery.toFixed(4)}
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <Search className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
            <h4 className="font-medium text-sm">Embedding / Query</h4>
            <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              ${costs.embeddingCostPerQuery.toFixed(6)}
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <Database className="w-6 h-6 mb-2 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-sm">Vector DB / Month</h4>
            <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              ${costs.vectorDbStorageCostMonthly.toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
            <DollarSign className="w-6 h-6 mb-2 text-orange-600 dark:text-orange-400" />
            <h4 className="font-medium text-sm">Total / Month</h4>
            <p className="text-2xl font-bold overflow-hidden whitespace-nowrap text-ellipsis">
              ${costs.totalMonthlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Context Injection Detail */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg mb-6">
          <h4 className="font-medium mb-2">Context Injection Overhead</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <p>
              <strong>Injected Tokens per Query:</strong>{" "}
              {costs.injectedContextTokens.toLocaleString()}
            </p>
            <p>
              <strong>Injection Cost per Query:</strong> $
              {costs.injectedContextCostPerQuery.toFixed(4)}
            </p>
            <p>
              <strong>Monthly Injection Cost:</strong> $
              {(costs.injectedContextCostPerQuery * queriesPerMonth).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Monthly Cost Breakdown Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={costBreakdownData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(4)}`} />
            <Legend />
            <Bar dataKey="cost" fill="#8b5cf6" name="Monthly Cost ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
