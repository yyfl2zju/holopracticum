import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Sparkles, Plus, Send, Loader2, Bot, User, Workflow as WorkflowIcon,
  Trash2, Zap, CheckCircle2, AlertTriangle, ChevronRight, Cog, Settings2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type Conversation = {
  id: string;
  title: string;
  enabled_workflows: string[];
  updated_at: string;
  system_prompt?: string | null;
  description?: string | null;
  model?: string | null;
  avatar_emoji?: string | null;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any;
  tool_results?: any;
  workflow_run_id?: string | null;
  created_at: string;
};

type Workflow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  graph: any;
};

export default function Agent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSkills, setShowSkills] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<'create' | 'edit'>('create');
  const [setupForm, setSetupForm] = useState({
    title: '',
    avatar_emoji: '🤖',
    description: '',
    system_prompt: '',
    model: 'google/gemini-2.5-flash',
    enabled_workflows: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId);

  // Load conversations + workflows on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [cRes, wRes] = await Promise.all([
        supabase.from('agent_conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('workflows').select('id, title, description, status, graph').eq('user_id', user.id),
      ]);
      const convs = (cRes.data as Conversation[]) || [];
      setConversations(convs);
      setWorkflows((wRes.data as any) || []);
      if (convs.length && !activeId) setActiveId(convs[0].id);
    })();
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase.from('agent_messages')
        .select('*').eq('conversation_id', activeId).order('created_at', { ascending: true });
      setMessages((data as any) || []);
    })();
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const openCreateDialog = () => {
    setSetupMode('create');
    setSetupForm({
      title: '新智能体',
      avatar_emoji: '🤖',
      description: '',
      system_prompt: '你是一位资深助手，擅长拆解任务并调用合适的工作流帮助用户完成目标。回答简洁、准确、富有条理。',
      model: 'google/gemini-2.5-flash',
      enabled_workflows: publishedWorkflows.map((w) => w.id),
    });
    setSetupOpen(true);
  };

  const openEditDialog = () => {
    if (!activeConv) return;
    setSetupMode('edit');
    setSetupForm({
      title: activeConv.title,
      avatar_emoji: activeConv.avatar_emoji || '🤖',
      description: activeConv.description || '',
      system_prompt: activeConv.system_prompt || '',
      model: activeConv.model || 'google/gemini-2.5-flash',
      enabled_workflows: activeConv.enabled_workflows || [],
    });
    setSetupOpen(true);
  };

  const saveSetup = async () => {
    if (!user) return;
    if (!setupForm.title.trim()) { toast({ title: '请填写名称', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (setupMode === 'create') {
        const { data, error } = await supabase.from('agent_conversations').insert({
          user_id: user.id,
          title: setupForm.title.trim(),
          avatar_emoji: setupForm.avatar_emoji,
          description: setupForm.description,
          system_prompt: setupForm.system_prompt,
          model: setupForm.model,
          enabled_workflows: setupForm.enabled_workflows,
        }).select('*').single();
        if (error) throw error;
        setConversations((p) => [data as Conversation, ...p]);
        setActiveId((data as Conversation).id);
      } else if (activeConv) {
        const update = {
          title: setupForm.title.trim(),
          avatar_emoji: setupForm.avatar_emoji,
          description: setupForm.description,
          system_prompt: setupForm.system_prompt,
          model: setupForm.model,
          enabled_workflows: setupForm.enabled_workflows,
        };
        const { error } = await supabase.from('agent_conversations').update(update).eq('id', activeConv.id);
        if (error) throw error;
        setConversations((p) => p.map((c) => c.id === activeConv.id ? { ...c, ...update } : c));
      }
      setSetupOpen(false);
    } catch (e: any) {
      toast({ title: '保存失败', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('agent_conversations').delete().eq('id', id);
    setConversations((p) => p.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const toggleWorkflow = async (wfId: string) => {
    if (!activeConv) return;
    const next = activeConv.enabled_workflows.includes(wfId)
      ? activeConv.enabled_workflows.filter((x) => x !== wfId)
      : [...activeConv.enabled_workflows, wfId];
    setConversations((p) => p.map((c) => c.id === activeConv.id ? { ...c, enabled_workflows: next } : c));
    await supabase.from('agent_conversations').update({ enabled_workflows: next }).eq('id', activeConv.id);
  };

  const send = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    // Optimistic user message
    const optimistic: Message = {
      id: 'tmp-' + Date.now(),
      role: 'user', content: text, created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const { data, error } = await supabase.functions.invoke('agent-chat', {
        body: { conversationId: activeConv.id, message: text },
      });
      if (error) throw error;
      const errMsg = (data as any)?.error;
      if (errMsg) throw new Error(errMsg);
      // Refetch full message thread
      const { data: fresh } = await supabase.from('agent_messages')
        .select('*').eq('conversation_id', activeConv.id).order('created_at', { ascending: true });
      setMessages((fresh as any) || []);

      // Auto-rename conversation from first user message
      if (activeConv.title === '新会话' || activeConv.title === '新智能体') {
        const newTitle = text.slice(0, 24);
        await supabase.from('agent_conversations').update({ title: newTitle }).eq('id', activeConv.id);
        setConversations((p) => p.map((c) => c.id === activeConv.id ? { ...c, title: newTitle } : c));
      }
    } catch (e: any) {
      toast({ title: '发送失败', description: e?.message || '请稍后重试', variant: 'destructive' });
      // remove optimistic
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const publishedWorkflows = useMemo(() => workflows.filter((w) => w.status === 'published'), [workflows]);
  const enabledCount = activeConv?.enabled_workflows.length || 0;

  const EMOJI_PRESETS = ['🤖', '🧠', '✨', '📝', '⚖️', '💻', '📊', '🎨', '🔍', '🚀', '📚', '🛡️'];
  const MODEL_OPTIONS = [
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash · 默认快速' },
    { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro · 强推理' },
    { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite · 极速' },
    { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini · 平衡' },
    { value: 'openai/gpt-5', label: 'GPT-5 · 顶级综合' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden -m-6">
      {/* Left: conversations */}
      <aside className="w-60 border-r border-border bg-card/30 flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <Button size="sm" className="w-full gap-1.5 h-8 text-xs" onClick={openCreateDialog}>
            <Plus size={14} /> 新建智能体
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                还没有智能体<br />点击「新建智能体」开始
              </div>
            )}
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-xs transition-colors',
                  activeId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                )}
              >
                <span className="text-sm leading-none shrink-0">{c.avatar_emoji || '🤖'}</span>
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Middle: chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-border bg-card/30 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">{activeConv?.avatar_emoji || '✨'}</span>
            <span className="text-sm font-medium">{activeConv?.title || '智能体助手'}</span>
            {activeConv && (
              <Badge variant="secondary" className="text-[10px]">
                <Zap size={10} className="mr-1" /> {enabledCount} / {publishedWorkflows.length} 工作流启用
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeConv && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={openEditDialog}>
                <Settings2 size={12} /> 配置
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowSkills((s) => !s)}>
              <Cog size={12} /> 技能
            </Button>
          </div>
        </div>

        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div className="space-y-3 max-w-md">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">智能体聊天台</h2>
              <p className="text-sm text-muted-foreground">
                创建你的第一个智能体：配置人设、模型与可用工作流，它就会像同事一样自动完成任务。
              </p>
              <Button onClick={openCreateDialog} className="gap-1.5">
                <Plus size={14} /> 创建智能体
              </Button>
            </div>
          </div>
        ) : (
          <>
            {activeConv.description && (
              <div className="px-6 pt-3 text-[11px] text-muted-foreground border-b border-border/40 pb-2">
                {activeConv.description}
              </div>
            )}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <Bot className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">开始你的第一条消息</p>
                  {publishedWorkflows.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      还没有已发布的工作流。<Link to="/workflow" className="text-primary underline">去创建</Link>
                    </p>
                  )}
                </div>
              )}
              {messages.map((m) => <MessageBubble key={m.id} msg={m} workflows={workflows} />)}
              {sending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  智能体思考中…
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-border p-3 bg-card/30">
              <div className="flex items-end gap-2 max-w-3xl mx-auto">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="描述你的任务，例如：审查我上传的服务协议并给出修改建议（Enter 发送，Shift+Enter 换行）"
                  className="min-h-[44px] max-h-[160px] text-sm resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  disabled={sending}
                />
                <Button onClick={send} disabled={!input.trim() || sending} className="h-11 gap-1.5">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  发送
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Right: skills panel */}
      {showSkills && (
        <aside className="w-72 border-l border-border bg-card/30 flex flex-col shrink-0">
          <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
            <WorkflowIcon size={14} className="text-primary" />
            <span className="text-xs font-medium">可用技能（工作流）</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2.5 space-y-1.5">
              {publishedWorkflows.length === 0 ? (
                <div className="text-center py-8 px-3 text-xs text-muted-foreground space-y-2">
                  <WorkflowIcon className="w-8 h-8 mx-auto opacity-30" />
                  <p>还没有已发布的工作流</p>
                  <Link to="/workflow" className="inline-flex items-center text-primary text-xs hover:underline">
                    去流程编排 <ChevronRight size={12} />
                  </Link>
                </div>
              ) : (
                publishedWorkflows.map((w) => {
                  const enabled = activeConv?.enabled_workflows.includes(w.id) || false;
                  const inputs = w.graph?.io_schema?.input || [];
                  return (
                    <div key={w.id} className={cn(
                      'rounded-lg border p-2.5 space-y-1.5 transition-colors',
                      enabled ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium truncate">{w.title}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-2">{w.description || '（无描述）'}</div>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => toggleWorkflow(w.id)}
                          disabled={!activeConv}
                        />
                      </div>
                      {inputs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {inputs.slice(0, 4).map((f: any) => (
                            <span key={f.name} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                              {f.name}{f.required ? '*' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">未定义输入 schema</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <div className="p-2.5 border-t border-border">
            <Link to="/workflow" className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <Plus size={11} /> 新建工作流
            </Link>
          </div>
        </aside>
      )}

      {/* Setup Dialog */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{setupMode === 'create' ? '创建智能体' : '编辑智能体'}</DialogTitle>
            <DialogDescription className="text-xs">
              配置智能体的人设、模型与可调用的工作流。后续可随时在「配置」中修改。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Avatar + Name */}
            <div className="space-y-2">
              <Label className="text-xs">头像 & 名称</Label>
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                  {setupForm.avatar_emoji}
                </div>
                <Input
                  value={setupForm.title}
                  onChange={(e) => setSetupForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="例如：合同审查助手"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {EMOJI_PRESETS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSetupForm((f) => ({ ...f, avatar_emoji: e }))}
                    className={cn(
                      'w-7 h-7 rounded-md text-base flex items-center justify-center transition-colors',
                      setupForm.avatar_emoji === e ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-accent'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs">简短描述（可选）</Label>
              <Input
                value={setupForm.description}
                onChange={(e) => setSetupForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="一句话介绍这个智能体的能力"
              />
            </div>

            {/* System prompt */}
            <div className="space-y-1.5">
              <Label className="text-xs">人设 / 系统提示词</Label>
              <Textarea
                value={setupForm.system_prompt}
                onChange={(e) => setSetupForm((f) => ({ ...f, system_prompt: e.target.value }))}
                rows={5}
                className="text-xs font-mono"
                placeholder="描述智能体的角色、风格、约束。留空则使用默认助手设定。"
              />
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <Label className="text-xs">模型</Label>
              <select
                value={setupForm.model}
                onChange={(e) => setSetupForm((f) => ({ ...f, model: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Workflows */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center justify-between">
                <span>可调用的工作流（{setupForm.enabled_workflows.length} / {publishedWorkflows.length}）</span>
                {publishedWorkflows.length > 0 && (
                  <button
                    type="button"
                    className="text-[10px] text-primary hover:underline"
                    onClick={() => setSetupForm((f) => ({
                      ...f,
                      enabled_workflows: f.enabled_workflows.length === publishedWorkflows.length ? [] : publishedWorkflows.map((w) => w.id),
                    }))}
                  >
                    {setupForm.enabled_workflows.length === publishedWorkflows.length ? '清空' : '全选'}
                  </button>
                )}
              </Label>
              <div className="space-y-1 max-h-40 overflow-y-auto rounded-md border border-border p-2">
                {publishedWorkflows.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-3">
                    没有已发布的工作流。<Link to="/workflow" className="text-primary underline">去创建</Link>
                  </p>
                )}
                {publishedWorkflows.map((w) => {
                  const checked = setupForm.enabled_workflows.includes(w.id);
                  return (
                    <label key={w.id} className="flex items-start gap-2 text-xs cursor-pointer hover:bg-accent/40 rounded p-1.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSetupForm((f) => ({
                          ...f,
                          enabled_workflows: checked ? f.enabled_workflows.filter((x) => x !== w.id) : [...f.enabled_workflows, w.id],
                        }))}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{w.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{w.description || '（无描述）'}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={saveSetup} disabled={saving} className="gap-1.5">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {setupMode === 'create' ? '创建' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({ msg, workflows }: { msg: Message; workflows: Workflow[] }) {
  if (msg.role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm whitespace-pre-wrap">
          {msg.content}
        </div>
        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User size={14} />
        </div>
      </div>
    );
  }
  if (msg.role === 'tool') {
    const r: any = msg.tool_results || {};
    const fname: string = r.function_name || 'tool';
    const wfId = fname.split('_').pop();
    const wf = workflows.find((w) => w.id.replace(/-/g, '').startsWith(wfId || ''));
    const ok = r.content?.status === 'completed';
    return (
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <WorkflowIcon size={14} className="text-primary" />
        </div>
        <div className="max-w-[80%] rounded-xl border border-border bg-card px-3 py-2 text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            {ok ? <CheckCircle2 size={12} className="text-status-success" /> : <AlertTriangle size={12} className="text-status-warning" />}
            <span className="font-medium">{ok ? '工作流执行完成' : '工作流执行失败'}</span>
            <span className="text-muted-foreground">· {wf?.title || fname}</span>
          </div>
          {r.content?.outputs && (
            <div className="text-[11px] text-muted-foreground font-mono bg-muted/30 rounded p-1.5 max-h-32 overflow-y-auto">
              {Object.entries(r.content.outputs).map(([k, v]: any) => (
                <div key={k}><span className="text-primary">{k}:</span> {String(v).slice(0, 200)}</div>
              ))}
            </div>
          )}
          {r.content?.error && <div className="text-[11px] text-destructive">{r.content.error}</div>}
          <div className="text-[10px] text-muted-foreground">{r.content?.steps_count || 0} 个节点执行</div>
        </div>
      </div>
    );
  }
  // assistant
  const tcs = msg.tool_calls;
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Sparkles size={14} className="text-primary" />
      </div>
      <div className="max-w-[80%] space-y-2">
        {Array.isArray(tcs) && tcs.length > 0 && (
          <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
            <div className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              正在调用 {tcs.length} 个工作流：{tcs.map((t: any) => t.function?.name).join(', ')}
            </div>
          </div>
        )}
        {msg.content && (
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}