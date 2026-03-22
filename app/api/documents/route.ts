import { NextResponse } from 'next/server';
import {
  listDocuments,
  deleteDocument,
  deleteAllDocuments,
} from '@/lib/vector';

export async function GET() {
  try {
    const docs = await listDocuments(200);
    // For the UI we don't need to send the full vector
    const simplified = docs.map((doc) => ({
      id: doc.id,
      source: doc.source,
      // Send a short preview of the text
      preview:
        doc.text.length > 160 ? `${doc.text.slice(0, 157)}…` : doc.text,
    }));

    return NextResponse.json({ documents: simplified });
  } catch (err) {
    console.error('Documents GET API error', err);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const reset = url.searchParams.get('reset');

    if (reset === 'true') {
      await deleteAllDocuments();
      return NextResponse.json({ deletedAll: true });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Missing "id" query parameter' },
        { status: 400 },
      );
    }

    await deleteDocument(id);
    return NextResponse.json({ deletedId: id });
  } catch (err) {
    console.error('Documents DELETE API error', err);
    return NextResponse.json(
      { error: 'Failed to delete document(s)' },
      { status: 500 },
    );
  }
}

