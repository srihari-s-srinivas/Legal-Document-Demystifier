import React from 'react';
import type { AnalyzedDocument, ComparisonResult } from '../types';

// FIX: Defined the missing ComparisonViewProps interface to resolve a TypeScript error.
interface ComparisonViewProps {
  documents: AnalyzedDocument[];
  result: ComparisonResult | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ documents, result, isLoading, error, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Document Comparison</h2>
                <div className="text-slate-500 mt-1">Comparing <span className="font-medium text-slate-700">{documents.length}</span> documents: 
                    <span className="italic"> {documents.map(d => d.fileName).join(', ')}</span>
                </div>
            </div>
            <button
                onClick={onBack}
                 className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Dashboard
            </button>
        </div>
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 min-h-[300px]">
            {isLoading && (
                 <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-semibold text-slate-700">Comparing documents...</h2>
                    <p className="text-slate-500 mt-2">The AI is analyzing the texts. This might take a moment.</p>
                    <div className="mt-6 flex justify-center items-center space-x-2">
                         <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                         <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                         <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}
            
            {error && (
                 <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                    <h2 className="text-2xl font-semibold text-red-700">Comparison Failed</h2>
                    <p className="text-slate-600 mt-2">{error}</p>
                </div>
            )}

            {!isLoading && result && (
                <div className="space-y-8">
                    {/* Similarities */}
                    <div className="p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <svg className="w-6 h-6 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                            <h3 className="text-xl font-semibold text-slate-800">Key Similarities</h3>
                        </div>
                        <ul className="list-disc list-outside space-y-2 text-slate-700 pl-5">
                            {result.similarities.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>

                    {/* Differences */}
                    <div className="p-5 rounded-xl border border-amber-200 bg-amber-50">
                        <div className="flex items-center gap-3 mb-3">
                            <svg className="w-6 h-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            <h3 className="text-xl font-semibold text-amber-900">Critical Differences</h3>
                        </div>
                        <ul className="list-disc list-outside space-y-2 text-amber-800 pl-5">
                             {result.differences.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    
                    {/* Recommendation */}
                     <div className="p-5 rounded-xl border border-blue-200 bg-blue-50">
                        <div className="flex items-center gap-3 mb-3">
                           <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           <h3 className="text-xl font-semibold text-blue-900">AI Recommendation</h3>
                        </div>
                        <p className="text-blue-800">{result.recommendation}</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
