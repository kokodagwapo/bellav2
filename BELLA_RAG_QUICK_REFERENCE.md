# Bella RAG Quick Reference Guide

## 🎯 Quick Start

### Core Components
- **Knowledge Base:** `bellaKnowledgeBase.ts`
- **Service:** `services/geminiService.ts`
- **UI Component:** `components/ChatWidget.tsx`

### Key Functions

```typescript
// Generate response with RAG
getBellaChatReply(chatHistory: { role: 'user' | 'model', text: string }[])

// Extract form data from text
analyzeTextForData(text: string): Promise<Partial<FormData>>

// Generate speech
generateBellaSpeech(text: string): Promise<string | null>

// Extract from documents
extractDataFromDocument(file: { data: string, mimeType: string })
```

---

## 📋 Knowledge Base Tags Reference

| Tag | Purpose | Example IDs |
|-----|---------|-------------|
| `avatar_click` | Initial greetings | `avatar-click-1`, `avatar-click-2` |
| `loan_type` | Loan information | `loan-conventional-1`, `loan-fha-1` |
| `prep4loan` | Prep4Loan features | `p4l-docs-1` |
| `urla_1003` | Form guidance | `urla-overview-1` |
| `emotional_support` | Encouragement | `support-firsttime-1`, `support-confidence-1` |
| `flow_rules` | Conversation logic | `flow-confusion-detect-1` |
| `global` | Universal knowledge | `knowledge-bank-1`, `mission-1` |

---

## 🔄 Conversation Flow Cheat Sheet

```
1. User clicks Bella
   ↓
2. Load KB → Filter avatar_click chunks → Random greeting
   ↓
3. User sends message
   ↓
4. Build chat history → Send to getBellaChatReply()
   ↓
5. Gemini RAG: Retrieve relevant chunks → Generate response
   ↓
6. Parallel: Extract data + Generate TTS
   ↓
7. Display response + Play audio + Update form
```

---

## 💬 Response Generation Template

```typescript
const systemInstruction = `You are Bella, an AI mortgage assistant. 
Your personality is friendly, informal, conversational, and occasionally humorous.

You MUST use the provided knowledge base to answer questions.

Knowledge Base:
${JSON.stringify(knowledgeBase)}
`;

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: chatHistory,
  config: { systemInstruction: systemInstruction },
});
```

---

## 📝 Adding New Knowledge

```typescript
// In bellaKnowledgeBase.ts
{
  id: "new-chunk-id",
  tags: ["category", "subcategory"],
  content: "Your knowledge content here"
}
```

**Tag Naming:**
- Use lowercase with underscores: `loan_type`, `emotional_support`
- Be specific: `loan_type_conventional` not just `loan`
- Use plural for categories: `loan_types` (if grouping)

---

## 🎤 TTS Configuration

```typescript
{
  voiceConfig: { 
    prebuiltVoiceConfig: { 
      voiceName: 'Kore' // Female, US accent
    } 
  },
  sampleRate: 24000
}
```

---

## 📊 Data Extraction Schema

```typescript
interface FormData {
  // Personal
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dob?: string;
  borrowerAddress?: string;
  
  // Loan
  loanPurpose?: 'Purchase a Home' | 'Refinance';
  propertyType?: 'Single Family Home' | 'Condominium' | 'Townhouse' | 'Multi-Family Home';
  propertyUse?: 'Primary Residence' | 'Second Home' | 'Investment Property';
  
  // Financial
  income?: number;
  creditScore?: 'Excellent (740+)' | 'Good (700-739)' | 'Average (640-699)' | 'Fair (580-639)';
  purchasePrice?: number;
  downPayment?: number;
  loanAmount?: number;
  
  // Flags
  isFirstTimeBuyer?: boolean;
  isMilitary?: boolean;
}
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No response from API | Check API key, network connection |
| Data not extracted | Verify text contains extractable info |
| Audio not playing | Check browser audio permissions |
| Wrong persona | Verify system instruction includes KB |
| Repetitive responses | Add more varied chunks to KB |

---

## 📚 Full Documentation

See `BELLA_RAG_DOCUMENTATION.md` for:
- Complete architecture diagrams
- Detailed conversation scripts
- Step-by-step flow explanations
- Implementation details

