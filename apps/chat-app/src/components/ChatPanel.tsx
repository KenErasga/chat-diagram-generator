'use client';

import { useState } from 'react';
import { getChatId } from '@/lib/chat-id';
import { postChat } from '@/lib/api';

interface DisplayMessage {
  id: string;
  role: 'user' | 'ai' | 'error';
  content: string;
}

interface ChatPanelProps {
  onDiagram: (def: string) => void;
}

let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;

  return String(messageCounter);
}

export function ChatPanel({ onDiagram }: ChatPanelProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitMessage(text: string) {
    if (!text) return;

    setMessages(prev => [...prev, { id: nextId(), role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const response = await postChat({ chatId: getChatId(), message: text });

      setMessages(prev => [...prev, { id: nextId(), role: 'ai', content: response.content }]);

      if (response.type === 'diagram' && response.diagram) {
        onDiagram(response.diagram);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: nextId(), role: 'error', content: 'Failed to send message. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitMessage(input.trim());
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #ccc' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '12px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '8px',
                background: msg.role === 'user' ? '#0070f3' : msg.role === 'error' ? '#fee2e2' : '#f3f4f6',
                color: msg.role === 'user' ? '#fff' : msg.role === 'error' ? '#991b1b' : '#111'
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid #ccc' }}>
        <textarea
          id="chat-input"
          aria-label="Describe a diagram or ask a question"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe a diagram or ask a question..."
          rows={3}
          disabled={loading}
          style={{ width: '100%', resize: 'vertical', padding: '8px', boxSizing: 'border-box' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submitMessage(input.trim());
            }
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label={loading ? 'Sending message' : 'Send message'}
          style={{ marginTop: '8px', padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
