
'use client';

import { useState } from 'react';
import MessageBubble, { type Message } from './MessageBubble';

type ChatResponse = {
  answer: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<'ollama' | 'groq'>('groq');

  async function sendMessage() {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, provider }),
      });

      const data: ChatResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Chat request failed');
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: `Something went wrong talking to the ${provider} model. ${
          provider === 'ollama'
            ? 'Make sure Ollama is running with tinyllama and nomic-embed-text pulled.'
            : 'Make sure your API key is valid.'
        }`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex h-[480px] flex-col rounded-xl border border-slate-200 bg-white/70">
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500">
            Ask anything about the text you&apos;ve added to the knowledge base,
            or try general questions. The assistant runs fully locally using
            TinyLlama via Ollama, or via the Nexera API.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
      <div className="border-t border-slate-200 bg-white/80 p-2">
        <div className="flex items-center gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'ollama' | 'groq')}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ollama">Ollama</option>
            <option value="groq">Nexera</option>
          </select>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            className="h-9 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

