// FIX: Implemented Gemini API service functions according to the guidelines.
import { GoogleGenAI, Type } from "@google/genai";
import type { SimplifiedAnalysis, AnalyzedDocument, ComparisonResult, BilingualAnalysisResult, ContractAnalysisResult, WhatIfSimulationResult, NegotiationSuggestion } from "../types";

// As per guidelines, the API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';


// --- New Negotiation Buddy Feature ---
const negotiationSchema = {
    type: Type.OBJECT,
    properties: {
        risk_explanation: {
            type: Type.STRING,
            description: "A simple, clear explanation of why the user's concern is valid or why a contract clause is potentially risky or one-sided."
        },
        suggested_clause: {
            type: Type.STRING,
            description: "A draft of a more balanced, fair, and professionally worded counter-clause that the user could propose."
        }
    },
    required: ["risk_explanation", "suggested_clause"]
};

export const getNegotiationSuggestion = async (documentText: string, userQuery: string): Promise<NegotiationSuggestion> => {
    try {
        const prompt = `
        You are an expert contract negotiation AI, acting as a "Negotiation Buddy". Your task is to help a user analyze a contract clause they are concerned about and suggest a fair counter-proposal.

        **Instructions:**
        1.  Analyze the user's query to understand their concern: "${userQuery}".
        2.  Scan the full "Contract Text" to find the clause(s) relevant to the user's query.
        3.  In the 'risk_explanation', explain in simple terms why the clause is risky, one-sided, or problematic. Be practical and clear.
        4.  In the 'suggested_clause', draft a complete, professionally worded, and more balanced counter-clause. This should be a direct replacement or addition the user could propose.
        5.  Your tone should be helpful, reassuring, and solution-oriented.
        6.  Respond ONLY with the valid JSON object.

        **Contract Text:**
        ---
        ${documentText}
        ---`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: negotiationSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error in negotiation suggestion:', error);
        throw new Error('Failed to generate a negotiation suggestion. The AI model could not process the request.');
    }
};


// --- What-If Simulation Feature ---

const whatIfSchema = {
    type: Type.OBJECT,
    properties: {
        relevant_clause: {
            type: Type.STRING,
            description: "The single, most relevant, and exact verbatim clause or sentence from the contract that addresses the user's scenario."
        },
        explanation: {
            type: Type.STRING,
            description: "A simple, clear explanation of the consequences or outcome based *only* on the provided clause. Explain what would happen according to the contract."
        }
    },
    required: ["relevant_clause", "explanation"]
};

export const getWhatIfSimulation = async (documentText: string, scenario: string): Promise<WhatIfSimulationResult> => {
    try {
        const prompt = `
        You are an expert legal AI that simulates outcomes based on contract clauses. Your task is to analyze a user's "what-if" scenario against the provided contract text.

        **Instructions:**
        1.  Read the user's scenario: "${scenario}".
        2.  Thoroughly scan the entire "Contract Text" to find the single most relevant clause that directly addresses this scenario.
        3.  Extract that clause verbatim. This is the 'relevant_clause'.
        4.  Based *only* on the text of that extracted clause, explain the potential consequences or outcome in simple, easy-to-understand language. Do not infer or add information not present in the clause. This is the 'explanation'.
        5.  If no specific clause directly addresses the scenario, state that the contract does not seem to explicitly cover this situation for the 'relevant_clause' and explain that the outcome is therefore undefined by the contract for the 'explanation'.
        6.  Respond ONLY with the valid JSON object.

        **Contract Text:**
        ---
        ${documentText}
        ---`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: whatIfSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error in What-If simulation:', error);
        throw new Error('Failed to perform simulation. The AI model could not process the request.');
    }
};


// --- Contract Analysis Feature ---

const contractAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        obligations: {
            type: Type.ARRAY,
            description: "A list of all explicit obligations for any party.",
            items: {
                type: Type.OBJECT,
                properties: {
                    who: { type: Type.STRING, description: "The party responsible for the action (e.g., 'The Client', 'The Provider')." },
                    must_do: { type: Type.STRING, description: "A clear, concise description of the required action." },
                    by_when: { type: Type.STRING, description: "The deadline for the action. If it's a specific date, format as YYYY-MM-DD. If it's recurring, describe it clearly (e.g., 'The 1st of every month')." },
                    penalty: { type: Type.STRING, description: "The penalty or consequence for failure to perform the obligation. State 'None specified' if not mentioned." },
                    source_span: { type: Type.STRING, description: "The exact quote from the contract that specifies this obligation." }
                },
                required: ["who", "must_do", "by_when", "penalty", "source_span"]
            }
        },
        key_dates: {
            type: Type.ARRAY,
            description: "A list of critical, non-payment-related dates or timeframes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    event_type: { type: Type.STRING, enum: ['Renewal Window Opens', 'Notice Period Deadline', 'Contract Expiry', 'Other'], description: "The type of event." },
                    date: { type: Type.STRING, description: "The specific date of the event in YYYY-MM-DD format. If a date is relative (e.g., '90 days before expiry'), calculate and provide the absolute date based on the contract's effective/expiry dates if available, otherwise describe the calculation." },
                    details: { type: Type.STRING, description: "Additional details about the event." },
                    source_span: { type: Type.STRING, description: "The exact quote from the contract that specifies this date." }
                },
                required: ["event_type", "date", "details", "source_span"]
            }
        },
        payment_terms: {
            type: Type.ARRAY,
            description: "A list of all payment-related terms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    amount: { type: Type.STRING, description: "The amount to be paid, including currency." },
                    due_date: { type: Type.STRING, description: "When the payment is due (e.g., 'Net 30', 'Upon receipt', a specific date as YYYY-MM-DD)." },
                    frequency: { type: Type.STRING, description: "How often the payment occurs (e.g., 'Monthly', 'One-time', 'Quarterly')." },
                    recipient: { type: Type.STRING, description: "The party receiving the payment." },
                    source_span: { type: Type.STRING, description: "The exact quote from the contract that specifies this payment term." }
                },
                required: ["amount", "due_date", "frequency", "recipient", "source_span"]
            }
        }
    },
    required: ["obligations", "key_dates", "payment_terms"]
};


export const getContractAnalysis = async (documentText: string): Promise<ContractAnalysisResult> => {
    try {
        const prompt = `
        You are a meticulous and highly accurate legal AI assistant specializing in contract analysis. Your task is to read the following contract and extract key, actionable information into a structured JSON format.

        **Instructions:**
        1.  Carefully read the entire contract text provided.
        2.  Identify all obligations, key dates (renewals, notices, expiry), and payment terms.
        3.  Extract the information and structure it precisely according to the provided JSON schema.
        4.  For all dates ('by_when', 'date'), if a specific date is mentioned, use the YYYY-MM-DD format. If the date is relative or recurring, describe it clearly and concisely (e.g., "Within 48 hours of request", "The last business day of each quarter").
        5.  For every extracted item, you MUST include the 'source_span', which is the exact, verbatim quote from the document that is the source of the information.
        6.  If no items are found for a specific category (e.g., no payment terms are mentioned), return an empty array for that category.
        7.  Respond ONLY with the valid JSON object. Do not include any introductory text or explanations.

        **Contract Text to Analyze:**
        ---
        ${documentText}
        ---`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: contractAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error in contract analysis:', error);
        throw new Error('Failed to perform contract analysis. The AI model could not process the request.');
    }
};

// --- Bilingual Analysis Feature ---

// A glossary of legal terms that must not be translated.
export const TERM_LOCK_LIST: string[] = [
    "force majeure", "indemnify", "liability", "jurisdiction",
    "heretofore", "whereas", "arbitration", "confidentiality",
    "non-disclosure", "warranties", "severability", "prima facie"
];

export const GLOSSARY_DEFINITIONS: Record<string, string> = {
    "force majeure": "A clause that frees both parties from liability or obligation when an extraordinary event or circumstance beyond their control occurs.",
    "indemnify": "To compensate someone for harm or loss.",
    "liability": "The state of being legally responsible for something.",
    "jurisdiction": "The official power to make legal decisions and judgments.",
    "heretofore": "A formal word meaning 'before this time'.",
    "whereas": "A formal word used at the beginning of a document to mean 'taking into consideration that'.",
    "arbitration": "A form of alternative dispute resolution where disputes are resolved by one or more persons, called arbitrators.",
    "confidentiality": "The state of keeping or being kept secret or private.",
    "non-disclosure": "A legal contract that outlines confidential material, knowledge, or information that the parties wish to share with one another for certain purposes, but wish to restrict access to.",
    "warranties": "A written guarantee, issued to the purchaser of an article by its manufacturer, promising to repair or replace it if necessary within a specified period of time.",
    "severability": "A provision in a contract which states that if some parts of the contract are held to be illegal or otherwise unenforceable, the remainder of the contract should still apply.",
    "prima facie": "Based on the first impression; accepted as correct until proved otherwise."
};

const bilingualAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        sentence_pairs: {
            type: Type.ARRAY,
            description: "An array of sentence pairs, aligning the original text with the translated/simplified version.",
            items: {
                type: Type.OBJECT,
                properties: {
                    original_sentence: { type: Type.STRING, description: "The original sentence from the source text." },
                    translated_sentence: { type: Type.STRING, description: "The translated and simplified version of the sentence." },
                    confidence: { type: Type.STRING, enum: ["high", "medium", "low"], description: "The AI's confidence level in the translation's accuracy and nuance." },
                    locked_terms_found: {
                        type: Type.ARRAY,
                        description: "A list of any terms from the 'Term Lock List' found in this sentence.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["original_sentence", "translated_sentence", "confidence", "locked_terms_found"]
            }
        }
    },
    required: ["sentence_pairs"]
};

export const getBilingualAnalysis = async (documentText: string, targetLanguage: string): Promise<BilingualAnalysisResult> => {
    try {
        const prompt = `
        You are an expert legal document translator and simplifier. Your task is to process a legal document, sentence by sentence, for a user who is not a native English speaker.

        **Target Language:** ${targetLanguage}
        
        **Term Lock List (MUST NOT BE TRANSLATED):**
        You absolutely MUST preserve these English terms exactly as they are in the translated output if they appear. Do not translate them.
        ---
        ${TERM_LOCK_LIST.join(', ')}
        ---

        **Instructions:**
        1. Segment the document into individual sentences or short, logical clauses.
        2. For each sentence:
           a. Provide the original English sentence.
           b. Provide a simplified translation in the target language (${targetLanguage}).
           c. If any term from the "Term Lock List" appears, it must be included in the translated sentence in its original English form, clearly identifiable.
           d. Assess your confidence (high, medium, or low) that the translation is accurate and captures the nuance of the legal text. A "low" confidence might be due to ambiguity or complex legal concepts.
           e. List which of the locked terms were found in the sentence.
        3. Respond ONLY with the requested JSON object.

        **Document to Analyze:**
        ---
        ${documentText}
        ---`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: bilingualAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error in bilingual analysis:', error);
        throw new Error('Failed to perform bilingual analysis. The AI model could not process the request.');
    }
};


// --- Existing Services ---

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise, plain-language summary of the entire document." },
        jargon: {
            type: Type.ARRAY,
            description: "A list of legal jargon found in the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING, description: "The legal term or phrase." },
                    definition: { type: Type.STRING, description: "A simple, easy-to-understand definition of the term." }
                },
                required: ["term", "definition"]
            }
        },
        potentialRisks: {
            type: Type.ARRAY,
            description: "A list of potential risks, unfavorable clauses, or ambiguous language for the user.",
            items: { type: Type.STRING }
        },
        actionableNextSteps: {
            type: Type.ARRAY,
            description: "A list of concrete, actionable next steps the user should consider.",
            items: { type: Type.STRING }
        }
    },
    required: ["summary", "jargon", "potentialRisks", "actionableNextSteps"]
};

export const simplifyDocument = async (documentText: string): Promise<SimplifiedAnalysis> => {
  try {
    const prompt = `You are an expert legal analyst. Analyze the following document and break it down for a layperson. Provide a summary, define key jargon, identify potential risks, and suggest actionable next steps. Respond in the requested JSON format.

    Document:
    ---
    ${documentText}
    ---`;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });
    
    // Per guidelines, access the text property directly and parse it.
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error('Error simplifying document:', error);
    throw new Error('Failed to simplify document. The AI model could not process the request.');
  }
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        similarities: {
            type: Type.ARRAY,
            description: "A list of key similarities between the documents, especially regarding major clauses.",
            items: { type: Type.STRING }
        },
        differences: {
            type: Type.ARRAY,
            description: "A list of critical differences between the documents. Highlight changes in rights, responsibilities, and financial terms.",
            items: { type: Type.STRING }
        },
        recommendation: {
            type: Type.STRING,
            description: "A high-level recommendation or summary of the trade-offs. For example, which document is more favorable and why."
        }
    },
    required: ["similarities", "differences", "recommendation"]
};

export const compareDocuments = async (documents: AnalyzedDocument[]): Promise<ComparisonResult> => {
    try {
        let documentsContent = "";
        documents.forEach((doc, index) => {
            documentsContent += `
    DOCUMENT ${index + 1} (${doc.fileName}):
    ---
    ${doc.originalContent}
    ---
    `;
        });
        
        const prompt = `You are an expert legal analyst. Compare and contrast the following documents. Identify key similarities and differences, and provide a concluding recommendation. Focus on the most critical aspects for a layperson. Respond in the requested JSON format.
    
    ${documentsContent}`;
    
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error comparing documents:', error);
        throw new Error('Failed to compare documents. The AI model could not process the request.');
    }
};
