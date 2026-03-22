import { NextResponse } from 'next/server';
import { runRagPipeline } from '@/lib/rag';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question: string = body.question ?? '';
    const provider: 'ollama' | 'groq' = body.provider ?? 'ollama';

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Missing "question" field in request body' },
        { status: 400 },
      );
    }

    const result = await runRagPipeline(question, provider);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Chat API error', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
