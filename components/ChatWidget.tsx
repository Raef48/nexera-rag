'use client';

import { useState, useRef, useEffect } from 'react';
import { handleMessage, getSessionState, resetSession } from '@/lib/engine';

// Types
type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  isQuickReply?: boolean;
};

// Available slots data
const availableSlots: Record<string, string[]> = {
  '20 March': ['10:00 AM', '12:00 PM', '3:00 PM'],
  '21 March': ['9:00 AM', '11:00 AM', '2:00 PM', '5:00 PM'],
  '22 March': ['10:00 AM', '1:00 PM', '4:00 PM'],
};

// User ID for session (using a fixed ID for this demo)
const USER_ID = 'user_1';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Hi! 👋 Welcome to Clinic AI. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate bot typing delay
  const simulateTyping = async (callback: () => void) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));
    setIsTyping(false);
    callback();
  };

  const addMessage = (content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addBotMessage = (content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-bot`,
      role: 'bot',
      content,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Handle quick replies based on current state
  const handleQuickReply = (reply: string) => {
    addMessage(reply);
    const currentState = getSessionState(USER_ID);

    if (currentState === 'start') {
      simulateTyping(() => {
        const result = handleMessage(USER_ID, reply);
        addBotMessage(result.reply);
      });
    } else if (currentState === 'awaiting_date') {
      // Check if it's a valid date
      if (availableSlots[reply]) {
        simulateTyping(() => {
          const result = handleMessage(USER_ID, reply);
          addBotMessage(result.reply);
        });
      } else {
        simulateTyping(() => {
          addBotMessage('Please select a valid date from the options.');
        });
      }
    } else if (currentState === 'done' || currentState === 'completed') {
      if (reply.toLowerCase().includes('book another')) {
        resetSession(USER_ID);
        simulateTyping(() => {
          const result = handleMessage(USER_ID, 'appointment');
          addBotMessage(result.reply);
        });
      } else if (reply.toLowerCase().includes('main menu')) {
        resetSession(USER_ID);
        simulateTyping(() => {
          addBotMessage('How else can I help you today?');
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    addMessage(text);
    setInput('');

    simulateTyping(() => {
      const result = handleMessage(USER_ID, text);
      addBotMessage(result.reply);
    });
  };

  const currentState = getSessionState(USER_ID);

  // Get quick replies based on state
  const getQuickReplies = () => {
    switch (currentState) {
      case 'start':
        return ['Appointment lagbe', 'Book appointment', 'Doctor'];
      case 'awaiting_date':
        return ['20 March', '21 March', '22 March'];
      case 'done':
      case 'completed':
        return ['Book another', 'Main menu'];
      default:
        return [];
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-lg transition-all hover:bg-indigo-500 hover:scale-110 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-indigo-600 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Clinic AI</h3>
              <p className="text-xs text-indigo-100">Always here to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-white transition hover:bg-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: '0.1s' }}
                    ></span>
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reply Buttons */}
            {!isTyping && (
              <div className="flex flex-wrap gap-2 pt-2">
                {getQuickReplies().map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentState === 'awaiting_user_info' || currentState === 'completed'
                  ? 'Enter name and phone...'
                  : 'Type a message...'
              }
              className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
