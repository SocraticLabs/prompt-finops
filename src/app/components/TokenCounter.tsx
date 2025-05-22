import { useState } from "react";
import React from "react";
import { MetricsDisplay } from "./MetricsDisplay";
import { ITokenizationMetrics } from "@/types/types";

interface ITokenCounterFormProps {
  onSubmit: (inputText: string, selectedTokenizer: string) => void;
}

export function TokenCounterForm({ onSubmit }: ITokenCounterFormProps) {
  const [inputText, setInputText] = useState<string>("");
  const [selectedTokenizer, setSelectedTokenizer] =
    useState<string>("cl100k_base");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText, selectedTokenizer);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-left text-sm font-medium mb-2">
          Input Text:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          placeholder="Enter your text here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-left text-sm font-medium mb-2">
          Select Tokenizer:
        </label>
        <select
          value={selectedTokenizer}
          onChange={(e) => setSelectedTokenizer(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="cl100k_base">cl100k_base (GPT-4, ChatGPT)</option>
          <option value="r50k_base">r50k_base (GPT-3)</option>
          <option value="p50k_base">p50k_base (Codex)</option>
          <option value="gpt2">gpt2 (GPT-2)</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none"
      >
        Count Tokens
      </button>
    </form>
  );
}

interface ITokenCountResult {
  inputText: string;
  tokenizer: string;
  tokenCount: number;
  tokens: number[];
  metrics: ITokenizationMetrics;
  error?: string;
}

export function TokenCounterResult({ result }: { result: ITokenCountResult }) {
  if (result.error) {
    return <div className="text-red-500 mt-6">{result.error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4">Tokenization Analysis</h3>

      <div className="mb-6">
        <p className="mb-2">
          <span className="font-medium">Token Count:</span>{" "}
          <span className="text-2xl font-bold">{result.tokenCount}</span>
        </p>
        <p className="mb-2">
          <span className="font-medium">Tokenizer:</span> {result.tokenizer}
        </p>
        <p className="mb-2">
          <span className="font-medium">Input Text:</span>{" "}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {result.inputText.length > 100
              ? `${result.inputText.substring(0, 100)}...`
              : result.inputText}
          </span>
        </p>
      </div>

      <MetricsDisplay metrics={result.metrics} />
    </div>
  );
}
