import { DiffEditor } from '@monaco-editor/react'
import { cn } from '@/lib/utils'
import type { CodeChange } from '@/services/sessionService'

interface DiffViewProps {
  change: CodeChange | null
  onClose: () => void
  className?: string
}

/**
 * Before → After diff viewer using Monaco DiffEditor.
 * Shows exactly what changed with attribution labels.
 */
export default function DiffView({ change, onClose, className }: DiffViewProps) {
  if (!change) return null

  const sourceLabel =
    change.source === 'user' ? 'You wrote' :
    change.source === 'ai-generate' ? 'AI generated' :
    change.source === 'ai-modify' ? 'AI modified' :
    change.source === 'ai-explain' ? 'AI suggested' : 'Change'

  const sourceBadgeColor =
    change.source === 'user'
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      : 'bg-violet-500/20 text-violet-300 border-violet-500/30'

  return (
    <div className={cn('flex flex-col bg-[#09090f] border-l border-white/[0.06]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0a12] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[12px] font-medium text-white/70">Before → After</span>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', sourceBadgeColor)}>
            {sourceLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/[0.06] rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* File info + description */}
      <div className="px-3 py-2 border-b border-white/[0.06] bg-[#0c0c14]/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] text-white/40 font-mono">{change.fileName}</span>
          <span className="text-[10px] text-white/15">
            {new Date(change.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {change.description && (
          <p className="text-[11px] text-white/35 leading-relaxed">{change.description}</p>
        )}
        {change.concepts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {change.concepts.map((c, i) => (
              <span
                key={i}
                className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300/70 border border-emerald-500/20"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Diff labels */}
      <div className="flex text-[10px] border-b border-white/[0.06]">
        <div className="flex-1 px-3 py-1 bg-red-500/[0.04] text-red-300/50 border-r border-white/[0.06]">
          ← Before
        </div>
        <div className="flex-1 px-3 py-1 bg-green-500/[0.04] text-green-300/50">
          After →
        </div>
      </div>

      {/* Monaco Diff Editor */}
      <div className="flex-1 min-h-0">
        <DiffEditor
          original={change.before}
          modified={change.after}
          language={getLanguageFromFileName(change.fileName)}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            renderSideBySide: true,
            lineNumbers: 'on',
            folding: false,
            renderOverviewRuler: false,
            diffWordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}

function getLanguageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    css: 'css', html: 'html', json: 'json', md: 'markdown', py: 'python',
    java: 'java', cpp: 'cpp', rs: 'rust', go: 'go', sql: 'sql',
  }
  return map[ext || ''] || 'plaintext'
}
