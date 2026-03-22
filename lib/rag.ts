import { getEmbedding } from './embeddings';
import { searchDocuments, type StoredDocument } from './vector';

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'tinyllama:1.1b';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL ?? 'https://api.groq.com/openai/v1/chat/completions';

export type RagResult = {
  answer: string;
  sources: StoredDocument[];
};

function buildPrompt(question: string, contextDocs: StoredDocument[]): string {
  const contextText = contextDocs
    .map(
      (doc, idx) =>
        `Source ${idx + 1} (${doc.source || 'unknown'}):\n${doc.text}`,
    )
    .join('\n\n');

  return [
    'You are a helpful AI assistant that answers questions using the provided context.',
    'Only use the information from the context when it is relevant.',
    'If the context does not contain the answer, say that you are not sure instead of hallucinating.',
    '',
    'Context:',
    contextText || '[no relevant context available]',
    '',
    `User question: ${question}`,
  ].join('\n');
}

const DENTAL_CLINIC_SYSTEM_PROMPT = `You are a helpful dental clinic assistant.

Your role:
- Greet patients warmly and friendly
- Answer questions about dental services (cleaning, whitening, cavities, braces, implants, etc.)
- Help patients understand dental procedures in simple terms
- Provide oral health tips and advice
- Be patient, caring, and professional
- Keep answers short and friendly
- If you don't know something, suggest they call the clinic

Important: You are a dental clinic assistant, not a general AI. Stay in character as a friendly dental clinic helper.`;

// Ollama
async function callOllamaChat(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: 'system',
          content: DENTAL_CLINIC_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to call Ollama chat: ${response.status} ${response.statusText} ${errorText}`,
    );
  }

  const json = (await response.json()) as {
    message?: { content?: string };
  };

  const content = json.message?.content?.trim();
  if (!content) {
    throw new Error('Ollama chat response missing message content');
  }

  return content;
}

// Groq (branded as Nexera in UI)
async function callGroqChat(prompt: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: DENTAL_CLINIC_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to call Groq chat: ${response.status} ${response.statusText} ${errorText}`,
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Groq chat response missing message content');
  }

  return content;
}

// Direct chat without RAG (for when no documents are available)
async function callDirectChat(question: string, provider: 'ollama' | 'groq'): Promise<{ answer: string; sources: StoredDocument[] }> {
  const messages = [
    {
      role: 'system',
      content: DENTAL_CLINIC_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: question,
    },
  ];

  if (provider === 'groq') {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to call Groq chat: ${response.status} ${response.statusText} ${errorText}`,
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Groq chat response missing message content');
    }

    return { answer: content, sources: [] };
  } else {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to call Ollama chat: ${response.status} ${response.statusText} ${errorText}`,
      );
    }

    const json = (await response.json()) as {
      message?: { content?: string };
    };

    const content = json.message?.content?.trim();
    if (!content) {
      throw new Error('Ollama chat response missing message content');
    }

    return { answer: content, sources: [] };
  }
}

export async function runRagPipeline(question: string, provider: 'ollama' | 'groq' = 'ollama'): Promise<RagResult> {
  try {
    const embedding = await getEmbedding(question, provider);
    const docs = await searchDocuments(embedding, 4);
    
    // If no documents found, use direct chat
    if (docs.length === 0) {
      return await callDirectChat(question, provider);
    }
    
    const prompt = buildPrompt(question, docs);

    const answer = provider === 'groq'
      ? await callGroqChat(prompt)
      : await callOllamaChat(prompt);

    return { answer, sources: docs };
  } catch (error) {
    // If embedding fails (e.g., HF API error), fall back to direct chat
    console.warn('RAG pipeline failed, falling back to direct chat:', error);
    return await callDirectChat(question, provider);
  }
}
