import { cn } from '@/lib/utils'
import type { CodeChange } from '@/services/sessionService'

interface SessionTimelineProps {
  changes: CodeChange[]
  sessionStart: string | null
  onViewDiff: (change: CodeChange) => void
  className?: string
}

/**
 * Timeline of all code changes in the current session.
 * Shows attribution (user vs AI), timestamps, and mini previews.
 */
export default function SessionTimeline({
  changes,
  sessionStart,
  onViewDiff,
  className,
}: SessionTimelineProps) {
  const elapsed = sessionStart
    ? Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000)
    : 0

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className={cn('flex flex-col bg-[#09090f]', className)}>
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] bg-[#0a0a12]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[12px] font-medium text-white/70">Session Timeline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-white/30 font-mono">{formatDuration(elapsed)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/20">
          <span>{changes.length} changes</span>
          <span>•</span>
          <span>
            {changes.filter(c => c.source === 'user').length} by you
          </span>
          <span>•</span>
          <span>
            {changes.filter(c => c.source !== 'user').length} by AI
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {changes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-[11px] text-white/20 text-center">
              Start coding to see your timeline.
              <br />
              Every change is tracked.
            </p>
          </div>
        ) : (
          <div className="py-2">
            {changes.slice().reverse().map((change, i) => {
              const isAI = change.source !== 'user'
              return (
                <button
                  key={change.id}
                  onClick={() => onViewDiff(change)}
                  className="w-full text-left px-3 py-2 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center mt-1 flex-shrink-0">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          isAI ? 'bg-violet-400' : 'bg-blue-400'
                        )}
                      />
                      {i < changes.length - 1 && (
                        <div className="w-px h-full bg-white/[0.06] mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded border font-medium',
                            isAI
                              ? 'bg-violet-500/15 text-violet-300 border-violet-500/25'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/25'
                          )}
                        >
                          {isAI ? 'AI' : 'You'}
                        </span>
                        <span className="text-[10px] text-white/20 font-mono">
                          {new Date(change.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-white/50 leading-snug truncate">
                        {change.description || `Modified ${change.fileName}`}
                      </p>

                      <p className="text-[10px] text-white/15 font-mono truncate mt-0.5">
                        {change.fileName}
                      </p>

                      {/* Mini concept tags */}
                      {change.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {change.concepts.slice(0, 3).map((c, j) => (
                            <span
                              key={j}
                              className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400/50"
                            >
                              {c}
                            </span>
                          ))}
                          {change.concepts.length > 3 && (
                            <span className="text-[8px] text-white/15">
                              +{change.concepts.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* View diff icon */}
                    <svg
                      className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
