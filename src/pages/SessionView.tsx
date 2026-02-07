import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession, type CodingSession, type CodeChange } from '@/services/sessionService'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDuration(seconds: number) {
  if (seconds < 60) return '<1 minute'
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m} minute${m !== 1 ? 's' : ''}`
}

function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript (React)', js: 'JavaScript', jsx: 'JavaScript (React)',
    py: 'Python', java: 'Java', go: 'Go', rs: 'Rust', rb: 'Ruby', php: 'PHP',
    css: 'CSS', scss: 'SCSS', html: 'HTML', json: 'JSON', md: 'Markdown',
    sql: 'SQL', sh: 'Shell', yml: 'YAML', yaml: 'YAML',
  }
  return map[ext || ''] || ext?.toUpperCase() || ''
}

// ─── Session Status ──────────────────────────────────

type SessionStatus = 'Completed' | 'Abandoned' | 'Exploratory' | 'No Activity'

function deriveSessionStatus(session: CodingSession): SessionStatus {
  const changes = session.changes
  const hasChanges = changes.length > 0
  const hasOutput = changes.some(c => c.after.trim().length > 0)
  const hasEnded = !!session.ended_at

  if (!hasChanges) return 'No Activity'
  if (hasChanges && hasOutput && hasEnded) return 'Completed'
  if (hasChanges && !hasOutput) return 'Abandoned'
  return 'Exploratory'
}

const STATUS_CONFIG: Record<SessionStatus, { color: string; bg: string; border: string; label: string }> = {
  'Completed': {
    color: 'text-emerald-300/80', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    label: 'Completed',
  },
  'Abandoned': {
    color: 'text-amber-300/80', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    label: 'Abandoned',
  },
  'Exploratory': {
    color: 'text-sky-300/80', bg: 'bg-sky-500/10', border: 'border-sky-500/20',
    label: 'Exploratory',
  },
  'No Activity': {
    color: 'text-white/30', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]',
    label: 'No Activity',
  },
}

// ─── Derive helpers ──────────────────────────────────

function deriveObjective(session: CodingSession): string {
  if (session.summary && session.summary !== `Session with ${session.changes.length} code changes.`) {
    return session.summary
  }
  const descriptions = session.changes
    .filter(c => c.description)
    .map(c => c.description)
  if (descriptions.length > 0) return descriptions[0]
  return ''
}

function deriveWhatChanged(changes: CodeChange[]): string[] {
  const bullets: string[] = []
  const descs = changes.filter(c => c.description).map(c => c.description)
  const seen = new Set<string>()
  for (const d of descs) {
    const normalized = d.toLowerCase().trim()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      bullets.push(d)
    }
    if (bullets.length >= 6) break
  }
  return bullets
}

// ─── Code Diff Block ─────────────────────────────────

function CodeBlock({ code, variant }: { code: string; variant: 'before' | 'after' }) {
  const lines = code.split('\n')
  const maxLines = 20
  const truncated = lines.length > maxLines
  const displayed = truncated ? lines.slice(0, maxLines) : lines

  return (
    <div className="relative">
      <div className={cn(
        'rounded-lg border overflow-hidden font-mono text-[11px] leading-[1.6]',
        variant === 'before'
          ? 'bg-red-500/[0.03] border-red-500/10'
          : 'bg-emerald-500/[0.03] border-emerald-500/10'
      )}>
        <div className={cn(
          'px-3 py-1.5 text-[9px] font-sans font-medium tracking-wide uppercase border-b',
          variant === 'before'
            ? 'text-red-300/50 bg-red-500/[0.05] border-red-500/10'
            : 'text-emerald-300/50 bg-emerald-500/[0.05] border-emerald-500/10'
        )}>
          {variant === 'before' ? 'Before' : 'After'}
        </div>
        <div className="p-3 overflow-x-auto">
          {displayed.map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-8 text-right pr-3 text-white/10 shrink-0">{i + 1}</span>
              <span className="text-white/50 whitespace-pre">{line}</span>
            </div>
          ))}
          {truncated && (
            <div className="pt-1 text-white/15 text-[10px]">… {lines.length - maxLines} more lines</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────

export default function SessionView() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<CodingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expandedChange, setExpandedChange] = useState<number | null>(0)

  useEffect(() => {
    if (!sessionId) { setNotFound(true); setLoading(false); return }
    ;(async () => {
      try {
        const data = await getSession(sessionId)
        if (!data) { setNotFound(true); setLoading(false); return }
        setSession(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  // ── Computed ──
  const analysis = useMemo(() => {
    if (!session) return null
    const changes = session.changes
    const userChanges = changes.filter(c => c.source === 'user')
    const aiChanges = changes.filter(c => c.source !== 'user')
    const total = userChanges.length + aiChanges.length
    const userPct = total > 0 ? Math.round((userChanges.length / total) * 100) : 100
    const aiPct = total > 0 ? 100 - userPct : 0
    const aiLevel: 'None' | 'Low' | 'Medium' | 'High' =
      total === 0 ? 'None' : aiPct < 20 ? 'Low' : aiPct < 50 ? 'Medium' : 'High'

    const duration = session.duration_seconds || 0
    const status = deriveSessionStatus(session)
    const languages = [...new Set(changes.map(c => detectLanguage(c.fileName)).filter(Boolean))]
    const files = [...new Set(changes.map(c => c.fileName))]
    const objective = deriveObjective(session)
    const whatChanged = deriveWhatChanged(changes)
    const hasOutput = changes.some(c => c.after.trim().length > 0)
    const failedAttempts = changes.filter(c => c.source === 'user' && c.after.trim() === '').length

    // Is this a meaningful session worth showing full analysis?
    const isMeaningful = total > 0

    return {
      userPct, aiPct, aiLevel, duration, status,
      languages, files, objective, whatChanged,
      hasOutput, failedAttempts,
      userChanges: userChanges.length,
      aiChanges: aiChanges.length,
      totalChanges: total,
      isMeaningful,
    }
  }, [session])

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090f] page-enter">
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
          <div className="w-24 h-8 skeleton rounded" />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
            <div className="w-3/5 h-5 skeleton rounded" />
            <div className="flex gap-4">
              {[100, 80, 120, 90].map((w, i) => (
                <div key={i} style={{ width: w }} className="h-4 skeleton rounded" />
              ))}
            </div>
          </div>
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
              <div className="w-2/5 h-4 skeleton rounded" />
              <div className="w-full h-32 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Not found ──
  if (notFound || !session || !analysis) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white/60">Session not found</h1>
          <p className="text-[12px] text-white/25">This session may have been deleted or the link is invalid.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-[12px] px-4 py-1.5 rounded-md bg-violet-500/10 text-violet-300/70 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[analysis.status]
  const changes = session.changes

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMPTY / NO-ACTIVITY SESSION → Minimal card, not full page
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!analysis.isMeaningful) {
    return (
      <div className="min-h-screen bg-[#09090f] text-white/70 page-enter">
        <header className="sticky top-0 z-40 bg-[#09090f]/90 backdrop-blur-lg border-b border-white/[0.04]">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', statusCfg.bg, statusCfg.color, statusCfg.border)}>
              {statusCfg.label}
            </span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>

            <div>
              <h1 className="text-[15px] font-semibold text-white/60 mb-2">{session.title}</h1>
              <p className="text-[13px] text-white/25 leading-relaxed">
                Session opened but no code modifications were made.
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 text-[11px] text-white/20">
              <span>{formatDate(session.started_at)}</span>
              <span className="text-white/8">|</span>
              <span>{formatDuration(analysis.duration)}</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg px-5 py-4">
              <p className="text-[12px] text-white/30 leading-relaxed">
                No edits, AI interactions, or code runs were recorded.
                This may have been a brief visit or environment check.
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-[12px] px-5 py-2 rounded-md bg-violet-500/10 text-violet-300/60 border border-violet-500/20 hover:bg-violet-500/15 transition-colors"
            >
              ← Back to Profile
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEANINGFUL SESSION → Full analysis view
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen bg-[#09090f] text-white/70 page-enter">
      {/* ━━ Sticky Top Bar ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-40 bg-[#09090f]/90 backdrop-blur-lg border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <div className="flex items-center gap-3">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', statusCfg.bg, statusCfg.color, statusCfg.border)}>
              {statusCfg.label}
            </span>
            <span className="text-[10px] text-white/20 font-mono">
              {sessionId?.slice(0, 8)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ━━ 1. Basic Info Card ━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h1 className="text-lg font-semibold text-white/80 mb-4">{session.title}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Date</div>
              <div className="text-[13px] text-white/60">{formatDate(session.started_at)}</div>
            </div>
            <div>
              <div className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Duration</div>
              <div className="text-[13px] text-white/60">{formatDuration(analysis.duration)}</div>
            </div>
            {analysis.languages.length > 0 && (
              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Language</div>
                <div className="text-[13px] text-white/60">{analysis.languages.join(', ')}</div>
              </div>
            )}
            {analysis.files.length > 0 && (
              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Files Touched</div>
                <div className="text-[13px] text-white/60">{analysis.files.length}</div>
              </div>
            )}
          </div>
        </section>

        {/* ━━ 2. Objective (only if meaningful) ━━━━━━━ */}
        {analysis.objective && (
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-violet-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">Objective</h2>
            </div>
            <p className="text-[14px] text-white/60 leading-relaxed">{analysis.objective}</p>
          </section>
        )}

        {/* ━━ 3. AI Involvement + Skills ━━━━━━━━━━━━━━ */}
        <div className={cn(
          'grid gap-4',
          session.skills.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        )}>
          {/* AI Involvement */}
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-violet-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">AI Involvement</h2>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={cn(
                'text-[11px] px-2.5 py-1 rounded-full border font-semibold',
                analysis.aiLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-300/80 border-emerald-500/20' :
                analysis.aiLevel === 'Medium' ? 'bg-amber-500/10 text-amber-300/80 border-amber-500/20' :
                analysis.aiLevel === 'High' ? 'bg-red-500/10 text-red-300/80 border-red-500/20' :
                'bg-white/[0.05] text-white/40 border-white/[0.1]'
              )}>
                {analysis.aiLevel}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-300/60">User: {analysis.userPct}%</span>
                <span className="text-violet-300/60">AI: {analysis.aiPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-blue-500/60 to-blue-400/40 transition-all duration-500 rounded-l-full"
                  style={{ width: `${analysis.userPct}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-violet-500/60 to-violet-400/40 transition-all duration-500 rounded-r-full"
                  style={{ width: `${analysis.aiPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/20">
                <span>{analysis.userChanges} edit{analysis.userChanges !== 1 ? 's' : ''}</span>
                <span>{analysis.aiChanges} assist{analysis.aiChanges !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </section>

          {/* Skills — ONLY if detected */}
          {session.skills.length > 0 && (
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">Skills Demonstrated</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {session.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-1 rounded-md bg-emerald-500/8 text-emerald-300/60 border border-emerald-500/15"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ━━ 4. What Changed — ONLY if bullets exist ━━ */}
        {analysis.whatChanged.length > 0 && (
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">What Changed</h2>
            </div>
            <ul className="space-y-1.5">
              {analysis.whatChanged.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-white/55 leading-relaxed">
                  <span className="text-violet-400/50 mt-0.5 shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ━━ 5. Validation — ONLY if there is evidence ━━ */}
        {(analysis.hasOutput || analysis.status === 'Completed') && (
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">Validation</h2>
            </div>
            <div className="space-y-2">
              {analysis.hasOutput && (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-emerald-400/70">✓</span>
                  <span className="text-white/50">Produced working output</span>
                </div>
              )}
              {analysis.status === 'Completed' && (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-emerald-400/70">✓</span>
                  <span className="text-white/50">Session completed successfully</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-emerald-400/70">✓</span>
                <span className="text-white/50">{analysis.totalChanges} code change{analysis.totalChanges !== 1 ? 's' : ''} recorded</span>
              </div>
            </div>
          </section>
        )}

        {/* ━━ 6. Work Pattern — only if insightful ━━━━ */}
        {(analysis.failedAttempts > 0 || analysis.totalChanges > 1 || analysis.duration >= 120) && (
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-sky-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">Work Pattern</h2>
            </div>
            <div className="space-y-1.5 text-[12px] text-white/45">
              {analysis.duration >= 60 && (
                <p>Resolved within <span className="text-white/60 font-medium">{formatDuration(analysis.duration)}</span></p>
              )}
              <p>
                <span className="text-white/60 font-medium">{analysis.totalChanges}</span> edit{analysis.totalChanges !== 1 ? 's' : ''} across{' '}
                <span className="text-white/60 font-medium">{analysis.files.length}</span> file{analysis.files.length !== 1 ? 's' : ''}
              </p>
              {analysis.failedAttempts > 0 && (
                <p><span className="text-white/60 font-medium">{analysis.failedAttempts}</span> attempt{analysis.failedAttempts !== 1 ? 's' : ''} before final result — shows iteration</p>
              )}
              {analysis.userPct > 70 && (
                <p className="text-emerald-300/50">Primarily independent work</p>
              )}
              {analysis.aiPct > 50 && (
                <p className="text-violet-300/50">Heavily AI-assisted session</p>
              )}
            </div>
          </section>
        )}

        {/* ━━ 7. Code Changes (Before / After) ━━━━━━━ */}
        {changes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">Code Changes</h2>
              <span className="text-[10px] text-white/20 ml-auto">{changes.length} change{changes.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-3">
              {changes.map((change, i) => (
                <ChangeCard
                  key={change.id || i}
                  change={change}
                  index={i}
                  isExpanded={expandedChange === i}
                  onToggle={() => setExpandedChange(expandedChange === i ? null : i)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ━━ 8. Session Summary ━━━━━━━━━━━━━━━━━━━━━ */}
        {session.summary && session.summary !== `Session with ${session.changes.length} code changes.` && (
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-violet-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">Explanation</h2>
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed">{session.summary}</p>
          </section>
        )}

        {/* ━━ Footer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer className="border-t border-white/[0.04] pt-6 pb-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/15">
            <svg className="w-3.5 h-3.5 text-emerald-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified session recorded by CodePath AI</span>
          </div>
          <p className="text-[10px] text-white/10">
            All code changes are real, timestamped events from live development.
          </p>
        </footer>
      </main>
    </div>
  )
}

// ─── Change Card Component ───────────────────────────

function ChangeCard({
  change,
  index,
  isExpanded,
  onToggle,
}: {
  change: CodeChange
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasBefore = change.before.trim().length > 0
  const hasAfter = change.after.trim().length > 0

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-3.5 hover:bg-white/[0.015] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-white/15 font-mono w-5">#{index + 1}</span>
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 rounded border font-medium shrink-0',
              change.source === 'user'
                ? 'bg-blue-500/12 text-blue-300/70 border-blue-500/20'
                : 'bg-violet-500/12 text-violet-300/70 border-violet-500/20'
            )}>
              {change.source === 'user' ? 'User' : change.source === 'ai-generate' ? 'AI Generate' : change.source === 'ai-modify' ? 'AI Modify' : 'AI Explain'}
            </span>
            <span className="text-[11px] text-white/30 font-mono truncate">{change.fileName}</span>
          </div>
          <svg
            className={cn('w-4 h-4 text-white/15 transition-transform shrink-0', isExpanded && 'rotate-180')}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {change.description && (
          <p className="text-[12px] text-white/40 mt-1.5 ml-[30px] leading-relaxed line-clamp-2">
            {change.description}
          </p>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.04] px-5 py-4 space-y-4">
          {hasBefore && hasAfter ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <CodeBlock code={change.before} variant="before" />
              <CodeBlock code={change.after} variant="after" />
            </div>
          ) : hasAfter ? (
            <CodeBlock code={change.after} variant="after" />
          ) : hasBefore ? (
            <CodeBlock code={change.before} variant="before" />
          ) : (
            <p className="text-[11px] text-white/20">No code content recorded.</p>
          )}

          {change.concepts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {change.concepts.map((c, j) => (
                <span key={j} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/8 text-emerald-300/50 border border-emerald-500/12">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
