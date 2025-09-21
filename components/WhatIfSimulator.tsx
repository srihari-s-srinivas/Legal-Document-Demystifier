import React, { useState } from 'react';
import { getWhatIfSimulation } from '../services/geminiService';
import type { WhatIfSimulationResult } from '../types';

interface WhatIfSimulatorProps {
  originalContent: string;
}

const STARTER_PROMPTS = [
  "What if a payment is late?",
  "What if I terminate the contract early?",
  "What if the service quality is poor?",
];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ originalContent }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhatIfSimulationResult | null>(null);

  const handleSimulate = async (scenario: string) => {
    if (!scenario.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const simulationResult = await getWhatIfSimulation(originalContent, scenario);
      setResult(simulationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSimulate(query);
  };

  const handleStarterClick = (prompt: string) => {
    setQuery(prompt);
    handleSimulate(prompt);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-7 h-7 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
        <h3 className="text-xl font-bold text-slate-800">What-If Simulator</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ask a "what-if" question...'
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '...' : 'Ask'}
          </button>
        </div>
      </form>
      
      <div className="text-sm mt-3 text-slate-500">
        Try:
        {STARTER_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleStarterClick(prompt)}
            className="ml-2 text-purple-600 font-semibold hover:underline disabled:text-slate-400 disabled:no-underline"
            disabled={isLoading}
          >
            "{prompt}"
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[100px]">
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <div className="flex items-center space-x-2 text-slate-500">
                <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></div>
                <span className="text-sm">Simulating outcome...</span>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</p>}
        {result && (
          <div className="space-y-4 text-sm">
            <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-1">Relevant Clause:</h4>
                <blockquote className="p-3 bg-slate-100 text-slate-800 border-l-4 border-slate-300 italic rounded-r-md">
                    "{result.relevant_clause}"
                </blockquote>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-1">Explanation of Outcome:</h4>
                <p className="text-slate-600">{result.explanation}</p>
            </div>
            {/* Disclaimer */}
            <div className="!mt-4 pt-3 border-t border-amber-200">
                 <p className="text-xs font-semibold text-amber-800 text-center">
                    <span className="font-bold">Disclaimer:</span> This is an AI-generated simulation, not legal advice. Consult a qualified lawyer.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
