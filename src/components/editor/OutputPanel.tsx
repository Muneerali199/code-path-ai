import { Terminal, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  output: string;
  error?: string;
  isRunning: boolean;
  className?: string;
}

export default function OutputPanel({ output, error, isRunning, className }: OutputPanelProps) {
  return (
    <div className={cn("h-full flex flex-col bg-[#0a0a12] rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0c0c14] border-b border-white/[0.06]">
        <Terminal className="h-3.5 w-3.5 text-white/20" />
        <span className="text-[11px] font-medium text-white/40">Output</span>
        {isRunning && (
          <div className="flex items-center gap-1.5 ml-auto">
            <Loader2 className="h-3 w-3 animate-spin text-violet-400/70" />
            <span className="text-[10px] text-violet-400/50">Running...</span>
          </div>
        )}
        {!isRunning && output && !error && (
          <div className="flex items-center gap-1.5 ml-auto">
            <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
            <span className="text-[10px] text-emerald-400/50">Success</span>
          </div>
        )}
        {!isRunning && error && (
          <div className="flex items-center gap-1.5 ml-auto">
            <AlertCircle className="h-3 w-3 text-red-400/60" />
            <span className="text-[10px] text-red-400/50">Error</span>
          </div>
        )}
      </div>

      {/* Output Content */}
      <ScrollArea className="flex-1 p-3 bg-[#0a0a12]">
        {!output && !error && !isRunning && (
          <p className="text-white/15 text-[12px] font-mono">
            Run your code to see output here...
          </p>
        )}
        {isRunning && (
          <p className="text-violet-400/40 text-[12px] font-mono animate-pulse">
            Executing code...
          </p>
        )}
        {output && (
          <pre className="text-[12px] font-mono text-white/60 whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        )}
        {error && (
          <pre className="text-[12px] font-mono text-red-400/70 whitespace-pre-wrap leading-relaxed">
            {error}
          </pre>
        )}
      </ScrollArea>
    </div>
  );
}

export { OutputPanel };
