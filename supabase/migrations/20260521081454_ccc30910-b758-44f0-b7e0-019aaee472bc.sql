
CREATE TABLE public.data_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly JSONB NOT NULL DEFAULT '[]'::jsonb,
  cost_structure JSONB NOT NULL DEFAULT '[]'::jsonb,
  forecast JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own data analyses" ON public.data_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own data analyses" ON public.data_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own data analyses" ON public.data_analyses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own data analyses" ON public.data_analyses
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_data_analyses_updated_at
BEFORE UPDATE ON public.data_analyses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_data_analyses_user ON public.data_analyses(user_id, created_at DESC);
