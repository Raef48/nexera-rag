import ChatInterface from '@/components/ChatInterface';
import ChatWidget from '@/components/ChatWidget';
import UploadPanel from '@/components/UploadPanel';

export default function HomePage() {
  return (
    <>
      <ChatWidget />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:gap-6">
      <section className="flex-1 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg backdrop-blur">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Chat with your AI
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Ask questions and get answers grounded in the documents you upload.
        </p>
        <ChatInterface />
      </section>

      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg backdrop-blur">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Knowledge base
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Paste or type text to add it to the local vector database used for
          retrieval.
        </p>
        <UploadPanel />
      </section>
    </div>
    </>
  );
}

