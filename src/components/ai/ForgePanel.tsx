import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Zap,
  Send,
  Sparkles,
  Code,
  Wand2,
  FileCode,
  Bug,
  FileText,
  Languages,
  ChevronUp,
  Check,
  X,
  Copy,
  Loader2,
} from 'lucide-react';
import { useAIStore, type AIMessage, type CodeSuggestion } from '@/store/aiStore';
import { useEditorStore } from '@/store/editorStore';

interface ForgePanelProps {
  compact?: boolean;
}

const TypingCursor: React.FC = () => (
  <span className="inline-block w-2 h-5 ml-1 bg-forge/60 animate-pulse rounded-sm" />
);

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
            : 'bg-forge/10 border border-forge/30'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-medium">You</span>
        ) : (
          <Zap className="w-4 h-4 text-forge" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-w-0 px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-forge/10 text-white border border-forge/30'
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
                  <thead className="bg-forge/20 border-b border-gray-700" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-forge border-r border-gray-700 last:border-r-0" {...props} />
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
                          className="p-1.5 rounded bg-gray-800 hover:bg-forge/20 text-gray-400 hover:text-forge transition-colors"
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
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-forge/20 border border-forge/30 rounded text-[10px] text-forge font-medium">
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
                  <h2 className="text-xl font-bold text-forge mt-5 mb-3 flex items-center gap-2" {...props} />
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
                  <blockquote className="border-l-4 border-forge/50 pl-4 py-2 my-3 bg-forge/5 rounded-r italic text-sm text-gray-400" {...props} />
                ),
                // Links
                a: ({ node, ...props }) => (
                  <a className="text-forge hover:text-forge/80 underline" {...props} />
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

const SuggestionCard: React.FC<{
  suggestion: CodeSuggestion;
  onAccept: () => void;
  onReject: () => void;
}> = ({ suggestion, onAccept, onReject }) => {
  return (
    <div className="bg-neural-bg border border-forge/30 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forge" />
          <span className="text-sm font-medium text-white">{suggestion.description}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`px-2 py-0.5 rounded text-xs ${
              suggestion.confidence > 0.8
                ? 'bg-forge/20 text-forge'
                : suggestion.confidence > 0.5
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {Math.round(suggestion.confidence * 100)}% confidence
          </div>
        </div>
      </div>
      <pre className="bg-neural-panel p-2 rounded text-xs font-mono overflow-x-auto mb-3">
        <code>{suggestion.code}</code>
      </pre>
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-forge text-neural-bg text-xs font-medium hover:bg-forge/90 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Accept
        </button>
        <button
          onClick={onReject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neural-input text-gray-400 text-xs hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  );
};

export const ForgePanel: React.FC<ForgePanelProps> = ({ compact = false }) => {
  const { forgeMessages, forgeStatus, sendMessage, suggestions, clearSuggestions, forgeCreativity, setContext } = useAIStore();
  const { activeTab, tabs, updateTabContent, addTab, togglePreview, toggleTerminal, files } = useEditorStore();
  const [input, setInput] = useState('');
  const [showContext, setShowContext] = useState(true);
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTabData = tabs.find((t) => t.id === activeTab);

  // Update AI context when active tab or files change
  useEffect(() => {
    if (activeTabData) {
      // Extract project context from files structure
      const extractProjectContext = (nodes: any[]): string[] => {
        const context: string[] = [];
        nodes.forEach(node => {
          if (node.type === 'file') {
            context.push(node.name);
          }
          if (node.children) {
            context.push(...extractProjectContext(node.children));
          }
        });
        return context;
      };

      setContext({
        currentFile: activeTabData.name,
        projectContext: extractProjectContext(files),
      });
    }
  }, [activeTabData, files, setContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [forgeMessages, suggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const prompt = input.toLowerCase();
    const userMessage = input;
    setInput('');
    
    // Check if user wants to create a website/app
    const isWebsitePrompt = prompt.includes('create') || prompt.includes('build') || 
                           prompt.includes('website') || prompt.includes('app') ||
                           prompt.includes('landing page') || prompt.includes('portfolio');
    
    if (isWebsitePrompt) {
      // Generate files automatically
      setIsGeneratingFiles(true);
      setGenerationProgress('🚀 Starting file generation...');
      
      // Send message to AI first
      sendMessage('forge', userMessage);
      
      setTimeout(async () => {
        setGenerationProgress('📝 Creating HTML structure...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate beautiful template files
        const files = [
          {
            id: `file-${Date.now()}-1`,
            name: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Beautiful Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">Welcome to My Website</h1>
            <p class="subtitle">Built with AI assistance ✨</p>
        </header>
        <main class="content">
            <div class="card">
                <h2>About</h2>
                <p>This is a beautiful, responsive website created instantly.</p>
            </div>
            <div class="card">
                <h2>Features</h2>
                <ul>
                    <li>Modern design</li>
                    <li>Fully responsive</li>
                    <li>Smooth animations</li>
                </ul>
            </div>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
            language: 'html',
            path: 'index.html'
          },
          {
            id: `file-${Date.now()}-2`,
            name: 'styles.css',
            content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
    animation: fadeIn 1s ease-in;
}

.title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
    font-size: 1.5rem;
    opacity: 0.9;
}

.content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: slideUp 0.6s ease-out;
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 80px rgba(0,0,0,0.4);
}

.card h2 {
    color: #667eea;
    margin-bottom: 1rem;
    font-size: 1.8rem;
}

.card p, .card li {
    color: #555;
    line-height: 1.6;
    font-size: 1.1rem;
}

.card ul {
    list-style: none;
    padding-left: 0;
}

.card li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.card li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: bold;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .title {
        font-size: 2rem;
    }
    
    .subtitle {
        font-size: 1.2rem;
    }
}`,
            language: 'css',
            path: 'styles.css'
          },
          {
            id: `file-${Date.now()}-3`,
            name: 'script.js',
            content: `console.log('🚀 Website loaded successfully!');

// Add interactive elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    // Add click animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        });
    });
    
    // Log message
    console.log('✨ Interactive features initialized');
});`,
            language: 'javascript',
            path: 'script.js'
          }
        ];
        
        // Add files to editor with streaming effect
        for (const file of files) {
          setGenerationProgress(`✨ Generating ${file.name}...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          addTab({
            id: file.id,
            name: file.name,
            content: file.content,
            language: file.language,
            isActive: false,
            isModified: false,
            path: file.path
          });
        }
        
        setGenerationProgress('📦 Installing dependencies...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show terminal
        toggleTerminal();
        
        setGenerationProgress('🌐 Starting preview...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Show preview
        togglePreview();
        
        setGenerationProgress('✅ Website ready!');
        setTimeout(() => {
          setIsGeneratingFiles(false);
          setGenerationProgress('');
        }, 2000);
      }, 1000);
    } else {
      // Regular message
      sendMessage('forge', userMessage);
    }
  };

  const handleAcceptSuggestion = (suggestion: CodeSuggestion) => {
    if (activeTabData) {
      updateTabContent(activeTabData.id, activeTabData.content + '\n' + suggestion.code);
    }
    clearSuggestions();
  };

  const quickActions = [
    { icon: Code, label: 'Complete code', action: () => sendMessage('forge', 'Complete this function') },
    { icon: Wand2, label: 'Refactor', action: () => sendMessage('forge', 'Refactor this code') },
    { icon: FileCode, label: 'Generate tests', action: () => sendMessage('forge', 'Generate unit tests') },
    { icon: Bug, label: 'Fix bugs', action: () => sendMessage('forge', 'Find and fix bugs') },
    { icon: FileText, label: 'Add docs', action: () => sendMessage('forge', 'Add documentation') },
    { icon: Languages, label: 'Translate', action: () => sendMessage('forge', 'Convert to TypeScript') },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Forge Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neural-border bg-forge/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-forge/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-forge" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">Forge</span>
            <span className="text-xs text-forge ml-2 capitalize">({forgeCreativity})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {forgeStatus !== 'idle' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forge/10">
              <div className="w-1.5 h-1.5 rounded-full bg-forge animate-pulse-glow" />
              <span className="text-xs text-forge">{forgeStatus}...</span>
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
            Editing: <span className="text-forge">{activeTabData.name}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ready to generate, refactor, or explain
          </div>
        </div>
      )}

      {/* Messages & Suggestions */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* File Generation Progress */}
        {isGeneratingFiles && (
          <div className="bg-neural-bg border border-forge/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-forge animate-spin" />
              <span className="text-sm font-medium text-forge">Generating your website...</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">{generationProgress}</div>
            <div className="w-full bg-neural-input rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-forge rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        )}
        {/* Active Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-forge font-medium">Suggestions</span>
              <button
                onClick={clearSuggestions}
                className="text-xs text-gray-500 hover:text-white"
              >
                Clear all
              </button>
            </div>
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={() => handleAcceptSuggestion(suggestion)}
                onReject={clearSuggestions}
              />
            ))}
          </div>
        )}

        {/* Messages */}
        {forgeMessages.map((message) => (
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
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-neural-input hover:bg-forge/10 text-xs text-gray-400 hover:text-forge transition-colors"
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
            placeholder="Ask Forge to generate, refactor, or fix..."
            className="w-full pl-3 pr-10 py-2 bg-neural-input border border-neural-border rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-forge/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-forge disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-neural-input rounded">Enter</kbd> to send
          </span>
          <span className="text-xs text-gray-500">
            <kbd className="px-1 py-0.5 bg-neural-input rounded">/</kbd> for commands
          </span>
        </div>
      </form>
    </div>
  );
};
