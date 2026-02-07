-- Create coding_sessions table for tracking user learning sessions
CREATE TABLE IF NOT EXISTS public.coding_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Coding Session',
  changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_firebase_uid ON public.coding_sessions(firebase_uid);
CREATE INDEX idx_sessions_project_id ON public.coding_sessions(project_id);
CREATE INDEX idx_sessions_started_at ON public.coding_sessions(started_at DESC);

-- RLS
ALTER TABLE public.coding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on coding_sessions"
  ON public.coding_sessions FOR ALL
  USING (true)
  WITH CHECK (true);
