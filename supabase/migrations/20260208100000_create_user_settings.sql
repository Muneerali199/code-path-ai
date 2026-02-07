-- Create user_settings table to persist AI provider settings and preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT NOT NULL UNIQUE,
  
  -- AI Provider settings (stored as JSONB for flexibility)
  ai_provider TEXT NOT NULL DEFAULT 'default',         -- active provider id
  ai_providers JSONB NOT NULL DEFAULT '[]'::jsonb,     -- provider configs with API keys + selected models
  ai_max_tokens INTEGER NOT NULL DEFAULT 4096,
  ai_temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  
  -- Editor preferences (synced from local)
  editor_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Theme preferences
  theme_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- MCP settings
  mcp_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups by firebase_uid
CREATE INDEX idx_user_settings_firebase_uid ON public.user_settings(firebase_uid);

-- RLS (same pattern as projects — firebase_uid verified in app code)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on user_settings"
  ON public.user_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
