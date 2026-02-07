import { supabase } from '@/integrations/supabase/client';
// ─── Types ───────────────────────────────────────────

export interface CodeChange {
  id: string;
  timestamp: string;
  fileId: string;
  fileName: string;
  before: string;
  after: string;
  source: 'user' | 'ai-explain' | 'ai-generate' | 'ai-modify';
  description: string;
  concepts: string[];
}

export interface CodingSession {
  id: string;
  firebase_uid: string;
  project_id: string | null;
  title: string;
  changes: CodeChange[];
  skills: string[];
  summary: string | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  skills: string[];
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  change_count: number;
}

// ─── Concept / Skill Extraction ──────────────────────

const CONCEPT_PATTERNS: [RegExp, string][] = [
  [/\bfor\s*\(|\.forEach\(|\.map\(|\.filter\(|\.reduce\(/i, 'Loops & Iteration'],
  [/\bwhile\s*\(/i, 'While Loops'],
  [/\bfunction\b|=>\s*{|=>\s*\(/i, 'Functions'],
  [/\basync\b|\bawait\b/i, 'Async / Await'],
  [/\bPromise\b|\.then\(/i, 'Promises'],
  [/\btry\s*{|\bcatch\s*\(/i, 'Error Handling'],
  [/\bclass\s+\w/i, 'Classes & OOP'],
  [/\binterface\b|\btype\s+\w/i, 'TypeScript Types'],
  [/\buseState\b/i, 'React State (useState)'],
  [/\buseEffect\b/i, 'React Effects (useEffect)'],
  [/\buseRef\b/i, 'React Refs (useRef)'],
  [/\buseCallback\b|\buseMemo\b/i, 'React Memoization'],
  [/\buseContext\b|\bcreateContext\b/i, 'React Context'],
  [/\bfetch\(|axios\.|\.get\(|\.post\(/i, 'API Calls'],
  [/\bimport\b.*\bfrom\b/i, 'ES Modules'],
  [/\bexport\s+(default\s+)?/i, 'Module Exports'],
  [/\bconsole\.\w+\(/i, 'Debugging (console)'],
  [/\bJSON\.(parse|stringify)\(/i, 'JSON Handling'],
  [/\blocalStorage\b|\bsessionStorage\b/i, 'Browser Storage'],
  [/\bdocument\.\w+|\.querySelector\(/i, 'DOM Manipulation'],
  [/\b(const|let|var)\s+\[/i, 'Destructuring'],
  [/\.\.\.\w/i, 'Spread / Rest Operators'],
  [/\bRegExp\b|\/\w+\/[gim]*/i, 'Regular Expressions'],
  [/\bnew\s+Map\b|\bnew\s+Set\b/i, 'Map / Set Collections'],
  [/className=|style=|css|tailwind/i, 'Styling / CSS'],
  [/\b<\w+[\s/>]/i, 'JSX / Components'],
  [/\bsupabase\b|\bfirebase\b/i, 'Backend Integration'],
  [/\bObject\.keys\b|Object\.values\b|Object\.entries\b/i, 'Object Methods'],
  [/\bArray\.from\b|Array\.isArray/i, 'Array Methods'],
  [/\bswitch\s*\(/i, 'Switch Statements'],
  [/\bif\s*\(.*\?\s*/i, 'Ternary Operators'],
];

/**
 * Extract skill/concept tags from code content
 */
export function extractSkills(code: string): string[] {
  const found = new Set<string>();
  for (const [pattern, label] of CONCEPT_PATTERNS) {
    if (pattern.test(code)) {
      found.add(label);
    }
  }
  return Array.from(found).sort();
}

/**
 * Extract skills from a list of code changes (union of before + after concepts)
 */
export function extractSkillsFromChanges(changes: CodeChange[]): string[] {
  const allSkills = new Set<string>();
  for (const change of changes) {
    const afterSkills = extractSkills(change.after);
    afterSkills.forEach(s => allSkills.add(s));
  }
  return Array.from(allSkills).sort();
}

// ─── Session CRUD ────────────────────────────────────

/**
 * Create a new coding session
 */
export async function createSession(
  firebaseUid: string,
  projectId: string | null,
  title?: string,
): Promise<CodingSession> {
  const { data, error } = await (supabase as any)
    .from('coding_sessions')
    .insert({
      firebase_uid: firebaseUid,
      project_id: projectId,
      title: title || 'Coding Session',
      changes: [],
      skills: [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return {
    ...data,
    changes: data.changes || [],
    skills: data.skills || [],
  } as CodingSession;
}

/**
 * Save a code change to the session
 */
export async function addChangeToSession(
  sessionId: string,
  _change: CodeChange,
  allChanges: CodeChange[],
): Promise<void> {
  const skills = extractSkillsFromChanges(allChanges);

  const { error } = await (supabase as any)
    .from('coding_sessions')
    .update({
      changes: allChanges,
      skills,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error saving change:', error);
  }
}

/**
 * End a session (set ended_at and compute duration)
 */
export async function endSession(
  sessionId: string,
  changes: CodeChange[],
  summary?: string,
): Promise<void> {
  const skills = extractSkillsFromChanges(changes);
  const now = new Date().toISOString();

  const { error } = await (supabase as any)
    .from('coding_sessions')
    .update({
      ended_at: now,
      changes,
      skills,
      summary: summary || `Session with ${changes.length} code changes.`,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error ending session:', error);
  }
}

/**
 * List all sessions for a user, most recent first
 */
export async function listSessions(firebaseUid: string): Promise<SessionSummary[]> {
  const { data, error } = await (supabase as any)
    .from('coding_sessions')
    .select('id, title, skills, duration_seconds, started_at, ended_at, changes')
    .eq('firebase_uid', firebaseUid)
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error listing sessions:', error);
    return [];
  }

  return (data || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    skills: s.skills || [],
    duration_seconds: s.duration_seconds,
    started_at: s.started_at,
    ended_at: s.ended_at,
    change_count: (s.changes || []).length,
  }));
}

/**
 * Get full session details
 */
export async function getSession(sessionId: string): Promise<CodingSession | null> {
  const { data, error } = await (supabase as any)
    .from('coding_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching session:', error);
    return null;
  }

  return {
    ...data,
    changes: data.changes || [],
    skills: data.skills || [],
  } as CodingSession;
}

/**
 * Get user's aggregated skill profile
 */
export async function getUserSkillProfile(firebaseUid: string): Promise<{
  skills: Record<string, number>;
  totalSessions: number;
  totalChanges: number;
}> {
  const sessions = await listSessions(firebaseUid);
  const skillCounts: Record<string, number> = {};
  let totalChanges = 0;

  for (const session of sessions) {
    totalChanges += session.change_count;
    for (const skill of session.skills) {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  }

  return {
    skills: skillCounts,
    totalSessions: sessions.length,
    totalChanges,
  };
}
