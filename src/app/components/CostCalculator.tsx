"use client";
import { ElementType, useState } from "react";
import { Cpu, Database, TrendingUp } from "lucide-react";
import ContextEngineeringModule from "./ContextEngineeringModule";
import RAGCostModule from "./RAGCostModule";
import ROIBenchmark from "./ROIBenchmark";
import { IContextEngineeringMetrics, IRAGPipelineCosts } from "@/types/types";

type Tab = "context-engineering" | "rag-architecture" | "roi-benchmark";

const TABS: { id: Tab; label: string; Icon: ElementType }[] = [
  { id: "context-engineering", label: "Context Engineering", Icon: Cpu },
  { id: "rag-architecture", label: "RAG Architecture", Icon: Database },
  { id: "roi-benchmark", label: "ROI Benchmark", Icon: TrendingUp },
];

export default function IntegratedCostAnalytics() {
  const [activeTab, setActiveTab] = useState<Tab>("context-engineering");
  const [contextMetrics, setContextMetrics] =
    useState<IContextEngineeringMetrics | null>(null);
  const [ragCosts, setRagCosts] = useState<IRAGPipelineCosts | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">LLM Cost Analytics</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Evaluate and benchmark Context Engineering vs RAG architecture costs to
        identify the best FinOps strategy for your AI workload.
      </p>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "context-engineering" && (
        <ContextEngineeringModule onMetricsChange={setContextMetrics} />
      )}
      {activeTab === "rag-architecture" && (
        <RAGCostModule onCostsChange={setRagCosts} />
      )}
      {activeTab === "roi-benchmark" && (
        <ROIBenchmark contextMetrics={contextMetrics} ragCosts={ragCosts} />
      )}
    </div>
  );
}

