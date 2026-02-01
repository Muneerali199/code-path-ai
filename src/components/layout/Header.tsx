import React, { useContext } from 'react';
import {
  Menu,
  Search,
  GitBranch,
  Settings,
  Command,
  Sparkles,
  Terminal,
  Play,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useAIStore } from '@/store/aiStore';
import { NavigationContext } from '@/App';

export const Header: React.FC = () => {
  const { toggleSidebar, sidebarVisible, toggleAIPanel, aiPanelVisible, toggleTerminal, terminalVisible, togglePreview, previewVisible } = useEditorStore();
  const { sageStatus, forgeStatus, collaborationMode } = useAIStore();
  const { navigate } = useContext(NavigationContext);

  const getStatusIndicator = () => {
    if (collaborationMode) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sync/10 border border-sync/30 animate-sync-pulse">
          <div className="w-2 h-2 rounded-full bg-sync" />
          <span className="text-xs text-sync font-medium">Sage + Forge Sync</span>
        </div>
      );
    }
    if (sageStatus === 'thinking') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 border border-sage/30">
          <div className="w-2 h-2 rounded-full bg-sage animate-thinking" />
          <span className="text-xs text-sage font-medium">Sage thinking...</span>
        </div>
      );
    }
    if (forgeStatus === 'generating') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge/10 border border-forge/30">
          <div className="w-2 h-2 rounded-full bg-forge animate-pulse-glow" />
          <span className="text-xs text-forge font-medium">Forge generating...</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs text-emerald-400 font-medium">AI Ready</span>
      </div>
    );
  };

  return (
    <header className="h-12 bg-neural-panel border-b border-neural-border flex items-center px-3 gap-2">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            sidebarVisible ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Sidebar (Ctrl+B)"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neural-border mx-1" />

        <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Search className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <GitBranch className="w-4 h-4" />
        </button>
      </div>

      {/* Center - Breadcrumbs & AI Status */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors">my-project</span>
          <span>/</span>
          <span className="hover:text-white cursor-pointer transition-colors">src</span>
          <span>/</span>
          <span className="text-white">App.tsx</span>
        </div>

        {getStatusIndicator()}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePreview}
          className={`p-2 rounded-lg transition-colors ${
            previewVisible ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Preview"
        >
          <Play className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTerminal}
          className={`p-2 rounded-lg transition-colors ${
            terminalVisible ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Terminal (Ctrl+`)"
        >
          <Terminal className="w-4 h-4" />
        </button>

        <button
          onClick={toggleAIPanel}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
            aiPanelVisible ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle AI Panel (Ctrl+Shift+A)"
        >
          <Sparkles className="w-4 h-4" />
          {aiPanelVisible && <span className="text-xs">AI</span>}
        </button>

        <div className="w-px h-6 bg-neural-border mx-1" />

        <button
          onClick={() => navigate('settings')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Command className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
