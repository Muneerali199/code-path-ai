import { cn } from '@/lib/utils';

interface StatusBarProps {
  activePath: string;
  language: string;
  isRunning: boolean;
  className?: string;
}

export default function StatusBar({ activePath, language, isRunning, className }: StatusBarProps) {
  return (
    <div
      className={cn(
        'h-8 flex items-center justify-between px-3 bg-panel-header border-t border-border text-xs text-muted-foreground',
        className
      )}
    >
      <div className="truncate">{activePath}</div>
      <div className="flex items-center gap-3">
        <span className="capitalize">{language}</span>
        <span>{isRunning ? 'Running' : 'Ready'}</span>
      </div>
    </div>
  );
}

export { StatusBar };
