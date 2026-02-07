import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface StatusBarProps {
  activePath: string;
  language: string;
  isRunning: boolean;
  changeCount?: number;
  sessionStart?: string | null;
  syntaxOk?: boolean;
  className?: string;
}

export default function StatusBar({
  activePath,
  language,
  isRunning,
  changeCount = 0,
  sessionStart,
  syntaxOk = true,
  className,
}: StatusBarProps) {
  const [elapsed, setElapsed] = useState(0);

  // Session timer
  useEffect(() => {
    if (!sessionStart) return;
    const start = new Date(sessionStart).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'h-6 flex items-center justify-between px-3 bg-[#0a0a12] border-t border-white/[0.06] text-[10px] text-white/25',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isRunning ? (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
            <span className="text-violet-400/60">Running</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>
            <span className="text-white/20">Ready</span>
          </div>
        )}
        <span className="text-white/10">|</span>
        <span className="truncate text-white/30">{activePath}</span>

        {/* Syntax validation indicator */}
        <span className="text-white/10">|</span>
        {syntaxOk ? (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-400/40">No errors</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.99L13.73 4.01c-.77-1.33-2.69-1.33-3.46 0L3.34 16.01C2.57 17.33 3.53 19 5.07 19z" />
            </svg>
            <span className="text-red-400/50">Issues found</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Session timer */}
        {sessionStart && (
          <>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse"></span>
              <span className="text-white/25 font-mono">{formatTime(elapsed)}</span>
            </div>
            <span className="text-white/10">|</span>
          </>
        )}

        {/* Change counter */}
        {changeCount > 0 && (
          <>
            <span className="text-violet-400/40">{changeCount} change{changeCount !== 1 ? 's' : ''}</span>
            <span className="text-white/10">|</span>
          </>
        )}

        <span className="capitalize text-white/30">{language}</span>
        <span className="text-white/15">UTF-8</span>
      </div>
    </div>
  );
}

export { StatusBar };
