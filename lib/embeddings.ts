const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;
const HF_EMBEDDING_MODEL = process.env.HF_EMBEDDING_MODEL ?? 'BAAI/bge-small-en-v1.5';

export async function getEmbedding(text: string, provider: 'ollama' | 'groq' = 'ollama'): Promise<number[]> {
  if (!text.trim()) {
    throw new Error('Cannot create embedding for empty text');
  }

  if (provider === 'groq') {
    return getHFEmbedding(text);
  }

  return getOllamaEmbedding(text);
}

async function getOllamaEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to get embedding from Ollama: ${response.status} ${response.statusText} ${errorText}`,
    );
  }

  const json = (await response.json()) as {
    embedding?: number[];
  };

  if (!json.embedding || !Array.isArray(json.embedding)) {
    throw new Error('Ollama embedding response missing embedding vector');
  }

  return json.embedding;
}

async function getHFEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_EMBEDDING_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to get embedding from Hugging Face: ${response.status} ${response.statusText} ${errorText}`,
    );
  }

  const json = (await response.json()) as number[][] | { error?: string };

  if (Array.isArray(json) && Array.isArray(json[0])) {
    return json[0];
  }

  throw new Error(`Hugging Face error: ${JSON.stringify(json)}`);
}
