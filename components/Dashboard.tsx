import React, { useState, useMemo } from 'react';
import { FileUpload } from './FileUpload';
import type { AnalyzedDocument, ContractAnalysisStatus } from '../types';

interface DashboardProps {
  documents: AnalyzedDocument[];
  onAddFiles: (files: { fileName: string, content: string }[]) => void;
  onAnalyze: (docIds: string[]) => void;
  onView: (docId: string) => void;
  onCompare: (documents: AnalyzedDocument[]) => void;
  onTranslate: (docId: string) => void;
  onAnalyzeForReminders: (docId: string) => void;
  onViewReminders: (docId: string) => void;
}

const StatusBadge: React.FC<{ status: AnalyzedDocument['status'] | ContractAnalysisStatus, type?: 'main' | 'contract' }> = ({ status, type='main' }) => {
    const statusStyles: { [key: string]: string } = {
        pending: 'bg-slate-100 text-slate-600',
        analyzing: 'bg-blue-100 text-blue-700 animate-pulse',
        complete: 'bg-green-100 text-green-700',
        error: 'bg-red-100 text-red-700',
        // Contract-specific
        none: '',
    };
    if (status === 'none') return null;

    // FIX: Explicitly type `text` as string to allow assignment of custom display strings.
    let text: string = status;
    if (type === 'contract' && status === 'pending') text = 'analyzing for reminders';
    if (type === 'contract' && status === 'complete') text = 'reminders ready';

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
            {text}
        </span>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ documents, onAddFiles, onAnalyze, onView, onCompare, onTranslate, onAnalyzeForReminders, onViewReminders }) => {
    const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

    const pendingCount = useMemo(() => documents.filter(d => d.status === 'pending').length, [documents]);
    const isAnalyzing = useMemo(() => documents.some(d => d.status === 'analyzing'), [documents]);

    const handleAnalyzeClick = () => {
        const pendingIds = documents.filter(d => d.status === 'pending').map(d => d.id);
        if (pendingIds.length > 0) {
            onAnalyze(pendingIds);
        }
    };
    
    const handleToggleSelection = (docId: string) => {
        setSelectedDocs(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(docId)) {
                newSelection.delete(docId);
            } else {
                newSelection.add(docId);
            }
            return newSelection;
        });
    };

    const handleCompareClick = () => {
        const docsToCompare = documents.filter(doc => selectedDocs.has(doc.id));
        if (docsToCompare.length > 1) {
            onCompare(docsToCompare);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Document Dashboard</h2>
                    <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Upload documents to get a simplified analysis, create reminders, and compare versions with AI.</p>
                </div>

                <div className="mt-8">
                    <FileUpload onFilesSelected={onAddFiles} />
                </div>
                
                {pendingCount > 0 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={isAnalyzing}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all text-base"
                        >
                            {isAnalyzing ? 'Analyzing...' : `Analyze ${pendingCount} New Document(s)`}
                        </button>
                    </div>
                )}
            </div>

            {documents.length > 0 && (
                <div className="bg-white mt-8 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Your Documents</h3>
                         <button
                            onClick={handleCompareClick}
                            disabled={selectedDocs.size < 2}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
                            Compare Selected ({selectedDocs.size})
                        </button>
                    </div>
                   
                    <div className="space-y-4">
                        {documents.map(doc => (
                            <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-4 flex-grow">
                                    {doc.status === 'complete' && (
                                        <input 
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                            checked={selectedDocs.has(doc.id)}
                                            onChange={() => handleToggleSelection(doc.id)}
                                            aria-label={`Select ${doc.fileName}`}
                                        />
                                    )}
                                    {doc.status !== 'complete' && <div className="w-5 h-5 flex-shrink-0"></div>}
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800 break-all">{doc.fileName}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                           <StatusBadge status={doc.status} type="main" />
                                           <StatusBadge status={doc.contractAnalysisStatus} type="contract" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-2 flex-wrap justify-end">
                                    {doc.status === 'complete' && (
                                      <>
                                        <button 
                                            onClick={() => onView(doc.id)}
                                            className="px-4 py-2 text-sm bg-blue-100 text-blue-800 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            View Analysis
                                        </button>
                                        <button 
                                            onClick={() => onTranslate(doc.id)}
                                            className="px-4 py-2 text-sm bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            Translate
                                        </button>
                                        
                                        {doc.contractAnalysisStatus === 'none' && 
                                            <button onClick={() => onAnalyzeForReminders(doc.id)} className="px-4 py-2 text-sm bg-purple-100 text-purple-800 font-semibold rounded-lg hover:bg-purple-200 transition-colors">Analyze for Reminders</button>
                                        }
                                        {doc.contractAnalysisStatus === 'pending' && 
                                            <button disabled className="px-4 py-2 text-sm bg-purple-100 text-purple-800 font-semibold rounded-lg animate-pulse">Analyzing...</button>
                                        }
                                         {doc.contractAnalysisStatus === 'complete' && 
                                            <button onClick={() => onViewReminders(doc.id)} className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">View Reminders</button>
                                        }
                                         {doc.contractAnalysisStatus === 'error' && 
                                            <button onClick={() => onAnalyzeForReminders(doc.id)} className="px-4 py-2 text-sm bg-red-100 text-red-800 font-semibold rounded-lg hover:bg-red-200 transition-colors">Retry</button>
                                        }
                                      </>
                                    )}
                                    {doc.status === 'error' && (
                                         <button 
                                            onClick={() => onAnalyze([doc.id])}
                                            className="px-4 py-2 text-sm bg-amber-100 text-amber-800 font-semibold rounded-lg hover:bg-amber-200 transition-colors"
                                        >
                                            Retry Analysis
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
