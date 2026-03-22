type MessageRole = 'user' | 'assistant';

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      } text-sm`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-900'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}

