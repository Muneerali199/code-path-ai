import React from 'react';
import { GitMerge, ArrowRight, Sparkles } from 'lucide-react';
import { useAIStore } from '@/store/aiStore';

export const TheBridge: React.FC = () => {
  const { sageStatus, forgeStatus } = useAIStore();

  const isCollaborating = sageStatus !== 'idle' || forgeStatus !== 'idle';

  return (
    <div className="h-12 flex items-center justify-center bg-sync/5 border-y border-sync/20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-sage/20 via-sync/20 to-forge/20" />
      </div>

      {/* Connection lines animation */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ff9d" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        
        {/* Animated path */}
        <path
          d="M 0 24 Q 50% 10, 100% 24"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="5,5"
          className={isCollaborating ? 'animate-pulse' : ''}
        />
        <path
          d="M 0 24 Q 50% 38, 100% 24"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="5,5"
          className={isCollaborating ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.5s' }}
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sage/10 border border-sage/30">
          <div className={`w-2 h-2 rounded-full bg-sage ${sageStatus !== 'idle' ? 'animate-thinking' : ''}`} />
          <span className="text-xs text-sage">Sage</span>
        </div>

        <div className="flex items-center gap-1">
          <GitMerge className="w-4 h-4 text-sync animate-sync-pulse" />
          <ArrowRight className="w-3 h-3 text-sync" />
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-forge/10 border border-forge/30">
          <div className={`w-2 h-2 rounded-full bg-forge ${forgeStatus !== 'idle' ? 'animate-pulse-glow' : ''}`} />
          <span className="text-xs text-forge">Forge</span>
        </div>

        {isCollaborating && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sync/20 animate-sync-pulse">
            <Sparkles className="w-3 h-3 text-sync" />
            <span className="text-xs text-sync font-medium">Collaborating</span>
          </div>
        )}
      </div>

      {/* Data flow particles */}
      {isCollaborating && (
        <>
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-sage animate-ping" />
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-sync animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute left-3/4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-forge animate-ping" style={{ animationDelay: '0.6s' }} />
        </>
      )}
    </div>
  );
};
