"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { IContextEngineeringMetrics, IRAGPipelineCosts, IROIComparison } from "@/types/types";

interface ROIBenchmarkProps {
  contextMetrics: IContextEngineeringMetrics | null;
  ragCosts: IRAGPipelineCosts | null;
}

function computeROI(
  contextMetrics: IContextEngineeringMetrics,
  ragCosts: IRAGPipelineCosts
): IROIComparison {
  const ceMonthly = contextMetrics.monthlyCost;
  const ragMonthly = ragCosts.totalMonthlyCost;

  const costDifference = ceMonthly - ragMonthly;

  const moreExpensive = Math.max(ceMonthly, ragMonthly);
  const cheaper = Math.min(ceMonthly, ragMonthly);
  const costReductionPercent =
    moreExpensive > 0 ? ((moreExpensive - cheaper) / moreExpensive) * 100 : 0;

  let recommendedApproach: IROIComparison["recommendedApproach"];
  if (costReductionPercent < 1) {
    recommendedApproach = "equivalent";
  } else if (ragMonthly < ceMonthly) {
    recommendedApproach = "rag";
  } else {
    recommendedApproach = "context-engineering";
  }

  return {
    contextEngineeringMonthlyCost: ceMonthly,
    ragMonthlyCost: ragMonthly,
    costDifference,
    costReductionPercent,
    recommendedApproach,
    contextEngineeringCostPerQuery: contextMetrics.costPerCall,
    ragCostPerQuery: ragCosts.totalCostPerQuery,
  };
}

function buildScaleData(
  contextMetrics: IContextEngineeringMetrics,
  ragCosts: IRAGPipelineCosts
) {
  const steps = [1000, 5000, 10000, 50000, 100000, 500000];
  return steps.map((queries) => ({
    queries: queries.toLocaleString(),
    "Context Engineering": parseFloat(
      (contextMetrics.costPerCall * queries).toFixed(2)
    ),
    "RAG Architecture": parseFloat(
      (ragCosts.totalCostPerQuery * queries).toFixed(2)
    ),
  }));
}

export default function ROIBenchmark({
  contextMetrics,
  ragCosts,
}: ROIBenchmarkProps) {
  if (!contextMetrics || !ragCosts) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg">
          Configure both the{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Context Engineering
          </span>{" "}
          and{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            RAG Architecture
          </span>{" "}
          tabs to unlock the ROI comparison.
        </p>
      </div>
    );
  }

  const roi = computeROI(contextMetrics, ragCosts);
  const scaleData = buildScaleData(contextMetrics, ragCosts);

  const comparisonData = [
    {
      category: "Cost per Query",
      "Context Engineering": parseFloat(
        roi.contextEngineeringCostPerQuery.toFixed(6)
      ),
      "RAG Architecture": parseFloat(roi.ragCostPerQuery.toFixed(6)),
    },
    {
      category: "Monthly Cost",
      "Context Engineering": parseFloat(
        roi.contextEngineeringMonthlyCost.toFixed(4)
      ),
      "RAG Architecture": parseFloat(roi.ragMonthlyCost.toFixed(4)),
    },
  ];

  const recommendationConfig = {
    "context-engineering": {
      label: "Context Engineering",
      colorClass:
        "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700",
      badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      Icon: TrendingDown,
      iconClass: "text-blue-600 dark:text-blue-400",
      description:
        "Optimizing what goes into the context window is more cost-effective for this workload. Focus on prompt compression, token efficiency, and selective context inclusion.",
    },
    rag: {
      label: "RAG Architecture",
      colorClass:
        "bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700",
      badgeClass:
        "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
      Icon: TrendingUp,
      iconClass: "text-purple-600 dark:text-purple-400",
      description:
        "RAG delivers better ROI for this workload. Offloading knowledge to a vector store reduces LLM inference costs despite the embedding and retrieval overhead.",
    },
    equivalent: {
      label: "Equivalent Cost",
      colorClass:
        "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
      badgeClass:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      Icon: Minus,
      iconClass: "text-gray-600 dark:text-gray-400",
      description:
        "Both approaches are within 1% of each other in cost. Choose based on non-cost factors such as latency, data freshness, or maintenance complexity.",
    },
  };

  const rec = recommendationConfig[roi.recommendedApproach];

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Side-by-side ROI comparison of Context Engineering vs RAG Architecture
        strategies based on your configured parameters.
      </p>

      {/* Recommendation Banner */}
      <div
        className={`p-6 rounded-lg border-2 ${rec.colorClass}`}
      >
        <div className="flex items-start gap-4">
          <rec.Icon className={`w-8 h-8 mt-1 shrink-0 ${rec.iconClass}`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold">
                Recommended: {rec.label}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${rec.badgeClass}`}
              >
                {roi.recommendedApproach === "equivalent"
                  ? "~equal cost"
                  : `${Math.abs(roi.costReductionPercent).toFixed(1)}% cheaper`}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {rec.description}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            CE Cost / Query
          </p>
          <p className="text-xl font-bold">
            ${roi.contextEngineeringCostPerQuery.toFixed(4)}
          </p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            RAG Cost / Query
          </p>
          <p className="text-xl font-bold">
            ${roi.ragCostPerQuery.toFixed(4)}
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            CE Monthly Cost
          </p>
          <p className="text-xl font-bold">
            ${roi.contextEngineeringMonthlyCost.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            RAG Monthly Cost
          </p>
          <p className="text-xl font-bold">
            ${roi.ragMonthlyCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h4 className="font-semibold mb-2">Monthly Cost Differential</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {roi.costDifference > 0 ? (
            <>
              RAG saves{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                ${roi.costDifference.toFixed(2)}/month
              </span>{" "}
              ({roi.costReductionPercent.toFixed(1)}%) compared to Context
              Engineering.
            </>
          ) : roi.costDifference < 0 ? (
            <>
              Context Engineering saves{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                ${Math.abs(roi.costDifference).toFixed(2)}/month
              </span>{" "}
              ({Math.abs(roi.costReductionPercent).toFixed(1)}%) compared to
              RAG.
            </>
          ) : (
            "Both approaches have equivalent monthly costs."
          )}
        </p>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(4)}`} />
              <Legend />
              <Bar
                dataKey="Context Engineering"
                fill="#3b82f6"
                name="Context Engineering"
              />
              <Bar
                dataKey="RAG Architecture"
                fill="#8b5cf6"
                name="RAG Architecture"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Cost Scaling by Query Volume
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scaleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="queries" angle={-30} textAnchor="end" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Context Engineering"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="RAG Architecture"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            Context Engineering — Key Metrics
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Context Window Utilization:</strong>{" "}
              {contextMetrics.contextWindowUtilization.toFixed(1)}%
            </li>
            <li>
              <strong>Token Compression Ratio:</strong>{" "}
              {contextMetrics.tokenCompressionRatio > 0
                ? `${contextMetrics.tokenCompressionRatio.toFixed(2)} chars/token`
                : "N/A — run tokenizer"}
            </li>
            <li>
              <strong>Prompt Efficiency Score:</strong>{" "}
              {contextMetrics.promptEfficiencyScore > 0
                ? `${(contextMetrics.promptEfficiencyScore * 100).toFixed(1)}% unique tokens`
                : "N/A — run tokenizer"}
            </li>
            <li>
              <strong>Input Tokens:</strong>{" "}
              {contextMetrics.totalInputTokens.toLocaleString()}
            </li>
            <li>
              <strong>Output Tokens:</strong>{" "}
              {contextMetrics.totalOutputTokens.toLocaleString()}
            </li>
          </ul>
        </div>

        <div className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            RAG Architecture — Key Metrics
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Injected Context Tokens / Query:</strong>{" "}
              {ragCosts.injectedContextTokens.toLocaleString()}
            </li>
            <li>
              <strong>Embedding Cost / Query:</strong> $
              {ragCosts.embeddingCostPerQuery.toFixed(6)}
            </li>
            <li>
              <strong>Vector DB Storage / Month:</strong> $
              {ragCosts.vectorDbStorageCostMonthly.toFixed(2)}
            </li>
            <li>
              <strong>Retrieval Cost / Query:</strong> $
              {ragCosts.retrievalCostPerQuery.toFixed(6)}
            </li>
            <li>
              <strong>LLM Cost / Query:</strong> $
              {ragCosts.llmCostPerQuery.toFixed(4)}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
