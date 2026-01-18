interface StatusBarProps {
  activePath: string;
  language: string;
  isRunning: boolean;
}

export default function StatusBar({ activePath, language, isRunning }: StatusBarProps) {
  return (
    <div className="h-8 flex items-center justify-between px-3 bg-panel-header border-t border-border text-xs text-muted-foreground">
      <div className="truncate">{activePath}</div>
      <div className="flex items-center gap-3">
        <span className="capitalize">{language}</span>
        <span>{isRunning ? 'Running' : 'Ready'}</span>
      </div>
    </div>
  );
}
