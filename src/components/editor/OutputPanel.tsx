import { Terminal, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OutputPanelProps {
  output: string;
  error?: string;
  isRunning: boolean;
}

export default function OutputPanel({ output, error, isRunning }: OutputPanelProps) {
  return (
    <div className="h-full flex flex-col bg-terminal rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-panel-header border-b border-border">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Output</span>
        {isRunning && (
          <div className="flex items-center gap-1 ml-auto text-warning">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Running...</span>
          </div>
        )}
        {!isRunning && output && !error && (
          <div className="flex items-center gap-1 ml-auto text-success">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-xs">Success</span>
          </div>
        )}
        {!isRunning && error && (
          <div className="flex items-center gap-1 ml-auto text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">Error</span>
          </div>
        )}
      </div>

      {/* Output Content */}
      <ScrollArea className="flex-1 p-4">
        {!output && !error && !isRunning && (
          <p className="text-muted-foreground text-sm font-mono">
            Run your code to see output here...
          </p>
        )}
        {isRunning && (
          <p className="text-muted-foreground text-sm font-mono animate-pulse">
            Executing code...
          </p>
        )}
        {output && (
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
            {output}
          </pre>
        )}
        {error && (
          <pre className="text-sm font-mono text-destructive whitespace-pre-wrap">
            {error}
          </pre>
        )}
      </ScrollArea>
    </div>
  );
}
