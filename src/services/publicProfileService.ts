import { supabase } from '@/integrations/supabase/client'

// ─── Types ───────────────────────────────────────────

export interface PublicProfile {
  id: string
  firebase_uid: string
  username: string
  display_name: string
  bio: string | null
  role: string
  avatar_url: string | null
  primary_languages: string[]
  focus_areas: string[]
  created_at: string
  updated_at: string
}

// ─── Username helpers ────────────────────────────────

/** Sanitise a display name into a valid username slug */
export function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'dev'
}

/** Check if a username is already taken */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const { data } = await (supabase as any)
    .from('public_profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  return !!data
}

/** Find a unique username by appending numbers if needed */
export async function findUniqueUsername(base: string): Promise<string> {
  let candidate = generateUsername(base)
  let taken = await isUsernameTaken(candidate)
  let i = 1
  while (taken && i < 100) {
    candidate = `${generateUsername(base)}-${i}`
    taken = await isUsernameTaken(candidate)
    i++
  }
  return candidate
}

// ─── CRUD ────────────────────────────────────────────

/** Get a public profile by firebase_uid */
export async function getMyPublicProfile(firebaseUid: string): Promise<PublicProfile | null> {
  console.log('[publicProfile] fetching for uid:', firebaseUid)
  const { data, error } = await (supabase as any)
    .from('public_profiles')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .maybeSingle()

  if (error) {
    console.error('[publicProfile] Error fetching own profile:', error)
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }
  console.log('[publicProfile] fetched:', data)
  return data as PublicProfile | null
}

/** Get a public profile by username (for public viewing) */
export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
  const { data, error } = await (supabase as any)
    .from('public_profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    console.error('Error fetching profile by username:', error)
    return null
  }
  return data as PublicProfile | null
}

/** Create or update the public profile for a user */
export async function upsertPublicProfile(
  firebaseUid: string,
  data: {
    username: string
    display_name: string
    bio?: string | null
    role?: string
    avatar_url?: string | null
    primary_languages?: string[]
    focus_areas?: string[]
  },
): Promise<PublicProfile> {
  const payload = {
    firebase_uid: firebaseUid,
    username: data.username,
    display_name: data.display_name,
    bio: data.bio || null,
    role: data.role || 'learner',
    avatar_url: data.avatar_url || null,
    primary_languages: data.primary_languages || [],
    focus_areas: data.focus_areas || [],
    updated_at: new Date().toISOString(),
  }

  console.log('[publicProfile] upserting for uid:', firebaseUid, payload)

  // Check if profile exists
  const { data: existing, error: fetchErr } = await (supabase as any)
    .from('public_profiles')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .maybeSingle()

  if (fetchErr) {
    console.error('[publicProfile] fetch error:', fetchErr)
    throw new Error(`Failed to check existing profile: ${fetchErr.message}`)
  }

  if (existing) {
    const { data: updated, error } = await (supabase as any)
      .from('public_profiles')
      .update(payload)
      .eq('firebase_uid', firebaseUid)
      .select()
      .single()
    if (error) throw new Error(error.message)
    console.log('[publicProfile] updated:', updated)
    return updated as PublicProfile
  } else {
    const { data: created, error } = await (supabase as any)
      .from('public_profiles')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message)
    console.log('[publicProfile] created:', created)
    return created as PublicProfile
  }
}

/** Update just the username */
export async function updateUsername(firebaseUid: string, newUsername: string): Promise<void> {
  const taken = await isUsernameTaken(newUsername)
  if (taken) throw new Error('Username is already taken')

  const { error } = await (supabase as any)
    .from('public_profiles')
    .update({ username: newUsername, updated_at: new Date().toISOString() })
    .eq('firebase_uid', firebaseUid)
  if (error) throw new Error(error.message)
}
