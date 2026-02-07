import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Boxes,
} from 'lucide-react';
import type { Dependency } from '@/services/dependencyService';

interface DependencyPanelProps {
  dependencies: Dependency[];
  isInstalling: boolean;
  onInstall: () => void;
  onRetry?: () => void;
  compact?: boolean;
}

const statusIcon = (status: Dependency['status']) => {
  switch (status) {
    case 'installed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case 'error':
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case 'resolving':
      return <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
    default:
      return <Package className="w-3.5 h-3.5 text-gray-500" />;
  }
};

const statusColor = (status: Dependency['status']) => {
  switch (status) {
    case 'installed':
      return 'text-emerald-400';
    case 'error':
      return 'text-red-400';
    case 'resolving':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

const statusLabel = (status: Dependency['status']) => {
  switch (status) {
    case 'installed':
      return 'Installed';
    case 'error':
      return 'Failed';
    case 'resolving':
      return 'Installing...';
    default:
      return 'Pending';
  }
};

export const DependencyPanel: React.FC<DependencyPanelProps> = ({
  dependencies,
  isInstalling,
  onInstall,
  onRetry,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [installProgress, setInstallProgress] = useState(0);

  const installedCount = dependencies.filter((d) => d.status === 'installed').length;
  const errorCount = dependencies.filter((d) => d.status === 'error').length;
  const totalCount = dependencies.length;
  const allInstalled = installedCount === totalCount && totalCount > 0;

  useEffect(() => {
    if (totalCount > 0) {
      setInstallProgress(Math.round((installedCount / totalCount) * 100));
    }
  }, [installedCount, totalCount]);

  if (dependencies.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
        <Boxes className="w-3.5 h-3.5" />
        <span>No external dependencies detected</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a12] border-t border-white/[0.06] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors"
        title="Toggle dependency panel"
      >
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[11px] font-medium text-white/60">
            Dependencies
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-medium">
            {installedCount}/{totalCount}
          </span>
          {allInstalled && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              Ready
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">
              {errorCount} failed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isInstalling && (
            <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Progress bar */}
      {isInstalling && (
        <div className="px-3 pb-1">
          <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className={`h-full bg-violet-500 rounded-full transition-all duration-500 ${
                installProgress <= 25 ? 'w-1/4' :
                installProgress <= 50 ? 'w-1/2' :
                installProgress <= 75 ? 'w-3/4' : 'w-full'
              }`}
            />
          </div>
        </div>
      )}

      {/* Dependency list */}
      {expanded && (
        <div className={`px-3 pb-2 space-y-1 ${compact ? 'max-h-32' : 'max-h-48'} overflow-y-auto`}>
          {dependencies.map((dep) => (
            <div
              key={dep.name}
              className="flex items-center justify-between py-1 px-2 rounded bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {statusIcon(dep.status)}
                <span className="text-[11px] text-white/70 font-mono truncate">
                  {dep.name}
                </span>
                {dep.version && dep.version !== 'latest' && (
                  <span className="text-[10px] text-white/30">
                    @{dep.version}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${statusColor(dep.status)} whitespace-nowrap`}>
                {statusLabel(dep.status)}
              </span>
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            {!allInstalled && !isInstalling && (
              <button
                onClick={onInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[11px] font-medium hover:bg-violet-500/30 transition-colors"
                title="Install dependencies"
              >
                <Download className="w-3 h-3" />
                Install All
              </button>
            )}
            {errorCount > 0 && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white/60 text-[11px] hover:bg-white/10 transition-colors"
                title="Retry failed installations"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Failed
              </button>
            )}
            {allInstalled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400/70 text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                All dependencies installed — preview ready
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyPanel;
