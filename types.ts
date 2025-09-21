// types.ts

// User and session types
export interface User {
  id: string;
  name: string;
  email: string;
  contactNumber?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  dob?: string; // Stored as YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation?: string;
  profilePictureUrl?: string; // Can be a data URL or a link to an uploaded image
}

// Document-related types
export type DocumentStatus = 'pending' | 'analyzing' | 'complete' | 'error';
export type ContractAnalysisStatus = 'none' | 'pending' | 'complete' | 'error';

export interface SimplifiedAnalysis {
  summary: string;
  jargon: {
    term: string;
    definition: string;
  }[];
  potentialRisks: string[];
  actionableNextSteps: string[];
}

export interface AnalyzedDocument {
  id: string;
  fileName: string;
  originalContent: string;
  analysis: SimplifiedAnalysis | null;
  status: DocumentStatus;
  contractAnalysis: ContractAnalysisResult | null;
  contractAnalysisStatus: ContractAnalysisStatus;
}

// Gemini service result types
export interface ComparisonResult {
  similarities: string[];
  differences: string[];
  recommendation: string;
}

export interface WhatIfSimulationResult {
    relevant_clause: string;
    explanation: string;
}

// --- New Negotiation Buddy Types ---
export interface NegotiationSuggestion {
    risk_explanation: string;
    suggested_clause: string;
}

// Chatbot types
export interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  text?: string;
  suggestion?: NegotiationSuggestion;
  error?: boolean;
}


// Bilingual analysis types
export interface BilingualSentencePair {
    original_sentence: string;
    translated_sentence: string;
    confidence: "high" | "medium" | "low";
    locked_terms_found: string[];
}

export interface BilingualAnalysisResult {
    sentence_pairs: BilingualSentencePair[];
}

// Contract analysis & reminders types
export interface ContractObligation {
    who: string;
    must_do: string;
    by_when: string;
    penalty: string;
    source_span: string;
}

export interface KeyDate {
    event_type: 'Renewal Window Opens' | 'Notice Period Deadline' | 'Contract Expiry' | 'Other';
    date: string;
    details: string;
    source_span: string;
}

export interface PaymentTerm {
    amount: string;
    due_date: string;
    frequency: string;
    recipient: string;
    source_span: string;
}

export interface ContractAnalysisResult {
    obligations: ContractObligation[];
    key_dates: KeyDate[];
    payment_terms: PaymentTerm[];
}
