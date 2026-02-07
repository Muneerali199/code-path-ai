-- Create projects table for storing user projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  description TEXT,
  template TEXT DEFAULT 'custom',
  prompt TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on firebase_uid for fast lookups
CREATE INDEX idx_projects_firebase_uid ON public.projects(firebase_uid);
CREATE INDEX idx_projects_updated_at ON public.projects(updated_at DESC);

-- Disable RLS since we use Firebase auth (not Supabase auth)
-- We filter by firebase_uid in application code
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (we verify firebase_uid in app)
CREATE POLICY "Allow all operations on projects"
  ON public.projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
