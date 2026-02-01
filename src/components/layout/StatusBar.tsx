import React, { useContext } from 'react';
import {
  GitBranch,
  Wifi,
  WifiOff,
  Bell,
  Brain,
} from 'lucide-react';
import { useAIStore } from '@/store/aiStore';
import { useSettingsStore } from '@/store/settingsStore';
import { NavigationContext } from '@/App';

export const StatusBar: React.FC = () => {
  const { sageStatus, forgeStatus } = useAIStore();
  const { mcp } = useSettingsStore();
  const { navigate } = useContext(NavigationContext);

  const isMCPConnected = mcp.enabled;

  return (
    <footer className="h-7 bg-neural-panel border-t border-neural-border flex items-center px-3 text-xs">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Git Branch */}
        <div className="flex items-center gap-1.5 text-gray-400 hover:text-white cursor-pointer transition-colors">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main</span>
          <span className="text-gray-600">•</span>
          <span className="text-forge">0↑ 0↓</span>
        </div>

        {/* Errors & Warnings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>0</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Center - AI Status */}
      <div className="flex-1 flex items-center justify-center gap-4">
        {/* Sage Status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            sageStatus === 'thinking' ? 'bg-sage animate-thinking' :
            sageStatus === 'responding' ? 'bg-sage animate-pulse' :
            'bg-gray-500'
          }`} />
          <span className="text-gray-400">Sage</span>
          <span className="text-gray-600">
            {sageStatus === 'thinking' ? 'thinking...' :
             sageStatus === 'responding' ? 'responding' :
             'idle'}
          </span>
        </div>

        {/* Forge Status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            forgeStatus === 'generating' ? 'bg-forge animate-pulse-glow' :
            forgeStatus === 'thinking' ? 'bg-forge animate-thinking' :
            'bg-gray-500'
          }`} />
          <span className="text-gray-400">Forge</span>
          <span className="text-gray-600">
            {forgeStatus === 'generating' ? 'generating...' :
             forgeStatus === 'thinking' ? 'thinking' :
             'idle'}
          </span>
        </div>

        {/* MCP Status */}
        <button
          onClick={() => navigate('mcp')}
          className="flex items-center gap-1.5 hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
        >
          {isMCPConnected ? (
            <>
              <Wifi className="w-3 h-3 text-forge" />
              <span className="text-gray-400">MCP</span>
              <span className="text-forge">connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-gray-500" />
              <span className="text-gray-400">MCP</span>
              <span className="text-gray-500">offline</span>
            </>
          )}
        </button>

        {/* Models */}
        <button
          onClick={() => navigate('models')}
          className="flex items-center gap-1.5 hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
        >
          <Brain className="w-3 h-3 text-sync" />
          <span className="text-gray-400">Models</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Line/Column */}
        <div className="text-gray-400">
          Ln 12, Col 34
        </div>

        {/* Encoding */}
        <div className="text-gray-400">
          UTF-8
        </div>

        {/* Language */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="text-yellow-400">TS</span>
          <span>TypeScript</span>
        </div>

        {/* Notifications */}
        <button className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
