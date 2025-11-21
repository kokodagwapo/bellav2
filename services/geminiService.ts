import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { FormData } from '../types';
import { knowledgeBase } from '../bellaKnowledgeBase';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

const systemInstruction = `You are Bella, an AI mortgage assistant. Your personality is SUPER friendly, casual, fun, and lighthearted. You're like that cool friend who knows everything about mortgages but never makes you feel dumb or stressed. You're NOT serious or corporate - you're warm, approachable, and make everything feel easy.

IMPORTANT - SPEAK LIKE A REAL PERSON, NOT A ROBOT: When responding, talk like you're texting a friend or having coffee together. Be natural and relaxed:
- ALWAYS use contractions (I'm, you're, don't, can't, won't, it's, that's, we'll, etc.) - never use formal language
- Mix up your sentence length - throw in short punchy sentences with longer ones
- Use casual phrases naturally: "you know", "actually", "so", "well", "I mean", "honestly", "seriously", "like"
- Sound excited and enthusiastic when it's good news, empathetic when it's tough
- Use casual expressions: "no worries", "totally", "absolutely", "for sure", "yeah", "yep"
- Add personality - be a little playful, use humor when appropriate
- Never sound like you're reading from a script - be spontaneous
- Use "um" or "uh" very occasionally if it feels natural (but don't overdo it)
- Speak directly and personally - use "you" and "I" a lot
- Keep it light and fun - mortgages are boring, but you're not!
- Don't be overly formal or professional-sounding - be yourself!

CONVERSATION STYLE - BE INTERACTIVE AND ENGAGING:
- ALWAYS ask questions to keep the conversation flowing naturally - don't just answer and stop
- Show genuine interest in the borrower's situation - be curious and engaged
- Respond to what they say, don't just give generic answers
- If they ask a question, answer it directly and then ALWAYS ask a follow-up question to continue the conversation
- Make it feel like a real conversation, not a Q&A session - you're having a chat, not conducting an interview
- Be curious about their goals, concerns, and preferences - ask "what", "why", "how" questions
- Use their name if they've shared it - personalize the conversation
- Reference things they've mentioned earlier in the conversation - show you're listening
- Keep responses conversational length (2-4 sentences typically, unless they ask for more detail)
- After answering, ALWAYS end with a question to keep them engaged: "What do you think?", "Have you considered...?", "What's your biggest concern about...?", "Tell me more about...", "How does that sound?"
- If they give a short answer, ask a deeper follow-up question to understand their situation better
- Be proactive - if they seem stuck or confused, ask "What questions do you have?" or "What would be most helpful right now?"

LIVE AGENTIC MODE - BE PROACTIVE AND CONTEXTUAL:
- When in live guide mode, observe what the user is doing and provide helpful context
- If they're on the landing page, offer to help them get started
- If they're filling out forms, explain what each section means
- If they're looking at documents, explain what they need
- If they seem confused or stuck, proactively offer help
- Guide them naturally through the process without being pushy
- Celebrate their progress and make them feel accomplished
- Be their friendly guide, not a scripted narrator

You operate with dual expertise:
1. SILENT UNDERWRITER: You work behind the scenes to ensure loan applications are complete, accurate, and ready for approval. You review documentation, verify calculations, check requirements, and catch issues early.
2. LOAN OFFICER: You guide borrowers through every step, explain complex terms simply, recommend best loan products, answer questions, and advocate for borrowers to get the best rates and terms.

You have comprehensive knowledge of mortgage compliance and regulations for all 50 states, including state-specific disclosure requirements, licensing rules, interest rate caps, prepayment penalties, foreclosure procedures, property tax exemptions, homestead protections, and all state-specific lending laws.

You help borrowers save TIME by auto-filling forms, avoiding duplicate questions, pre-validating information, organizing documents upfront, and guiding them through the fastest approval path.

You help borrowers save MONEY by ensuring optimal credit profiles, recommending best loan products, identifying rate reduction opportunities, negotiating fees, minimizing down payments when appropriate, reducing closing costs, and ensuring borrowers get the best deals.

You MUST use the provided knowledge base to answer questions and guide the conversation. The knowledge base is a structured JSON containing information on your persona, loan types, emotional support phrases, conversation flow rules, state compliance regulations, time-saving strategies, and money-saving strategies.

When a user provides information relevant to a loan application, extract it. The user's input could be text or a transcription of their voice.

Knowledge Base:
${JSON.stringify(knowledgeBase)}
`;

// New function for intelligent chat replies
export const getBellaChatReply = async (chatHistory: { role: 'user' | 'model', text: string }[]): Promise<string> => {
    const contents = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: contents,
            config: { systemInstruction: systemInstruction },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting Bella chat reply:", error);
        return "I'm having a little trouble connecting right now. Could you try asking that again in a moment?";
    }
};


// New function to extract data from conversational text
export const analyzeTextForData = async (text: string): Promise<Partial<FormData>> => {
    const prompt = `Analyze the following text from a user and extract any information that matches the loan application schema. Text: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        loanPurpose: { type: Type.STRING, enum: ['Purchase a Home', 'Refinance'] },
                        propertyType: { type: Type.STRING, enum: ['Single Family Home', 'Condominium', 'Townhouse', 'Multi-Family Home'] },
                        propertyUse: { type: Type.STRING, enum: ['Primary Residence', 'Second Home', 'Investment Property'] },
                        purchasePrice: { type: Type.NUMBER },
                        downPayment: { type: Type.NUMBER },
                        loanAmount: { type: Type.NUMBER },
                        estimatedPropertyValue: { type: Type.NUMBER },
                        creditScore: { type: Type.STRING, enum: ['Excellent (740+)', 'Good (700-739)', 'Average (640-699)', 'Fair (580-639)'] },
                        location: { type: Type.STRING },
                        isFirstTimeBuyer: { type: Type.BOOLEAN },
                        isMilitary: { type: Type.BOOLEAN },
                        fullName: { type: Type.STRING },
                        email: { type: Type.STRING },
                        phoneNumber: { type: Type.STRING },
                        income: { type: Type.NUMBER },
                    },
                },
            },
        });
        return JSON.parse(response.text.trim()) as Partial<FormData>;
    } catch (error) {
        console.error("Error analyzing text for data:", error);
        return {};
    }
};

// New function for TTS - tries OpenAI first (more natural), falls back to Gemini
export const generateBellaSpeech = async (text: string): Promise<string | null> => {
    // Try OpenAI first if available
    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const hasValidOpenAiKey = openAiKey && 
                               openAiKey !== 'your_openai_api_key_here' && 
                               openAiKey.trim().length > 0 &&
                               openAiKey.startsWith('sk-');
    
    if (hasValidOpenAiKey) {
        try {
            console.log("🎯 Attempting OpenAI TTS (Nova voice - most natural)...");
            const { generateBellaSpeechOpenAI } = await import('./openaiTtsService');
            const openAiAudio = await generateBellaSpeechOpenAI(text);
            if (openAiAudio) {
                console.log("✅ OpenAI TTS successful! Using Nova voice.");
                return openAiAudio;
            } else {
                console.log("⚠️ OpenAI TTS returned null, falling back to Gemini TTS");
            }
        } catch (error: any) {
            console.error("❌ OpenAI TTS error:", error?.message || error);
            console.log("   Falling back to Gemini TTS");
        }
    } else {
        if (!openAiKey) {
            console.log("ℹ️ OpenAI API key not set in .env file, using Gemini TTS");
        } else if (openAiKey === 'your_openai_api_key_here') {
            console.log("ℹ️ OpenAI API key placeholder detected, using Gemini TTS");
        } else if (!openAiKey.startsWith('sk-')) {
            console.warn("⚠️ OpenAI API key format invalid (should start with 'sk-'), using Gemini TTS");
            console.warn("   Get a valid key from: https://platform.openai.com/api-keys");
        } else {
            console.log("ℹ️ OpenAI API key appears invalid, using Gemini TTS");
        }
    }

    // Fallback to Gemini TTS
    const geminiKey = import.meta.env.VITE_API_KEY;
    if (!geminiKey || geminiKey.trim().length === 0) {
        const errorMsg = "❌ Gemini API key (VITE_API_KEY) is missing. Please check your .env file.";
        console.error(errorMsg);
        throw new Error("API key is missing. Please check your .env file. Both OpenAI and Gemini keys are missing.");
    }

    try {
        console.log("🎯 Attempting Gemini TTS (Kore voice)...");
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Female, US accent
                },
            },
        });
        if (!response.candidates) {
            throw new Error("No candidates returned from Gemini API.");
        }
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
        if (audioData) {
            console.log("✅ Gemini TTS successful! Using Kore voice.");
        } else {
            console.error("❌ Gemini TTS returned null audio data");
        }
        return audioData;
    } catch (error: any) {
        console.error("❌ Error generating Gemini speech:", error?.message || error);
        console.error("   This may be due to: invalid API key, rate limit, or network issue");
        throw error; // Re-throw to be handled by caller
    }
}


export const extractDataFromDocument = async (file: { data: string, mimeType: string }): Promise<Partial<FormData>> => {
    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
    const normalizedMimeType = file.mimeType.toLowerCase();

    if (!validMimeTypes.some(type => normalizedMimeType.includes(type.split('/')[1]))) {
        throw new Error(`Unsupported file type: ${file.mimeType}. Please upload PDF, JPG, or PNG files.`);
    }

    // Validate base64 data exists
    if (!file.data || file.data.length === 0) {
        throw new Error("File data is empty. Please try uploading the file again.");
    }

    const documentPart = { inlineData: { data: file.data, mimeType: normalizedMimeType } };
    const textPart = {
        text: `Analyze the attached document using OCR (Optical Character Recognition). The document could be:
- Driver's License or State ID
- W-2 Form (tax document)
- Paystub or Pay Statement
- Bank Statement

Extract ALL visible text and information, then identify and extract the following fields for a mortgage application:
1. Full Name: The person's complete legal name (first, middle if present, last)
2. Income: Primary gross income/wage amount. For W-2 forms, use the annual income. For paystubs, calculate monthly income by multiplying weekly/biweekly amounts appropriately.
3. Address: Current home/residential address (street, city, state, zip code)
4. Date of Birth (DOB): Birth date in MM/DD/YYYY format

Be thorough in reading all text on the document. If a field is not found, return null for that field. Only return data that you can clearly identify from the document.`
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: { parts: [textPart, documentPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fullName: {
                            type: Type.STRING,
                            description: "The full legal name of the person as it appears on the document. Return null if not found."
                        },
                        income: {
                            type: Type.NUMBER,
                            description: "The primary gross income/wage. For W-2: annual income. For paystub: calculate monthly income. Return null if not found."
                        },
                        borrowerAddress: {
                            type: Type.STRING,
                            description: "The person's full residential/home address including street, city, state, and zip code. Return null if not found."
                        },
                        dob: {
                            type: Type.STRING,
                            description: "The person's date of birth in MM/DD/YYYY format. Return null if not found."
                        }
                    },
                },
            },
        });

        if (!response.text) {
            throw new Error("No response from OCR service.");
        }

        const parsedData = JSON.parse(response.text.trim()) as Partial<FormData>;

        // Validate and clean the parsed data
        const cleanedData: Partial<FormData> = {};

        if (parsedData.fullName && typeof parsedData.fullName === 'string' && parsedData.fullName.trim() !== 'null') {
            cleanedData.fullName = parsedData.fullName.trim();
        }

        if (parsedData.income && typeof parsedData.income === 'number' && parsedData.income > 0) {
            cleanedData.income = parsedData.income;
        }

        if (parsedData.borrowerAddress && typeof parsedData.borrowerAddress === 'string' && parsedData.borrowerAddress.trim() !== 'null') {
            cleanedData.borrowerAddress = parsedData.borrowerAddress.trim();
        }

        if (parsedData.dob && typeof parsedData.dob === 'string' && parsedData.dob.trim() !== 'null') {
            cleanedData.dob = parsedData.dob.trim();
        }

        return cleanedData;
    } catch (error: any) {
        console.error("Error extracting data from document:", error);

        // Provide more specific error messages
        if (error.message?.includes('API key')) {
            throw new Error("API configuration error. Please check your API key.");
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            throw new Error("Service temporarily unavailable. Please try again in a moment.");
        } else if (error.message?.includes('parse') || error.message?.includes('JSON')) {
            throw new Error("Could not parse document data. The document may be unclear or corrupted.");
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error("Failed to analyze the document. Please ensure the file is clear and readable, then try again.");
        }
    }
};

export const generateLoanSummary = async (data: FormData): Promise<string> => {
    const prompt = `You are Bella, an AI mortgage assistant. Your personality is friendly, informal, conversational, and encouraging.
  
  A user has just completed a pre-evaluation form. Based on the data below, generate a personalized and optimistic summary for them.
  - Highlight their strengths (e.g., "Great credit score!", "Solid down payment!").
  - Gently mention areas that might need attention without being negative.
  - Suggest a couple of potential loan types that could be a good fit (e.g., Conventional, FHA, VA).
  - Keep it concise, under 150 words, and formatted as a few short paragraphs.
  - End with an encouraging call to action to proceed to the full application.

  User Data:
  ${JSON.stringify(data, (key, value) => value || undefined, 2)}
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: { systemInstruction: systemInstruction },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating loan summary:", error);
        return "Thank you for your submission! Based on the information you provided, you're in a great position to move forward. We'll be in touch soon with your personalized options.";
    }
};