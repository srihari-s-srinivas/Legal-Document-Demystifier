import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getBilingualAnalysis, GLOSSARY_DEFINITIONS, TERM_LOCK_LIST } from '../services/geminiService';
import type { AnalyzedDocument, BilingualAnalysisResult, BilingualSentencePair } from '../types';

interface BilingualViewProps {
  document: AnalyzedDocument;
  onBack: () => void;
}

const LANGUAGES = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' }
];

const highlightTerms = (text: string, terms: string[]) => {
    if (terms.length === 0) return text;
    const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
    return text.split(regex).map((part, index) =>
        terms.some(term => new RegExp(`^${term}$`, 'i').test(part))
            ? <strong key={index} className="bg-amber-200/60 px-1 rounded font-semibold text-amber-900">{part}</strong>
            : part
    );
};

export const BilingualView: React.FC<BilingualViewProps> = ({ document, onBack }) => {
    const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0].code);
    //newly added
    const [open, setOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<BilingualAnalysisResult | null>(null);
    const [selectedSentence, setSelectedSentence] = useState<BilingualSentencePair | null>(null);
    
    // State for editing
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    const runAnalysis = useCallback(async (lang: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await getBilingualAnalysis(document.originalContent, LANGUAGES.find(l => l.code === lang)?.name || 'English');
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [document.originalContent]);

    useEffect(() => {
        runAnalysis(targetLanguage);
    }, [targetLanguage, runAnalysis]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTargetLanguage(e.target.value);
    };

    const handleStartEdit = (index: number, text: string) => {
        setEditingIndex(index);
        setEditText(text);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditText('');
    };
    
    const handleSaveEdit = () => {
        if (editingIndex === null || !analysisResult) return;
        const newPairs = [...analysisResult.sentence_pairs];
        newPairs[editingIndex].translated_sentence = editText;
        setAnalysisResult({ sentence_pairs: newPairs });
        handleCancelEdit();
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Bilingual Simplification</h2>
                    <p className="text-slate-500 mt-1">File: <span className="font-medium text-slate-700">{document.fileName}</span></p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative inline-block w-64">
  {/* Trigger button */}
  <button
    onClick={() => setOpen(!open)}
    className="w-full flex justify-between items-center bg-white border border-slate-300 rounded-lg shadow-sm px-4 py-2 text-slate-700 font-semibold hover:border-blue-500"
  >
    {LANGUAGES.find(l => l.code === targetLanguage)?.name}
    <span className="ml-2">▼</span>
  </button>

  {/* Dropdown list */}
  {open && (
    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      {LANGUAGES.map(lang => (
        <div
          key={lang.code}
          onClick={() => {
            setTargetLanguage(lang.code);
            setOpen(false);
          }}
          className={`px-4 py-2 cursor-pointer transition-colors ${
            targetLanguage === lang.code
              ? "bg-blue-500 text-white font-bold"
              : "hover:bg-blue-100 text-slate-700"
          }`}
        >
          {lang.name}
        </div>
      ))}
    </div>
  )}
</div>

                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        Dashboard
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200">
                {isLoading && (
                    <div className="text-center p-12">
                         <h2 className="text-2xl font-semibold text-slate-700">Generating Translation...</h2>
                         <div className="mt-6 flex justify-center items-center space-x-2">
                             <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                             <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                             <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce"></div>
                         </div>
                    </div>
                )}
                {error && <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200"><p className="text-red-700 font-medium">{error}</p></div>}
                
                {analysisResult && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 text-sm">
                        {/* Headers */}
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 px-3">Original (English)</h3>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 px-3">Simplified ({LANGUAGES.find(l => l.code === targetLanguage)?.name})</h3>
                        
                        {/* Sentence Pairs */}
                        <div className="col-span-1 lg:col-span-2 border-t border-slate-200 -mx-6" />
                        {analysisResult.sentence_pairs.map((pair, index) => {
                             const isLowConfidence = pair.confidence === 'low';
                             const isEditing = editingIndex === index;

                            return (
                                <div key={index} className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-6 col-span-1 lg:col-span-2 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors -mx-6" onClick={() => !isEditing && setSelectedSentence(pair)}>
                                    {/* Original */}
                                    <div className="p-3 leading-relaxed text-slate-700">
                                        {highlightTerms(pair.original_sentence, pair.locked_terms_found)}
                                    </div>
                                    {/* Translated */}
                                    <div className={`relative p-3 leading-relaxed text-slate-800 ${isLowConfidence ? 'bg-yellow-50/70' : ''}`}>
                                        {isLowConfidence && <div className="absolute top-2 right-2 text-yellow-500" title="Low confidence translation"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div>}
                                       
                                        {isEditing ? (
                                             <div>
                                                <textarea 
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full h-24 p-2 border border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-2 ring-blue-500"
                                                    aria-label="Edit translation"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={handleSaveEdit} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700">Save</button>
                                                    <button onClick={handleCancelEdit} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); handleStartEdit(index, pair.translated_sentence); }} className="absolute top-1.5 left-1.5 text-slate-400 hover:text-blue-600 opacity-0 hover:opacity-100 p-1 rounded-full transition-opacity group-hover:opacity-100" title="Edit this sentence">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                                </button>
                                                <p>{highlightTerms(pair.translated_sentence, pair.locked_terms_found)}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            
            {/* Glossary Popover Modal */}
            {selectedSentence && (
                 <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSentence(null)} role="dialog" aria-modal="true" aria-labelledby="glossary-title">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 p-6" onClick={e => e.stopPropagation()}>
                        <h3 id="glossary-title" className="text-lg font-bold text-slate-800 mb-4">Clause Details</h3>
                        <div className="space-y-4">
                           <div>
                                <h4 className="font-semibold text-slate-600 text-sm mb-1">Original Clause</h4>
                                <p className="bg-slate-50 p-3 rounded-lg text-slate-800 border border-slate-200">{selectedSentence.original_sentence}</p>
                           </div>
                           {selectedSentence.locked_terms_found.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-slate-600 text-sm mb-2">Legal Terms Found</h4>
                                    <div className="space-y-2">
                                        {selectedSentence.locked_terms_found.map(term => (
                                            <div key={term}>
                                                <p className="font-semibold text-slate-800">{term}</p>
                                                <p className="text-slate-600 text-sm">{GLOSSARY_DEFINITIONS[term.toLowerCase()] || 'No definition available.'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                           )}
                        </div>
                         <button onClick={() => setSelectedSentence(null)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-200" aria-label="Close glossary">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
