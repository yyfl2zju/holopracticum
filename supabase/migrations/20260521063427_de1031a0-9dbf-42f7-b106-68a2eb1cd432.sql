-- Storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: files organized under {user_id}/...
CREATE POLICY "Users view own attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Attachments table linking files to tasks (task_id nullable so files can be attached during composition)
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attachments rows"
ON public.task_attachments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attachments rows"
ON public.task_attachments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own attachments rows"
ON public.task_attachments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own attachments rows"
ON public.task_attachments FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX idx_task_attachments_user_id ON public.task_attachments(user_id);
