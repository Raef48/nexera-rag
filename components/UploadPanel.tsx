'use client';

import { useEffect, useState } from 'react';

type UiDocument = {
  id: string;
  source: string;
  preview: string;
};

export default function UploadPanel() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('manual');
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<UiDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  async function loadDocuments() {
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data: { documents?: UiDocument[]; error?: string } =
        await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to load documents');
      }
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDocs(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function handleUpload() {
    if (!text.trim()) {
      setStatus('Please enter some text to upload.');
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Upload failed');
      }

      setStatus(`Added ${data.added} chunks from "${data.source}".`);
      setText('');

      // Refresh list after successful upload
      void loadDocuments();
    } catch (error) {
      console.error(error);
      setStatus(
        'Failed to upload text. Make sure Ollama is running and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteDocument(id: string) {
    try {
      const res = await fetch(`/api/documents?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data: { deletedId?: string; error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to delete document');
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error(err);
      setStatus('Failed to delete document.');
    }
  }

  async function handleResetAll() {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(
            'This will delete all documents from the knowledge base. Continue?',
          )
        : false;

    if (!confirmed) return;

    try {
      const res = await fetch('/api/documents?reset=true', {
        method: 'DELETE',
      });
      const data: { deletedAll?: boolean; error?: string } = await res.json();
      if (!res.ok || !data.deletedAll) {
        throw new Error(data.error ?? 'Failed to reset documents');
      }
      setDocuments([]);
      setStatus('Knowledge base has been cleared.');
    } catch (err) {
      console.error(err);
      setStatus('Failed to clear knowledge base.');
    }
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            Source label (optional)
          </span>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. docs, notes, pdf-summary"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            Text to add to knowledge base
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="resize-none rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Paste any text here. It will be split into paragraphs and stored in the local vector database."
          />
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={isLoading}
          className="mt-1 inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Uploading…' : 'Add to knowledge base'}
        </button>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            Stored documents ({isLoadingDocs ? 'loading…' : documents.length})
          </span>
          <button
            type="button"
            onClick={handleResetAll}
            disabled={documents.length === 0}
            className="rounded-md border border-red-500/60 px-2 py-0.5 text-[11px] font-medium text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear all
          </button>
        </div>

        {documents.length === 0 && !isLoadingDocs && (
          <p className="text-xs text-slate-500">
            No documents stored yet. Upload some text above to populate the
            knowledge base.
          </p>
        )}

        {documents.length > 0 && (
          <ul className="flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="group flex items-start justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5"
              >
                <div className="flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-indigo-600">
                      {doc.source || 'unknown'}
                    </span>
                    <span className="truncate text-[10px] text-slate-400">
                      {doc.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700">{doc.preview}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="mt-0.5 inline-flex h-6 shrink-0 items-center justify-center rounded-md border border-slate-300 px-1.5 text-[10px] font-medium text-slate-600 opacity-60 transition hover:border-red-500 hover:text-red-600 hover:opacity-100"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status && (
        <p className="mt-1 text-xs text-slate-600" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}

