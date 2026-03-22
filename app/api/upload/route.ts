import { NextResponse } from 'next/server';
import { getEmbedding } from '@/lib/embeddings';
import { addDocuments, type StoredDocument } from '@/lib/vector';

function splitIntoChunks(text: string): string[] {
  // Simple splitter: split on double newlines, then trim empty chunks
  return text
    .split(/\n{2,}/g)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawText: string = body.text ?? '';
    const source: string = body.source ?? 'user-upload';

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json(
        { error: 'Missing "text" field in request body' },
        { status: 400 },
      );
    }

    const chunks = splitIntoChunks(rawText);
    if (!chunks.length) {
      return NextResponse.json(
        { error: 'No non-empty chunks found in text' },
        { status: 400 },
      );
    }

    const docs: StoredDocument[] = [];
    for (const [index, chunk] of chunks.entries()) {
      const vector = await getEmbedding(chunk);
      docs.push({
        id: `${Date.now()}-${index}`,
        vector,
        text: chunk,
        source,
      });
    }

    await addDocuments(docs);

    return NextResponse.json({
      added: docs.length,
      source,
    });
  } catch (err) {
    console.error('Upload API error', err);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 },
    );
  }
}
