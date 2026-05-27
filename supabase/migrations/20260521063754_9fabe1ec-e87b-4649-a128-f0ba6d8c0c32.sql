CREATE TABLE public.contract_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  attachment_id UUID,
  file_name TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'other',
  score INTEGER,
  summary TEXT,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_text TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own contract reviews"
ON public.contract_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own contract reviews"
ON public.contract_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contract reviews"
ON public.contract_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own contract reviews"
ON public.contract_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_contract_reviews_updated_at
BEFORE UPDATE ON public.contract_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_contract_reviews_user_created ON public.contract_reviews(user_id, created_at DESC);
