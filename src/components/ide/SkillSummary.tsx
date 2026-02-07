import { cn } from '@/lib/utils'

interface SkillSummaryProps {
  skills: string[]
  userChanges: number
  aiChanges: number
  sessionDuration: number
  className?: string
}

// Color map for skill categories
const SKILL_COLORS: Record<string, string> = {
  'React State (useState)': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'React Effects (useEffect)': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'React Refs (useRef)': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'React Memoization': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'React Context': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'JSX / Components': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'TypeScript Types': 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'Async / Await': 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'Promises': 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'API Calls': 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'Backend Integration': 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'Error Handling': 'bg-red-500/15 text-red-300 border-red-500/20',
  'Styling / CSS': 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  'Functions': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'Classes & OOP': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'Loops & Iteration': 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'Destructuring': 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'Spread / Rest Operators': 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'ES Modules': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  'Module Exports': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
}

const DEFAULT_COLOR = 'bg-white/[0.06] text-white/50 border-white/[0.08]'

/**
 * Displays extracted skills/concepts from the current session.
 * Visible proof of what the user learned/used.
 */
export default function SkillSummary({
  skills,
  userChanges,
  aiChanges,
  sessionDuration,
  className,
}: SkillSummaryProps) {
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    if (m < 1) return '<1 min'
    if (m < 60) return `${m} min`
    return `${Math.floor(m / 60)}h ${m % 60}m`
  }

  return (
    <div className={cn('flex flex-col bg-[#09090f]', className)}>
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] bg-[#0a0a12]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-[12px] font-medium text-white/70">Skills Used</span>
          <span className="text-[10px] text-white/20 ml-auto">{skills.length} concepts</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.06]">
        <div className="bg-[#09090f] p-2.5 text-center">
          <div className="text-[14px] font-semibold text-blue-400">{userChanges}</div>
          <div className="text-[9px] text-white/20 uppercase tracking-wider mt-0.5">Your code</div>
        </div>
        <div className="bg-[#09090f] p-2.5 text-center">
          <div className="text-[14px] font-semibold text-violet-400">{aiChanges}</div>
          <div className="text-[9px] text-white/20 uppercase tracking-wider mt-0.5">AI assist</div>
        </div>
        <div className="bg-[#09090f] p-2.5 text-center">
          <div className="text-[14px] font-semibold text-emerald-400">{formatDuration(sessionDuration)}</div>
          <div className="text-[9px] text-white/20 uppercase tracking-wider mt-0.5">Duration</div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-[11px] text-white/20 text-center">
              Skills appear as you code.
              <br />
              Every concept is tracked automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={i}
                className={cn(
                  'text-[10px] px-2 py-1 rounded-md border font-medium',
                  SKILL_COLORS[skill] || DEFAULT_COLOR
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {skills.length > 0 && (
        <div className="px-3 py-2 border-t border-white/[0.06] bg-[#0a0a12]/50">
          <div className="flex items-center gap-2 text-[10px] text-white/20">
            <svg className="w-3 h-3 text-emerald-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>These skills are saved to your profile</span>
          </div>
        </div>
      )}
    </div>
  )
}
