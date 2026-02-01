import React, { useState } from 'react';
import { SagePanel } from './SagePanel';
import { ForgePanel } from './ForgePanel';
import { TheBridge } from './TheBridge';
import { useAIStore } from '@/store/aiStore';
import { BookOpen, Zap, GitMerge, Settings, X } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

export const DualAIPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<'split' | 'sage' | 'forge'>('split');
  const { collaborationMode, setCollaborationMode } = useAIStore();
  const { toggleAIPanel } = useEditorStore();

  return (
    <div className="h-full flex flex-col bg-neural-panel border-l border-neural-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neural-border">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView('sage')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'sage'
                ? 'bg-sage/10 text-sage'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Sage
          </button>
          <button
            onClick={() => setActiveView('split')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'split'
                ? 'bg-sync/10 text-sync'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Both
          </button>
          <button
            onClick={() => setActiveView('forge')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'forge'
                ? 'bg-forge/10 text-forge'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Forge
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollaborationMode(!collaborationMode)}
            className={`p-1.5 rounded transition-colors ${
              collaborationMode
                ? 'bg-sync/20 text-sync animate-sync-pulse'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Collaboration Mode"
          >
            <GitMerge className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleAIPanel}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'split' && (
          <div className="h-full flex flex-col">
            {/* Sage Panel */}
            <div className="flex-1 min-h-0 border-b border-neural-border">
              <SagePanel compact />
            </div>

            {/* The Bridge - Collaboration Indicator */}
            {collaborationMode && (
              <TheBridge />
            )}

            {/* Forge Panel */}
            <div className="flex-1 min-h-0">
              <ForgePanel compact />
            </div>
          </div>
        )}

        {activeView === 'sage' && (
          <SagePanel />
        )}

        {activeView === 'forge' && (
          <ForgePanel />
        )}
      </div>
    </div>
  );
};
