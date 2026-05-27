ALTER TABLE public.agent_conversations
  ADD COLUMN IF NOT EXISTS system_prompt text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS avatar_emoji text NOT NULL DEFAULT '🤖';