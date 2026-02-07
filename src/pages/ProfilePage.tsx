import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import {
  listSessions,
  getSession,
  getUserSkillProfile,
  type CodingSession,
  type SessionSummary,
} from '@/services/sessionService'
import {
  getMyPublicProfile,
  getProfileByUsername,
  upsertPublicProfile,
  findUniqueUsername,
  generateUsername,
  type PublicProfile,
} from '@/services/publicProfileService'
import { cn } from '@/lib/utils'

// ─── Activity Calendar ──────────────────────────────

function ActivityCalendar({ sessions }: { sessions: SessionSummary[] }) {
  const today = new Date()
  const weeks = 20 // ~5 months
  const totalDays = weeks * 7

  const activeDates = useMemo(() => {
    const set = new Set<string>()
    for (const s of sessions) {
      const d = new Date(s.started_at)
      set.add(d.toISOString().slice(0, 10))
    }
    return set
  }, [sessions])

  const days = useMemo(() => {
    const arr: { date: string; level: number }[] = []
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const count = sessions.filter(s => new Date(s.started_at).toISOString().slice(0, 10) === key).length
      arr.push({ date: key, level: count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : 3 })
    }
    return arr
  }, [sessions, totalDays])

  const { streak, longestStreak, activeDaysThisMonth } = useMemo(() => {
    let streak = 0
    let longestStreak = 0
    let currentStreak = 0
    const thisMonth = today.toISOString().slice(0, 7)
    let activeDaysThisMonth = 0

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (activeDates.has(key)) {
        currentStreak++
        if (i < 30 && key.startsWith(thisMonth)) activeDaysThisMonth++
      } else {
        if (currentStreak > longestStreak) longestStreak = currentStreak
        currentStreak = 0
      }
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak

    streak = 0
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (activeDates.has(key)) streak++
      else break
    }

    return { streak, longestStreak, activeDaysThisMonth }
  }, [activeDates, totalDays])

  const levelColors = [
    'bg-white/[0.04]',
    'bg-emerald-500/30',
    'bg-emerald-500/55',
    'bg-emerald-500/85',
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-[3px]">
        {days.map((day, i) => (
          <div
            key={i}
            title={`${day.date}${day.level > 0 ? ` — ${day.level} session${day.level > 1 ? 's' : ''}` : ''}`}
            className={cn('w-[11px] h-[11px] rounded-[2px]', levelColors[day.level])}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[11px] text-white/30">
        <span>Active this month: <span className="text-white/60">{activeDaysThisMonth}</span></span>
        <span>Current streak: <span className="text-emerald-400/80">{streak} days</span></span>
        <span>Longest streak: <span className="text-white/50">{longestStreak} days</span></span>
      </div>
    </div>
  )
}

// ─── Session Card ────────────────────────────────────

function SessionCard({ session, detail }: { session: SessionSummary; detail: CodingSession | null }) {
  const [expanded, setExpanded] = useState(false)
  const changes = detail?.changes || []
  const userChanges = changes.filter(c => c.source === 'user').length
  const aiChanges = changes.filter(c => c.source !== 'user').length
  const total = userChanges + aiChanges
  const aiLevel = total === 0 ? 'None' : aiChanges / total < 0.2 ? 'Low' : aiChanges / total < 0.5 ? 'Medium' : 'High'

  const duration = session.duration_seconds
  const minutes = Math.floor(duration / 60)

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-[13px] font-medium text-white/70">{session.title}</h4>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 rounded border',
              aiLevel === 'Low' ? 'bg-green-500/10 text-green-300/70 border-green-500/20' :
              aiLevel === 'Medium' ? 'bg-amber-500/10 text-amber-300/70 border-amber-500/20' :
              aiLevel === 'High' ? 'bg-red-500/10 text-red-300/70 border-red-500/20' :
              'bg-white/[0.04] text-white/30 border-white/[0.08]'
            )}>
              AI: {aiLevel}
            </span>
            <svg className={cn('w-3.5 h-3.5 text-white/20 transition-transform', expanded && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/25">
          <span>{new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>·</span>
          <span>{minutes > 0 ? `${minutes} min` : '<1 min'}</span>
          <span>·</span>
          <span>{session.change_count} changes</span>
        </div>
        {session.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {session.skills.slice(0, 5).map((skill, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300/60 border border-violet-500/15">
                {skill}
              </span>
            ))}
            {session.skills.length > 5 && (
              <span className="text-[9px] text-white/15">+{session.skills.length - 5}</span>
            )}
          </div>
        )}
      </button>

      {expanded && detail && (
        <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
          {changes.length > 0 ? changes.slice(0, 4).map((change, i) => (
            <div key={i} className="bg-white/[0.02] rounded p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded border font-medium',
                  change.source === 'user'
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/25'
                    : 'bg-violet-500/15 text-violet-300 border-violet-500/25'
                )}>
                  {change.source === 'user' ? 'User' : 'AI'}
                </span>
                <span className="text-[10px] text-white/20 font-mono">{change.fileName}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">{change.description}</p>
              {change.concepts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {change.concepts.map((c, j) => (
                    <span key={j} className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400/50">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <p className="text-[11px] text-white/20">No detailed changes recorded.</p>
          )}
          {changes.length > 4 && (
            <p className="text-[10px] text-white/15 text-center">+{changes.length - 4} more changes</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Edit Profile Modal ──────────────────────────────

const LANGUAGE_OPTIONS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'SQL', 'HTML/CSS']
const FOCUS_OPTIONS = ['Frontend', 'Backend', 'Full-Stack', 'Mobile', 'DevOps', 'Data Science', 'Machine Learning', 'Cloud', 'Security', 'Game Dev', 'Embedded', 'Blockchain']
const ROLE_OPTIONS = ['learner', 'student', 'junior developer', 'mid developer', 'senior developer', 'lead', 'architect', 'freelancer']

function EditProfileModal({
  profile,
  onSave,
  onClose,
}: {
  profile: PublicProfile
  onSave: (data: { username: string; display_name: string; bio: string | null; role: string; primary_languages: string[]; focus_areas: string[] }) => Promise<void>
  onClose: () => void
}) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || '')
  const [role, setRole] = useState(profile.role || 'learner')
  const [languages, setLanguages] = useState<string[]>(profile.primary_languages || [])
  const [focusAreas, setFocusAreas] = useState<string[]>(profile.focus_areas || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const slug = generateUsername(username)

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Display name is required'); return }
    if (!slug || slug.length < 2) { setError('Username must be at least 2 characters'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({
        username: slug,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        role,
        primary_languages: languages,
        focus_areas: focusAreas,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/70 placeholder:text-white/15 outline-none focus:border-violet-500/40'
  const labelCls = 'text-[11px] text-white/35 uppercase tracking-wider'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/[0.08] rounded-xl p-6 w-full max-w-md mx-4 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 className="text-[15px] font-semibold text-white/80">Edit Profile</h3>

        {/* Display name */}
        <div className="space-y-1">
          <label className={labelCls}>Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your Name" className={inputCls} />
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className={labelCls}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="your-username" className={inputCls} />
          <p className="text-[10px] text-white/20 font-mono">{window.location.origin}/profile/{slug || '...'}</p>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className={labelCls}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={2} className={inputCls + ' resize-none'} maxLength={200} />
          <p className="text-[10px] text-white/15 text-right">{bio.length}/200</p>
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className={labelCls}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className={inputCls + ' cursor-pointer'} title="Select Role">
            {ROLE_OPTIONS.map(r => <option key={r} value={r} className="bg-[#12121a] capitalize">{r}</option>)}
          </select>
        </div>

        {/* Languages */}
        <div className="space-y-1.5">
          <label className={labelCls}>Primary Languages</label>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGE_OPTIONS.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleItem(languages, setLanguages, lang)}
                className={cn(
                  'text-[11px] px-2.5 py-1 rounded-md border transition-colors',
                  languages.includes(lang)
                    ? 'bg-violet-500/20 text-violet-300/80 border-violet-500/30'
                    : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]'
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Focus areas */}
        <div className="space-y-1.5">
          <label className={labelCls}>Focus Areas</label>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_OPTIONS.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => toggleItem(focusAreas, setFocusAreas, area)}
                className={cn(
                  'text-[11px] px-2.5 py-1 rounded-md border transition-colors',
                  focusAreas.includes(area)
                    ? 'bg-blue-500/20 text-blue-300/80 border-blue-500/30'
                    : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.12]'
                )}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[11px] text-red-400/80">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded-md text-white/30 hover:text-white/50 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[12px] px-4 py-1.5 rounded-md bg-violet-500/20 text-violet-300/80 border border-violet-500/25 hover:bg-violet-500/30 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Profile Page ───────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()
  const { username: urlUsername } = useParams<{ username?: string }>()
  const { user, profile, loading: authLoading } = useAuth()

  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [sessionDetails, setSessionDetails] = useState<Record<string, CodingSession>>({})
  const [skillProfile, setSkillProfile] = useState<{ skills: Record<string, number>; totalSessions: number; totalChanges: number }>({ skills: {}, totalSessions: 0, totalChanges: 0 })
  const [loading, setLoading] = useState(true)
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Is the current user viewing their own profile?
  const isOwnProfile = !urlUsername || (publicProfile && user && publicProfile.firebase_uid === user.uid)

  // ── Create or fetch profile helper (reusable) ──
  const ensurePublicProfile = async (): Promise<PublicProfile | null> => {
    if (!user) return null
    try {
      let myPub = await getMyPublicProfile(user.uid)
      if (!myPub) {
        const displayName = profile?.full_name || user.displayName || 'Developer'
        const username = await findUniqueUsername(displayName)
        myPub = await upsertPublicProfile(user.uid, {
          username,
          display_name: displayName,
          role: profile?.role || 'learner',
          avatar_url: profile?.avatar_url || user.photoURL || null,
        })
        toast.success('Profile created!', { description: 'You can now edit your profile details.' })
      }
      return myPub
    } catch (err: any) {
      console.error('Failed to create/fetch public profile:', err)
      const msg = err?.message || 'Unknown error'
      toast.error('Profile error', { description: msg })
      setProfileError(msg)
      return null
    }
  }

  // ── Load profile & session data ──
  useEffect(() => {
    if (authLoading) return

    const load = async () => {
      setLoading(true)
      setNotFound(false)
      setProfileError(null)

      try {
        let targetUid: string | null = null

        if (urlUsername) {
          // ── Public view: look up by username ──
          const pub = await getProfileByUsername(urlUsername)
          if (!pub) {
            // If logged in and viewing own username-less URL, try own profile
            if (user) {
              const myPub = await getMyPublicProfile(user.uid)
              if (myPub && myPub.username === urlUsername) {
                setPublicProfile(myPub)
                targetUid = user.uid
              } else {
                setNotFound(true)
                setLoading(false)
                return
              }
            } else {
              setNotFound(true)
              setLoading(false)
              return
            }
          } else {
            setPublicProfile(pub)
            targetUid = pub.firebase_uid
          }
        } else {
          // ── Own profile: must be logged in ──
          if (!user) {
            navigate('/auth')
            return
          }

          // Ensure public profile exists
          const myPub = await ensurePublicProfile()
          if (myPub) {
            setPublicProfile(myPub)
            targetUid = user.uid
            // Replace URL to include username without full navigation
            window.history.replaceState(null, '', `/profile/${myPub.username}`)
          } else {
            // Profile creation failed — still show the page with a create button
            targetUid = user.uid
          }
        }

        // Load session data using the target firebase uid
        if (targetUid) {
          try {
            const [sessionList, skillData] = await Promise.all([
              listSessions(targetUid),
              getUserSkillProfile(targetUid),
            ])
            setSessions(sessionList)
            setSkillProfile(skillData)

            const detailPromises = sessionList.slice(0, 10).map(s => getSession(s.id))
            const details = await Promise.all(detailPromises)
            const detailMap: Record<string, CodingSession> = {}
            details.forEach(d => { if (d) detailMap[d.id] = d })
            setSessionDetails(detailMap)
          } catch (sessionErr) {
            console.error('Failed to load session data:', sessionErr)
            // Non-fatal: profile still works without sessions
          }
        }
      } catch (err: any) {
        console.error('Failed to load profile data:', err)
        toast.error('Failed to load profile', { description: err?.message || 'Check console for details' })
        setProfileError(err?.message || 'Unknown error loading profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, authLoading, urlUsername])

  // ── Share handler ──
  const handleShare = async () => {
    if (!publicProfile) {
      toast.error('No profile to share', { description: 'Create your profile first' })
      return
    }
    const url = `${window.location.origin}/profile/${publicProfile.username}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Profile link copied!', {
        description: url,
        duration: 3000,
      })
    } catch {
      // Fallback for non-HTTPS or denied clipboard
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
      toast.success('Profile link copied!', {
        description: url,
        duration: 3000,
      })
    }
  }

  // ── Profile update (also handles initial creation via Edit modal) ──
  const handleProfileUpdate = async (data: { username: string; display_name: string; bio: string | null; role: string; primary_languages: string[]; focus_areas: string[] }) => {
    if (!user) return
    try {
      const updated = await upsertPublicProfile(user.uid, data)
      setPublicProfile(updated)
      setProfileError(null)
      window.history.replaceState(null, '', `/profile/${updated.username}`)
      toast.success('Profile updated!', { description: 'Changes saved successfully' })
    } catch (err: any) {
      console.error('Profile update failed:', err)
      toast.error('Failed to save profile', { description: err?.message || 'Unknown error' })
      throw err // re-throw so EditProfileModal shows the error
    }
  }

  // ── Derived metrics ──
  const avgDuration = useMemo(() => {
    if (sessions.length === 0) return 0
    return Math.round(sessions.reduce((s, sess) => s + sess.duration_seconds, 0) / sessions.length / 60)
  }, [sessions])

  const aiTransparency = useMemo(() => {
    let userCount = 0
    let aiAssist = 0
    let aiRefactor = 0
    Object.values(sessionDetails).forEach(s => {
      s.changes.forEach(c => {
        if (c.source === 'user') userCount++
        else if (c.source === 'ai-generate') aiAssist++
        else aiRefactor++
      })
    })
    const total = userCount + aiAssist + aiRefactor
    if (total === 0) return { user: 100, assist: 0, refactor: 0 }
    return {
      user: Math.round((userCount / total) * 100),
      assist: Math.round((aiAssist / total) * 100),
      refactor: Math.round((aiRefactor / total) * 100),
    }
  }, [sessionDetails])

  const topSkills = useMemo(() => {
    return Object.entries(skillProfile.skills)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
  }, [skillProfile.skills])

  const skillInsights = useMemo(() => {
    const insights: string[] = []
    const sorted = Object.entries(skillProfile.skills).sort(([, a], [, b]) => b - a)
    if (sorted.length > 0) insights.push(`Strong understanding of ${sorted[0][0].toLowerCase()}`)
    if (sorted.find(([k]) => k.includes('Async'))) insights.push('Frequently works with asynchronous flows')
    if (sorted.find(([k]) => k.includes('Error'))) insights.push('Implements error handling consistently')
    if (sorted.find(([k]) => k.includes('React'))) insights.push('Active React component development')
    if (aiTransparency.user > 60) insights.push('Primarily writes code independently')
    if (aiTransparency.refactor > 5) insights.push('Uses AI for code review and refactoring')
    if (sessions.length > 10) insights.push('Consistent coding activity over time')
    if (insights.length === 0) insights.push('Start coding to build your skill profile')
    return insights
  }, [skillProfile.skills, aiTransparency, sessions])

  const displayName = publicProfile?.display_name || profile?.full_name || user?.displayName || 'Developer'
  const displayRole = publicProfile?.role || profile?.role || ''

  // ── Not found ──
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white/60">Profile not found</h1>
          <p className="text-[12px] text-white/25">
            No profile exists for <span className="text-white/40 font-mono">@{urlUsername}</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-[12px] px-4 py-1.5 rounded-md bg-violet-500/10 text-violet-300/70 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // ── Loading ──
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500/30 border-t-violet-500 mx-auto mb-3"></div>
          <p className="text-[13px] text-white/30">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white/70">
      {/* Edit profile modal — works even when publicProfile is null (creates a new one) */}
      {showEditModal && (
        <EditProfileModal
          profile={publicProfile || {
            id: '',
            firebase_uid: user?.uid || '',
            username: generateUsername(profile?.full_name || user?.displayName || 'developer'),
            display_name: profile?.full_name || user?.displayName || 'Developer',
            bio: null,
            role: profile?.role || 'learner',
            avatar_url: profile?.avatar_url || user?.photoURL || null,
            primary_languages: [],
            focus_areas: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          onSave={handleProfileUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Top bar */}
      <header className="border-b border-white/[0.06] bg-[#0a0a12]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          {isOwnProfile ? (
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[12px]">Dashboard</span>
            </button>
          ) : (
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[12px]">CodePath AI</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-[11px] px-3 py-1.5 rounded-md bg-white/[0.04] text-white/35 border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
              >
                {publicProfile ? 'Edit Profile' : 'Create Profile'}
              </button>
            )}
            <button
              onClick={handleShare}
              disabled={!publicProfile}
              className="text-[11px] px-3 py-1.5 rounded-md bg-violet-500/10 text-violet-300/70 border border-violet-500/20 hover:bg-violet-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Share Profile
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* ━━ Profile Error / Retry ━━━━━━━━━━━━━━━━━━━ */}
        {profileError && isOwnProfile && (
          <section className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-center space-y-2">
            <p className="text-[12px] text-red-300/70">Could not load or create your profile</p>
            <p className="text-[10px] text-red-300/40 font-mono">{profileError}</p>
            <button
              onClick={async () => {
                setProfileError(null)
                setLoading(true)
                const p = await ensurePublicProfile()
                if (p) {
                  setPublicProfile(p)
                  window.history.replaceState(null, '', `/profile/${p.username}`)
                }
                setLoading(false)
              }}
              className="text-[11px] px-4 py-1.5 rounded-md bg-violet-500/20 text-violet-300/80 border border-violet-500/25 hover:bg-violet-500/30 transition-colors"
            >
              Retry
            </button>
          </section>
        )}

        {/* ━━ No Profile Yet Banner ━━━━━━━━━━━━━━━━━━━ */}
        {!publicProfile && isOwnProfile && !profileError && !loading && (
          <section className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 text-center space-y-2">
            <p className="text-[12px] text-violet-300/70">Your public profile hasn't been set up yet</p>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-[11px] px-4 py-1.5 rounded-md bg-violet-500/20 text-violet-300/80 border border-violet-500/25 hover:bg-violet-500/30 transition-colors"
            >
              Set Up Profile
            </button>
          </section>
        )}

        {/* ━━ Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto text-2xl font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white/90">{displayName}</h1>
            {publicProfile?.username && (
              <p className="text-[12px] text-white/25 mt-0.5 font-mono">@{publicProfile.username}</p>
            )}
            {displayRole && (
              <p className="text-[12px] text-white/30 mt-0.5 capitalize">{displayRole}</p>
            )}
          </div>
          {publicProfile?.bio && (
            <p className="text-[12px] text-white/35 max-w-md mx-auto leading-relaxed">
              {publicProfile.bio}
            </p>
          )}
          {/* Languages & Focus tags */}
          {(publicProfile?.primary_languages?.length || 0) > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {publicProfile!.primary_languages.map(lang => (
                <span key={lang} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300/50 border border-violet-500/15">
                  {lang}
                </span>
              ))}
              {publicProfile!.focus_areas?.map(area => (
                <span key={area} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/50 border border-blue-500/15">
                  {area}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-white/20 max-w-md mx-auto leading-relaxed">
            Verified coding history generated from real development sessions.
          </p>
          {topSkills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {topSkills.slice(0, 5).map(([skill]) => (
                <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/35 border border-white/[0.08]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ━━ Quick Metrics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionLabel>Quick Metrics</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Sessions" value={skillProfile.totalSessions} />
            <MetricCard label="Code changes" value={skillProfile.totalChanges} />
            <MetricCard label="Skills detected" value={Object.keys(skillProfile.skills).length} />
            <MetricCard label="Avg duration" value={`${avgDuration}m`} />
          </div>
        </section>

        {/* ━━ Coding Activity ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionLabel icon="activity">Coding Activity</SectionLabel>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
            <ActivityCalendar sessions={sessions} />
          </div>
        </section>

        {/* ━━ Skill Snapshot ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionLabel icon="brain">Skill Snapshot</SectionLabel>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 space-y-3">
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Auto-derived from actual work</p>
            <ul className="space-y-2">
              {skillInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400/60 mt-0.5 text-[11px]">▸</span>
                  <span className="text-[12px] text-white/45 leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ━━ Technology Exposure ━━━━━━━━━━━━━━━━━━━━━━ */}
        {topSkills.length > 0 && (
          <section>
            <SectionLabel icon="tag">Technology Exposure</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(([skill, count]) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-[11px] text-white/50">{skill}</span>
                  <span className="text-[9px] text-white/15 font-mono">×{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ━━ AI Transparency ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionLabel icon="robot">AI Transparency</SectionLabel>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 space-y-3">
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Contribution distribution</p>
            <div className="h-3 rounded-full overflow-hidden flex bg-white/[0.04]">
              {/* eslint-disable-next-line react/forbid-dom-props */}
              {aiTransparency.user > 0 && (
                <div
                  className="bg-blue-500/70 h-full"
                  style={{ width: `${aiTransparency.user}%` }}
                  aria-label={`User-written: ${aiTransparency.user}%`}
                />
              )}
              {aiTransparency.assist > 0 && (
                <div
                  className="bg-violet-500/70 h-full"
                  style={{ width: `${aiTransparency.assist}%` }}
                  aria-label={`AI-assisted: ${aiTransparency.assist}%`}
                />
              )}
              {aiTransparency.refactor > 0 && (
                <div
                  className="bg-amber-500/70 h-full"
                  style={{ width: `${aiTransparency.refactor}%` }}
                  aria-label={`Refactored: ${aiTransparency.refactor}%`}
                />
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500/70"></span>
                <span className="text-white/40">User-written: {aiTransparency.user}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500/70"></span>
                <span className="text-white/40">AI-assisted: {aiTransparency.assist}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                <span className="text-white/40">AI-refactored: {aiTransparency.refactor}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* ━━ Verified Sessions ━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionLabel icon="sessions">Verified Sessions</SectionLabel>
          <p className="text-[10px] text-white/20 mb-3">Real, timestamped development work</p>
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.slice(0, 10).map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  detail={sessionDetails[session.id] || null}
                />
              ))}
              {sessions.length > 10 && (
                <p className="text-[11px] text-white/15 text-center pt-2">
                  +{sessions.length - 10} older sessions
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 text-center">
              <p className="text-[12px] text-white/25">No sessions recorded yet. Start coding to build your history.</p>
            </div>
          )}
        </section>

        {/* ━━ Verification Footer ━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="border-t border-white/[0.06] pt-6 pb-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/20">
            <svg className="w-3.5 h-3.5 text-emerald-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified by CodePath AI</span>
          </div>
          <p className="text-[10px] text-white/15 max-w-sm mx-auto leading-relaxed">
            This profile is generated from recorded development sessions.
            Events include edits, explanations, and execution outcomes.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleShare}
              className="text-[11px] px-4 py-1.5 rounded-md bg-white/[0.04] text-white/35 border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
            >
              Copy Profile Link
            </button>
            <button
              onClick={() => window.print()}
              className="text-[11px] px-4 py-1.5 rounded-md bg-white/[0.04] text-white/35 border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
            >
              Download Report
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

// ─── Shared small components ─────────────────────────

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: string }) {
  const iconMap: Record<string, JSX.Element> = {
    activity: (
      <svg className="w-4 h-4 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    brain: (
      <svg className="w-4 h-4 text-violet-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tag: (
      <svg className="w-4 h-4 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    robot: (
      <svg className="w-4 h-4 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    sessions: (
      <svg className="w-4 h-4 text-cyan-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && iconMap[icon]}
      <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">{children}</h2>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
      <div className="text-lg font-semibold text-white/70">{value}</div>
      <div className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}
