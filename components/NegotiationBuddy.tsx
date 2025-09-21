import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface NegotiationBuddyProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const NegotiationBuddy: React.FC<NegotiationBuddyProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.suggestion) {
      return (
        <div className="space-y-3">
            <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-1">Explanation:</h4>
                <p className="text-slate-600">{message.suggestion.risk_explanation}</p>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-1">Suggested Counter-Clause:</h4>
                <blockquote className="p-3 bg-slate-100 text-slate-800 border-l-4 border-slate-300 italic rounded-r-md">
                    "{message.suggestion.suggested_clause}"
                </blockquote>
            </div>
            {/* Disclaimer */}
            <div className="!mt-4 pt-2 border-t border-amber-200">
                 <p className="text-xs font-semibold text-amber-800 text-center">
                    <span className="font-bold">Disclaimer:</span> This is an AI-generated suggestion, not legal advice. Consult a qualified lawyer.
                </p>
            </div>
        </div>
      );
    }
    return <p className="whitespace-pre-wrap">{message.text}</p>;
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
            <svg className="w-7 h-7 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 005.68 9.348v2.695m11.667 0l-3.181-3.183a8.25 8.25 0 00-11.667 0l-3.181 3.183" />
            </svg>
            <h3 className="text-xl font-bold text-slate-800">Negotiation Buddy</h3>
        </div>

        {/* Chat History */}
        <div className="h-64 overflow-y-auto pr-2 mb-4 space-y-4 text-sm">
            {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-500">
                    <p className="font-semibold">Ask for negotiation advice!</p>
                    <p className="text-xs mt-1">e.g., "This indemnity clause seems one-sided, can you help me draft a better one?"</p>
                </div>
            )}
            {messages.map((message) => (
                 <div key={message.id} className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'model' && (
                        <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">AI</div>
                    )}
                    <div
                        className={`max-w-md p-3 rounded-2xl ${
                        message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-lg'
                            : message.error ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-lg' : 'bg-slate-100 text-slate-800 rounded-bl-lg'
                        }`}
                    >
                       {renderMessageContent(message)}
                    </div>
                 </div>
            ))}
             {isLoading && (
                <div className="flex justify-start items-end gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">AI</div>
                    <div className="max-w-xs p-3 rounded-2xl rounded-bl-lg bg-slate-200 text-slate-800">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
         <form onSubmit={handleSendMessage}>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Ask for a counter-clause...'
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </form>
    </div>
  );
};