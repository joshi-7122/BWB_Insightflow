-- InsightFlow Supabase Database Initialization Migration

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','processing','completed','failed')),
  summary TEXT,
  report_json JSONB,
  source_file_ids UUID[],
  schema_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded Files Metadata Table
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  upload_status TEXT NOT NULL CHECK (upload_status IN ('pending','complete','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  structured_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis Async Jobs Table
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','running','completed','failed')),
  attempt_count INT DEFAULT 0,
  error_code TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Enforce strict user isolation user_id = auth.uid()
CREATE POLICY "Users can access their own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access their own reports"
  ON public.reports FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own uploaded files"
  ON public.uploaded_files FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own chat messages"
  ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their analysis jobs"
  ON public.analysis_jobs FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = analysis_jobs.report_id AND r.user_id = auth.uid()
    )
  );

-- Storage bucket setup statement (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('insightflow_uploads', 'insightflow_uploads', false);
