import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-50">
          Chat with Nexera AI
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          This page focuses purely on the conversation. Use the home page to
          manage your knowledge base.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}

