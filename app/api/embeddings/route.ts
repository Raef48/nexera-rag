import { NextResponse } from 'next/server';
import { getEmbedding } from '@/lib/embeddings';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const text: string = body.text ?? '';

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing "text" field in request body' },
        { status: 400 },
      );
    }

    const embedding = await getEmbedding(text);
    return NextResponse.json({ embedding });
  } catch (err) {
    console.error('Embeddings API error', err);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 },
    );
  }
}
