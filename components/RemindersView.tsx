import React, { useState, useMemo } from 'react';
import type { AnalyzedDocument, ContractAnalysisResult, ContractObligation, KeyDate, PaymentTerm } from '../types';
import { createIcsFileContent } from '../utils/icsGenerator';

interface RemindersViewProps {
  document: AnalyzedDocument;
  analysis: ContractAnalysisResult;
  onBack: () => void;
}

const InfoCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const ObligationItem: React.FC<{ item: ContractObligation }> = ({ item }) => (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="font-semibold text-slate-800">{item.must_do}</p>
        <div className="mt-2 text-sm text-slate-600 space-y-1">
            <p><span className="font-medium text-slate-500">Who:</span> {item.who}</p>
            <p><span className="font-medium text-slate-500">When:</span> {item.by_when}</p>
            <p><span className="font-medium text-slate-500">Penalty:</span> {item.penalty}</p>
            <details className="mt-1">
                <summary className="cursor-pointer text-xs font-semibold text-blue-600">Show source</summary>
                <blockquote className="mt-1 text-xs italic text-slate-500 border-l-2 border-slate-300 pl-2">"{item.source_span}"</blockquote>
            </details>
        </div>
    </div>
);

const KeyDateItem: React.FC<{ item: KeyDate }> = ({ item }) => (
     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="font-semibold text-slate-800">{item.event_type}</p>
        <div className="mt-2 text-sm text-slate-600 space-y-1">
            <p><span className="font-medium text-slate-500">Date:</span> {item.date}</p>
            <p><span className="font-medium text-slate-500">Details:</span> {item.details}</p>
             <details className="mt-1">
                <summary className="cursor-pointer text-xs font-semibold text-blue-600">Show source</summary>
                <blockquote className="mt-1 text-xs italic text-slate-500 border-l-2 border-slate-300 pl-2">"{item.source_span}"</blockquote>
            </details>
        </div>
    </div>
);

const PaymentTermItem: React.FC<{ item: PaymentTerm }> = ({ item }) => (
     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="font-semibold text-slate-800">{item.amount}</p>
        <div className="mt-2 text-sm text-slate-600 space-y-1">
            <p><span className="font-medium text-slate-500">Frequency:</span> {item.frequency}</p>
            <p><span className="font-medium text-slate-500">Due:</span> {item.due_date}</p>
            <p><span className="font-medium text-slate-500">To:</span> {item.recipient}</p>
            <details className="mt-1">
                <summary className="cursor-pointer text-xs font-semibold text-blue-600">Show source</summary>
                <blockquote className="mt-1 text-xs italic text-slate-500 border-l-2 border-slate-300 pl-2">"{item.source_span}"</blockquote>
            </details>
        </div>
    </div>
);

// FIX: Renamed the `document` prop to `doc` to avoid shadowing the global `window.document` object.
export const RemindersView: React.FC<RemindersViewProps> = ({ document: doc, analysis, onBack }) => {
    const [filter, setFilter] = useState(false);

    const tryParseDate = (dateStr: string): Date | null => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const filteredObligations = useMemo(() => {
        if (!filter) return analysis.obligations;
        return analysis.obligations.filter(item => {
            const date = tryParseDate(item.by_when);
            return date && date <= next30Days;
        });
    }, [filter, analysis.obligations]);
    
    const filteredKeyDates = useMemo(() => {
        if (!filter) return analysis.key_dates;
        return analysis.key_dates.filter(item => {
            const date = tryParseDate(item.date);
            return date && date <= next30Days;
        });
    }, [filter, analysis.key_dates]);

    const handleExport = () => {
        const events = [
            ...analysis.obligations.map(o => ({ summary: `DO: ${o.must_do} (for ${o.who})`, description: `Penalty: ${o.penalty}\nSource: "${o.source_span}"`, dateString: o.by_when })),
            ...analysis.key_dates.map(k => ({ summary: `DEADLINE: ${k.event_type}`, description: `Details: ${k.details}\nSource: "${k.source_span}"`, dateString: k.date }))
        ];

        const icsContent = createIcsFileContent(events);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        // FIX: Use the renamed `doc` prop instead of the shadowed `document`.
        link.setAttribute("download", `${doc.fileName.replace(/[^a-zA-Z0-9]/g, '_')}_reminders.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Contract Reminders</h2>
                    {/* FIX: Use the renamed `doc` prop instead of the shadowed `document`. */}
                    <p className="text-slate-500 mt-1">File: <span className="font-medium text-slate-700">{doc.fileName}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        Dashboard
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center">
                    <label htmlFor="filter" className="font-semibold text-slate-700 mr-4">Show:</label>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
                        <button onClick={() => setFilter(false)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${!filter ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}>All Upcoming</button>
                        <button onClick={() => setFilter(true)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}>Due Next 30 Days</button>
                    </div>
                </div>
                 <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    Export to Calendar (.ics)
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InfoCard title="Upcoming Obligations" icon={<svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    {filteredObligations.length > 0 ? filteredObligations.map((item, i) => <ObligationItem key={i} item={item} />) : <p className="text-sm text-slate-500">No obligations found{filter && " in the next 30 days"}.</p>}
                </InfoCard>
                <InfoCard title="Key Dates" icon={<svg className="w-6 h-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>}>
                     {filteredKeyDates.length > 0 ? filteredKeyDates.map((item, i) => <KeyDateItem key={i} item={item} />) : <p className="text-sm text-slate-500">No key dates found{filter && " in the next 30 days"}.</p>}
                </InfoCard>
                <InfoCard title="Payment Schedule" icon={<svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-9 12.75h5.25m-5.25 0h-5.25m5.25 0V18a2.25 2.25 0 012.25-2.25h.096c.55 0 1.07.232 1.44.621m-6.096-2.271a2.25 2.25 0 012.25-2.25h.096a2.25 2.25 0 012.25 2.25v.096C14.528 17.159 13.918 18 13.125 18h-2.25a2.25 2.25 0 01-2.25-2.25v-.096z" /></svg>}>
                    {analysis.payment_terms.length > 0 ? analysis.payment_terms.map((item, i) => <PaymentTermItem key={i} item={item} />) : <p className="text-sm text-slate-500">No payment terms specified.</p>}
                </InfoCard>
            </div>
        </div>
    );
};
