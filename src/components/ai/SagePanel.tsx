import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Send,
  Lightbulb,
  BookMarked,
  ChevronUp,
  Code,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';
import { useAIStore, type AIMessage } from '@/store/aiStore';
import { useEditorStore } from '@/store/editorStore';

const TypingCursor: React.FC = () => (
  <span className="inline-block w-2 h-5 ml-1 bg-sage/60 animate-pulse rounded-sm" />
);

interface SagePanelProps {
  compact?: boolean;
}

const MessageBubble: React.FC<{ message: AIMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isUser
            ? 'bg-neural-input'
            : 'bg-sage/10 border border-sage/30'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-medium">You</span>
        ) : (
          <BookOpen className="w-4 h-4 text-sage" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-w-0 px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-sage/10 text-white border border-sage/30'
            : 'bg-neural-input text-gray-200'
        }`}
      >
        {isUser ? (
          <div className="text-sm leading-relaxed">{message.content}</div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Tables
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-700 rounded-lg" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-sage/20 border-b border-gray-700" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-sage border-r border-gray-700 last:border-r-0" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-4 py-2 text-sm border-r border-gray-700 last:border-r-0 border-b border-gray-800 last:border-b-0" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-gray-800" {...props} />
                ),
                // Code blocks
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                  
                  return !inline ? (
                    <div className="relative my-4 group">
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={() => copyToClipboard(codeString, codeId)}
                          className="p-1.5 rounded bg-gray-800 hover:bg-sage/20 text-gray-400 hover:text-sage transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === codeId ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 overflow-x-auto">
                        <code className={`text-sm font-mono ${className}`} {...props}>
                          {children}
                        </code>
                      </pre>
                      {match && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-sage/20 border border-sage/30 rounded text-[10px] text-sage font-medium">
                          {match[1]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <code className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                // Headers
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold text-white mt-6 mb-4 flex items-center gap-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-bold text-sage mt-5 mb-3 flex items-center gap-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-base font-semibold text-gray-300 mt-3 mb-2" {...props} />
                ),
                // Lists
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 my-3 text-sm leading-relaxed" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 my-3 text-sm leading-relaxed" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-300 leading-relaxed pl-1" {...props} />
                ),
                // Paragraphs
                p: ({ node, ...props }) => (
                  <p className="text-sm text-gray-300 leading-relaxed my-3" {...props} />
                ),
                // Blockquotes
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-sage/50 pl-4 py-2 my-3 bg-sage/5 rounded-r italic text-sm text-gray-400" {...props} />
                ),
                // Links
                a: ({ node, ...props }) => (
                  <a className="text-sage hover:text-sage/80 underline" {...props} />
                ),
                // Horizontal rule
                hr: ({ node, ...props }) => (
                  <hr className="my-6 border-t border-gray-800" {...props} />
                ),
                // Strong/Bold
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-white" {...props} />
                ),
                // Emphasis/Italic
                em: ({ node, ...props }) => (
                  <em className="italic text-gray-300" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && <TypingCursor />}
          </div>
        )}
      </div>
    </div>
  );
};

export const SagePanel: React.FC<SagePanelProps> = ({ compact = false }) => {
  const { sageMessages, sageStatus, sendMessage, sagePersonality } = useAIStore();
  const { activeTab, tabs } = useEditorStore();
  const [input, setInput] = useState('');
  const [showContext, setShowContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTabData = tabs.find((t) => t.id === activeTab);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sageMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage('sage', input);
    setInput('');
  };

  const quickActions = [
    { icon: Lightbulb, label: 'Explain this', action: () => sendMessage('sage', 'Explain the current code') },
    { icon: BookMarked, label: 'Learn more', action: () => sendMessage('sage', 'What should I learn next?') },
    { icon: Code, label: 'Best practices', action: () => sendMessage('sage', 'What are the best practices here?') },
    { icon: GraduationCap, label: 'Quiz me', action: () => sendMessage('sage', 'Quiz me on this topic') },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Sage Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neural-border bg-sage/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sage/20 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-sage" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">Sage</span>
            <span className="text-xs text-sage ml-2 capitalize">({sagePersonality})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {sageStatus !== 'idle' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sage/10">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-thinking" />
              <span className="text-xs text-sage">{sageStatus}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Context Awareness */}
      {showContext && activeTabData && (
        <div className="px-3 py-2 bg-neural-bg border-b border-neural-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Current Context</span>
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-gray-500 hover:text-white"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
          <div className="text-xs text-gray-400">
            Editing: <span className="text-sage">{activeTabData.name}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Function: <span className="text-gray-400">handleSubmit</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {sageMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {!compact && (
        <div className="px-3 py-2 border-t border-neural-border">
          <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-neural-input hover:bg-sage/10 text-xs text-gray-400 hover:text-sage transition-colors"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neural-border">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sage anything..."
            className="w-full pl-3 pr-10 py-2 bg-neural-input border border-neural-border rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-sage/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-sage disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-neural-input rounded">Enter</kbd> to send
          </span>
          <span className="text-xs text-gray-500">
            <kbd className="px-1 py-0.5 bg-neural-input rounded">@</kbd> to mention context
          </span>
        </div>
      </form>
    </div>
  );
};
