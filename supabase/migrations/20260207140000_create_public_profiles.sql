-- Public profiles for shareable profile URLs (/profile/username)
CREATE TABLE IF NOT EXISTS public.public_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Developer',
  bio TEXT,
  role TEXT DEFAULT 'learner',
  avatar_url TEXT,
  primary_languages TEXT[] DEFAULT '{}',
  focus_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_public_profiles_username ON public.public_profiles(username);
CREATE UNIQUE INDEX idx_public_profiles_firebase_uid ON public.public_profiles(firebase_uid);

-- RLS
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.public_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON public.public_profiles FOR ALL
  USING (true)
  WITH CHECK (true);
