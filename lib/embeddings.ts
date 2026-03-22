const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text';

export async function getEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new Error('Cannot create embedding for empty text');
  }

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
