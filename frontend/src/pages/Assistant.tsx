import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { assistantService } from '../services/assistantService';
import type { ChatMessage } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

const SUGGESTIONS = [
  'What should I wear today?',
  'I have an interview tomorrow.',
  "I'm going to the beach this weekend.",
  'My favorite color is black.',
];

/** AI Fashion Assistant - conversational chat backed by Gemini + wardrobe/weather context. */
export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      const res = await assistantService.history();
      setMessages(res.data.data.history);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    setInput('');
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { _id: `tmp-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await assistantService.send(text);
      setMessages((prev) => [...prev, res.data.data.reply]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          AI Fashion Assistant
        </h1>
        <p className="text-on-surface-variant font-body-sm">Ask anything about styling, weather, or occasions.</p>
      </section>

      <section className="glass-surface rounded-lg flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-gutter space-y-stack-md">
          {loadingHistory && <div className="animate-pulse h-20 bg-surface-container-high rounded-lg" />}

          {!loadingHistory && messages.length === 0 && (
            <div className="text-center text-on-surface-variant py-stack-lg">
              <Icon name="smart_toy" className="text-4xl text-primary mb-2" />
              <p>Hi! I'm your AI stylist. Ask me anything.</p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m._id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-body-sm ${
                  m.role === 'user'
                    ? 'lavender-gradient text-on-primary rounded-br-sm'
                    : 'bg-surface-container-high text-on-surface rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-bl-sm">
                <Icon name="progress_activity" className="animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 0 && !loadingHistory && (
          <div className="px-gutter pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-body-sm px-3 py-2 rounded-full border border-outline-variant hover:bg-primary/5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-gutter border-t border-outline-variant/30 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your stylist..."
            className="flex-1 px-4 py-3 rounded-xl border border-outline-variant bg-white/60 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-12 h-12 rounded-xl lavender-gradient text-on-primary flex items-center justify-center button-glow disabled:opacity-70"
          >
            <Icon name="send" />
          </button>
        </form>
      </section>
    </AppShell>
  );
}
