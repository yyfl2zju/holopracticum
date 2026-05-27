
-- Content assets library
CREATE TABLE public.content_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'professional',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own content assets" ON public.content_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own content assets" ON public.content_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own content assets" ON public.content_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own content assets" ON public.content_assets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_content_assets_updated_at BEFORE UPDATE ON public.content_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_content_assets_user_created ON public.content_assets(user_id, created_at DESC);

-- Agent conversations
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '新会话',
  enabled_workflows UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own conversations" ON public.agent_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON public.agent_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON public.agent_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON public.agent_conversations FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_agent_conversations_updated_at BEFORE UPDATE ON public.agent_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Agent messages
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT,
  tool_calls JSONB,
  tool_results JSONB,
  workflow_run_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.agent_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own messages" ON public.agent_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.agent_messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_agent_messages_conv_created ON public.agent_messages(conversation_id, created_at);
