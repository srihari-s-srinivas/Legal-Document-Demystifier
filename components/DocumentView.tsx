import React, { useState } from 'react';
import type { SimplifiedAnalysis, ChatMessage } from '../types';
import { NegotiationBuddy } from './NegotiationBuddy';
import { WhatIfSimulator } from './WhatIfSimulator'; // Import the new component
import { getNegotiationSuggestion } from '../services/geminiService';


interface DocumentViewProps {
  originalContent: string;
  analysis: SimplifiedAnalysis;
  fileName: string;
  onReset: () => void;
}

const AnalysisCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, color: 'blue' | 'amber' | 'green' }> = ({ title, icon, children, color }) => {
    const colors = {
        blue: 'border-blue-200 bg-blue-50',
        amber: 'border-amber-200 bg-amber-50',
        green: 'border-green-200 bg-green-50',
    };

    return (
         <div className={`rounded-xl border ${colors[color]} overflow-hidden`}>
            <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                </div>
                <div className="text-slate-700 space-y-2 prose prose-sm max-w-none">
                    {children}
                </div>
            </div>
        </div>
    )
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  originalContent,
  analysis,
  fileName,
  onReset,
}) => {
  const [negotiationHistory, setNegotiationHistory] = useState<ChatMessage[]>([]);
  const [isNegotiationLoading, setIsNegotiationLoading] = useState(false);

  const handleSendNegotiationMessage = async (message: string) => {
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: message };
    setNegotiationHistory(prev => [...prev, userMessage]);
    setIsNegotiationLoading(true);

    try {
      const suggestion = await getNegotiationSuggestion(originalContent, message);
      const modelMessage: ChatMessage = { id: Date.now() + 1, role: 'model', suggestion };
      setNegotiationHistory(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error("Negotiation Buddy failed:", err);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
        error: true
      };
      setNegotiationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsNegotiationLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Document Analysis</h2>
            <p className="text-slate-500 mt-1">File: <span className="font-medium text-slate-700">{fileName}</span></p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Analysis */}
        <div className="space-y-6">
            <AnalysisCard title="Simplified Summary" color="blue" icon={<svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}>
                <p>{analysis.summary}</p>
            </AnalysisCard>
            
            {/* Negotiation Buddy */}
            <NegotiationBuddy
              messages={negotiationHistory}
              onSendMessage={handleSendNegotiationMessage}
              isLoading={isNegotiationLoading}
            />

            {/* What-If Simulator */}
            <WhatIfSimulator originalContent={originalContent} />

            <AnalysisCard title="Jargon Explained" color="blue" icon={<svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /></svg>}>
                {analysis.jargon.length > 0 ? (
                    <div className="space-y-3">
                        {analysis.jargon.map(item => (
                            <div key={item.term}>
                                <p className="font-semibold text-slate-800">{item.term}</p>
                                <p className="text-slate-600 !mt-1">{item.definition}</p>
                            </div>
                        ))}
                    </div>
                 ) : <p className="text-slate-500">No specific legal jargon was identified.</p>}
            </AnalysisCard>

             <AnalysisCard title="Potential Risks & Considerations" color="amber" icon={<svg className="w-6 h-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}>
                 {analysis.potentialRisks.length > 0 ? (
                    <ul className="list-disc list-outside space-y-2 pl-5">
                        {analysis.potentialRisks.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                 ) : <p className="list-none text-slate-500">The AI did not identify any significant risks.</p>}
            </AnalysisCard>
            
            <AnalysisCard title="Actionable Next Steps" color="green" icon={<svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                 {analysis.actionableNextSteps.length > 0 ? (
                    <ul className="list-disc list-outside space-y-2 pl-5">
                        {analysis.actionableNextSteps.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                 ) : <p className="list-none text-slate-500">No specific next steps were suggested by the AI.</p>}
            </AnalysisCard>

        </div>

        {/* Right Side: Original Document */}
        <div>
            <div className="sticky top-28">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Original Document</h3>
                <div className="h-[calc(100vh-12rem)] bg-white p-4 border border-slate-200 rounded-xl shadow-sm overflow-y-auto text-slate-600 text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{originalContent}</pre>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};