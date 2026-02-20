'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { startProject } from '@/web_container/start-project';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Welcome to z0t! I'm your AI co-pilot. Describe what you want to build, and I'll generate the code instantly.",
  },
];

export function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const { data, error } = await authClient.getSession();

    if (error) {
      throw new Error('Better auth error');
    }

    const bodyReq = {
      mode: 'GENESIS',
      prompt: input,
      userId: data?.user.id,
      projectSetup: {
        name: 'amazon clone',
        framework: 'REACT',
        styling: 'TAILWIND',
      },
    };

    try {
      setIsThinking(true);
      const res = await fetch('http://localhost:4000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bodyReq),
      });

      if (!res.ok) {
        throw new Error('Error is responsed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        console.log({ value });

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        console.log({ lines });

        let currentEvent = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '').trim();
            if (currentEvent === 'token') {
              setCode((prev) => prev + data);
              setStatus('Generating code...');
            } else if (currentEvent === 'status') {
              setStatus(data);
            } else if (currentEvent === 'final_files') {
              const files = JSON.parse(data);
              console.log('FILES READY FOR WEBCONTAINER:', files);
              // Convert the files object to a single string for the container
              const combinedCode = Object.values(files)
                .map((file: any) => file.content)
                .join('\n\n');

              setCode(combinedCode); // this triggers your useEffect
              setStatus('Project ready'); // optional
            }
          }
        }
      }
    } catch (error) {
      console.log('error: ', error);
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setIsThinking(false);
  };

  useEffect(() => {
    if (code) {
      console.log({ code });
      startProject(code);
    }
  }, [code]);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border">
        <div className="w-6 h-6 rounded-md bg-linear-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm">z0t AI</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'glass-card'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.code && (
                <div className="mt-3 p-3 rounded-lg bg-background/50 font-mono text-xs overflow-x-auto">
                  <pre>{message.code}</pre>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass-card rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you want..."
            className="flex-1 bg-sidebar-accent border border-sidebar-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
