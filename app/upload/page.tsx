import UploadPanel from '@/components/UploadPanel';

export default function UploadPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-50">
          Manage your knowledge base
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Paste text here to add it to the local vector database used for
          retrieval in chat. You can also give each batch a source label so you
          remember where it came from.
        </p>
      </header>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40 backdrop-blur">
        <UploadPanel />
      </div>
    </div>
  );
}

