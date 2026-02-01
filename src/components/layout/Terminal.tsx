import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

interface TerminalTab {
  id: string;
  name: string;
  content: string[];
  isActive: boolean;
}

export const Terminal: React.FC = () => {
  const { toggleTerminal } = useEditorStore();
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: '1',
      name: 'bash',
      content: [
        'Welcome to CodeMentor Terminal',
        'Type "help" for available commands',
        '',
        '~/my-project $',
      ],
      isActive: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.isActive) || tabs[0];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTab?.content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newContent = [...activeTab.content, `~/my-project $ ${input}`];

    // Simulate command response
    if (input === 'help') {
      newContent.push(
        'Available commands:',
        '  help     - Show this help message',
        '  clear    - Clear the terminal',
        '  ls       - List files',
        '  npm      - Run npm commands',
        '  git      - Run git commands',
        ''
      );
    } else if (input === 'clear') {
      newContent.length = 0;
      newContent.push('~/my-project $');
    } else if (input === 'ls') {
      newContent.push(
        'node_modules/  src/  public/  package.json  README.md',
        ''
      );
    } else if (input.startsWith('npm')) {
      newContent.push(
        '> my-project@1.0.0 dev',
        '> vite',
        '',
        '  VITE v5.0.0  ready in 234 ms',
        '',
        '  ➜  Local:   http://localhost:5173/',
        '  ➜  Network: use --host to expose',
        '  ➜  press h + enter to show help',
        ''
      );
    } else {
      newContent.push(`Command not found: ${input}`, '');
    }

    newContent.push('~/my-project $');

    setTabs(
      tabs.map((t) =>
        t.id === activeTab.id ? { ...t, content: newContent } : t
      )
    );
    setInput('');
  };

  const addTab = () => {
    const newTab: TerminalTab = {
      id: Date.now().toString(),
      name: `bash ${tabs.length + 1}`,
      content: ['~/my-project $'],
      isActive: true,
    };
    setTabs([...tabs.map((t) => ({ ...t, isActive: false })), newTab]);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (newTabs.length === 0) {
      toggleTerminal();
      return;
    }
    if (activeTab.id === tabId) {
      newTabs[newTabs.length - 1].isActive = true;
    }
    setTabs(newTabs);
  };

  const setActiveTab = (tabId: string) => {
    setTabs(tabs.map((t) => ({ ...t, isActive: t.id === tabId })));
  };

  return (
    <div className="h-full flex flex-col bg-neural-bg">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neural-panel border-b border-neural-border">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-t text-xs cursor-pointer transition-colors ${
                tab.isActive
                  ? 'bg-neural-bg text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <TerminalIcon className="w-3 h-3" />
              <span>{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={addTab}
            className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {isMaximized ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {activeTab.content.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap ${
              line.startsWith('~/my-project $')
                ? 'text-forge'
                : line.startsWith('>')
                ? 'text-sage'
                : line.startsWith('  ➜')
                ? 'text-forge'
                : 'text-gray-300'
            }`}
          >
            {line}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-forge mr-2">~/my-project $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none font-mono"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};
