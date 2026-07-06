import { Info } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/Tooltip";

import { ITokenizationMetrics } from "@/types/types";
import { useState } from "react";

const metricTooltips = {
  compressionRatio:
    "Measures how efficiently the text is compressed into tokens. Lower values mean fewer tokens and reduced costs.",
  avgTokenLength:
    "Indicates the average character length of each token. Longer tokens imply more compact tokenization.",
  uniqueTokenRatio:
    "Shows the proportion of unique tokens relative to total tokens. Higher ratios reflect more diverse tokenization.",
  processingTimeMs:
    "Time (in milliseconds) taken to process and tokenize the input text.",
  specialCharTokens:
    "Number of tokens that contain special characters like punctuation or symbols.",
  memoryUsageBytes:
    "Estimated memory consumed during tokenization, measured in bytes (displayed as KB).",

function MetricTooltip({ metricKey }: { metricKey: keyof typeof metricTooltips }) {
  const [isVisible, setIsVisible] = useState(false);

  return (<Tooltip>
    <TooltipTrigger setIsVisible={setIsVisible}>
      <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
    </TooltipTrigger>

    <TooltipContent isVisible={isVisible}>{metricTooltips[metricKey]}</TooltipContent>
  </Tooltip>)
}

export function MetricsDisplay({ metrics }: { metrics: ITokenizationMetrics }) {
  const tokenLengthChartData = Object.entries(metrics.tokenLengthDistribution)
    .map(([length, count]) => ({
      length: parseInt(length),
      count,
    }))
    .sort((a, b) => a.length - b.length);


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center relative">
            <h4 className="text-sm font-medium flex items-center justify-center gap-2">
              Compression Ratio <MetricTooltip metricKey="compressionRatio" />
            </h4>
            <p className="text-xl font-semibold">
              {metrics.compressionRatio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              characters per token
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg text-center relative">
            <h4 className="text-sm font-medium flex items-center justify-center gap-2">
              Avg Token Length <MetricTooltip metricKey="avgTokenLength" />
            </h4>
            <p className="text-xl font-semibold">
              {metrics.avgTokenLength.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              characters
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg text-center relative">
            <h4 className="text-sm font-medium flex items-center justify-center gap-2">
              Unique Token Ratio <MetricTooltip metricKey="uniqueTokenRatio" />
            </h4>
            <p className="text-xl font-semibold">
              {(metrics.uniqueTokenRatio * 100).toFixed(1)}%
            </p>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg text-center relative">
            <h4 className="text-sm font-medium flex items-center justify-center gap-2">
              Processing Time <MetricTooltip metricKey="processingTimeMs" />
            </h4>
            <p className="text-xl font-semibold">
              {metrics.processingTimeMs.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              milliseconds
            </p>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg text-center relative">
            <h4 className="text-sm font-medium flex items-center justify-center gap-2">
              Special Chars <MetricTooltip metricKey="specialCharTokens" />
            </h4>
            <p className="text-xl font-semibold">{metrics.specialCharTokens}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">tokens</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center relative">
            <h4 className="text-sm font-medium flex items-center justify-center gap-2">
              Memory Usage <MetricTooltip metricKey="memoryUsageBytes" />
            </h4>
            <p className="text-xl font-semibold">
              {(metrics.memoryUsageBytes / 1024).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">KB</p>
          </div>
        </div>

        {/* Token Length Distribution Chart */}
        {tokenLengthChartData.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Token Length Distribution</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokenLengthChartData}>
                  <XAxis
                    dataKey="length"
                    label={{
                      value: "Token Length",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
