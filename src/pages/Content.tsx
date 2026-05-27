import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  PenTool,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Globe,
  BookOpen,
  FileText,
  Palette,
  Zap,
  Target,
  Heart,
  Bot,
  Play,
  RotateCcw,
  Loader2,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---- Config ----

const styleOptions = [
  { value: 'professional', label: '专业正式', icon: BookOpen },
  { value: 'casual', label: '轻松活泼', icon: Heart },
  { value: 'creative', label: '创意新潮', icon: Palette },
  { value: 'provocative', label: '犀利吸睛', icon: Zap },
];

const platformOptions = [
  { value: 'wechat', label: '微信公众号', maxLen: 2500 },
  { value: 'xiaohongshu', label: '小红书', maxLen: 1000 },
  { value: 'douyin', label: '抖音/短视频', maxLen: 300 },
  { value: 'weibo', label: '微博', maxLen: 140 },
  { value: 'zhihu', label: '知乎', maxLen: 3000 },
  { value: 'linkedin', label: 'LinkedIn', maxLen: 1500 },
];

type ViewState = 'input' | 'generating' | 'result';

type ContentResult = {
  titles: { text: string; score: number }[];
  body: string;
  platforms: Record<string, { content: string; hashtags: string[] }>;
  posters: { style: string; prompt: string }[];
  compliance: { level: 'pass' | 'warning'; text: string; detail: string }[];
};

const GENERATION_STEPS = [
  '生成标题候选',
  '撰写长文正文',
  '适配多平台改写',
  '生成海报提示词',
  '合规风险检查',
];

export default function Content() {
  const { toast } = useToast();
  const [viewState, setViewState] = useState<ViewState>('input');
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['wechat', 'xiaohongshu']);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [activePlatform, setActivePlatform] = useState('xiaohongshu');
  const [activeSection, setActiveSection] = useState<string>('titles');
  const [copied, setCopied] = useState<string | null>(null);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [posterImages, setPosterImages] = useState<Record<number, string>>({});
  const [posterLoading, setPosterLoading] = useState<Record<number, boolean>>({});

  const generatePoster = async (idx: number, prompt: string) => {
    setPosterLoading((p) => ({ ...p, [idx]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('generate-poster', { body: { prompt } });
      if (error) throw error;
      const errMsg = (data as any)?.error;
      if (errMsg) throw new Error(errMsg);
      const img = (data as any)?.image;
      if (!img) throw new Error('未返回图片');
      setPosterImages((p) => ({ ...p, [idx]: img }));
    } catch (e: any) {
      toast({ title: '出图失败', description: e?.message || '请稍后重试', variant: 'destructive' });
    } finally {
      setPosterLoading((p) => ({ ...p, [idx]: false }));
    }
  };

  const togglePlatform = (v: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(v) ? prev.filter((p) => p !== v) : [...prev, v]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (selectedPlatforms.length === 0) {
      toast({ title: '请至少选择一个平台', variant: 'destructive' });
      return;
    }
    setViewState('generating');
    setProgress(0);

    // Simulate progressive step ticker
    const ticker = setInterval(() => {
      setProgress((p) => (p < GENERATION_STEPS.length - 1 ? p + 1 : p));
    }, 1500);

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          topic: topic.trim(),
          style: selectedStyle,
          platforms: selectedPlatforms,
        },
      });
      clearInterval(ticker);

      if (error) throw error;
      const r = (data as { result?: ContentResult; error?: string })?.result;
      const errMsg = (data as { error?: string })?.error;
      if (errMsg) throw new Error(errMsg);
      if (!r) throw new Error('AI 未返回有效结果');

      setResult(r);
      // pick a sensible default tab
      const firstPlatform = selectedPlatforms.find((p) => r.platforms?.[p]) ?? selectedPlatforms[0];
      setActivePlatform(firstPlatform);
      setSelectedTitle(0);
      setActiveSection('titles');
      setProgress(GENERATION_STEPS.length);
      setViewState('result');
      toast({ title: '生成完成', description: `已生成 ${r.titles?.length ?? 0} 个标题、${Object.keys(r.platforms ?? {}).length} 个平台版本` });
    } catch (e: any) {
      clearInterval(ticker);
      setViewState('input');
      toast({
        title: '生成失败',
        description: e?.message ?? '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setViewState('input');
    setResult(null);
    setActiveSection('titles');
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportAll = () => {
    if (!result) return;
    const md: string[] = [];
    md.push(`# ${topic}\n`);
    md.push(`> 风格：${styleOptions.find((s) => s.value === selectedStyle)?.label} · 生成时间 ${new Date().toLocaleString('zh-CN')}\n`);
    md.push(`## 标题候选`);
    result.titles.forEach((t, i) => md.push(`${i + 1}. **${t.text}** （预测分 ${t.score}）`));
    md.push(`\n## 长文正文\n\n${result.body}\n`);
    md.push(`## 多平台改写`);
    Object.entries(result.platforms).forEach(([k, v]) => {
      const label = platformOptions.find((p) => p.value === k)?.label ?? k;
      md.push(`\n### ${label}\n\n${v.content}\n\n标签：${v.hashtags.map((h) => `#${h}`).join(' ')}`);
    });
    md.push(`\n## 海报提示词`);
    result.posters.forEach((p, i) => md.push(`\n### 方案 ${i + 1}：${p.style}\n\n${p.prompt}`));
    md.push(`\n## 合规审查`);
    result.compliance.forEach((c) => md.push(`- [${c.level === 'pass' ? '✓' : '⚠'}] **${c.text}** — ${c.detail}`));

    const blob = new Blob([md.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.slice(0, 24) || 'content'}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyText(text, id)}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied === id ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
      {copied === id ? '已复制' : '复制'}
    </button>
  );

  const warnings = result?.compliance.filter((c) => c.level === 'warning').length ?? 0;

  const sections = [
    { key: 'titles', label: '标题', icon: Target },
    { key: 'body', label: '正文', icon: FileText },
    { key: 'platforms', label: '多平台改写', icon: Globe },
    { key: 'poster', label: '海报提示词', icon: ImageIcon },
    { key: 'compliance', label: '合规审查', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <PenTool className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">AI 内容运营台</h1>
            <p className="text-[11px] text-muted-foreground">
              {viewState === 'result' && result
                ? `主题: ${topic} · ${Object.keys(result.platforms).length} 个平台 · ${styleOptions.find((s) => s.value === selectedStyle)?.label}`
                : '输入主题，AI 一站式生成标题、正文、多平台改写、海报与合规检查'}
            </p>
          </div>
        </div>
        {viewState === 'result' && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              <Download className="w-3 h-3" />
              导出 Markdown
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              新主题
            </button>
          </div>
        )}
      </div>

      {/* ==================== INPUT STATE ==================== */}
      {viewState === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-status-error/60" />
                  <span className="w-3 h-3 rounded-full bg-status-warning/60" />
                  <span className="w-3 h-3 rounded-full bg-status-success/60" />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono ml-2">内容创作 — 主题输入</span>
              </div>
              <div className="p-4">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={'输入你的创作主题或核心内容\n\n例如：\n小团队如何用 AI 工具提升 10 倍效率，包含实际案例和数据对比'}
                  className="w-full min-h-[140px] bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/50 font-mono leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
                  }}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Bot className="w-3 h-3" />
                  标题 → 正文 → 多平台改写 → 海报 → 合规检查
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors',
                    topic.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Play className="w-3 h-3" />
                  生成全套内容
                  <kbd className="hidden sm:inline-flex px-1 py-0.5 rounded bg-primary-foreground/20 text-[9px] font-mono">⌘↵</kbd>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { t: 'AI 提效实战', d: '小团队用 AI 工具提升效率的真实案例' },
                { t: '新品发布推广', d: 'SaaS 产品上线的多平台推广文案' },
                { t: '行业趋势解读', d: '2026 年 AI Agent 行业发展分析' },
                { t: '用户故事分享', d: '客户成功案例包装与传播' },
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setTopic(`${p.t}：${p.d}`)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group"
                >
                  <p className="text-xs font-medium group-hover:text-primary transition-colors">{p.t}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.d}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary" /> 文案风格
              </p>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStyle(s.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors',
                      selectedStyle === s.value
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" /> 发布平台
              </p>
              <div className="space-y-1.5">
                {platformOptions.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => togglePlatform(p.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-colors',
                      selectedPlatforms.includes(p.value)
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] opacity-60">≤{p.maxLen}字</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GENERATING ==================== */}
      {viewState === 'generating' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-status-error/60" />
              <span className="w-3 h-3 rounded-full bg-status-warning/60" />
              <span className="w-3 h-3 rounded-full bg-status-success/60" />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono ml-2">
              <Sparkles className="w-3 h-3 inline animate-pulse mr-1" />
              AI 内容生成中...
            </span>
          </div>
          <div className="p-6 space-y-4">
            {GENERATION_STEPS.map((step, i) => {
              const done = i < progress;
              const current = i === progress;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors',
                    done ? 'bg-status-success/10' : current ? 'bg-primary/10' : 'bg-secondary'
                  )}>
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    ) : current ? (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={cn('text-xs', done || current ? 'text-foreground' : 'text-muted-foreground')}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== RESULT STATE ==================== */}
      {viewState === 'result' && result && (
        <div className="flex gap-5" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="w-44 shrink-0 space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors',
                  activeSection === s.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
                {s.key === 'compliance' && warnings > 0 && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-status-warning/10 text-status-warning">{warnings}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto space-y-4 pr-1">
            {/* Titles */}
            {activeSection === 'titles' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">标题候选</h2>
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> 重新生成
                  </button>
                </div>
                {result.titles.map((t, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedTitle(i)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      selectedTitle === i
                        ? 'border-primary/40 bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/20'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      selectedTitle === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    )}>
                      {i + 1}
                    </div>
                    <p className="text-sm flex-1 leading-snug">{t.text}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={cn('text-xs font-bold', t.score >= 90 ? 'text-status-success' : 'text-status-warning')}>
                          {t.score}
                        </p>
                        <p className="text-[9px] text-muted-foreground">点击率预测</p>
                      </div>
                      <CopyBtn text={t.text} id={`title-${i}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Body */}
            {activeSection === 'body' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">正文内容</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{result.body.length} 字</span>
                    <CopyBtn text={result.body} id="body" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.body}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Platforms */}
            {activeSection === 'platforms' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">多平台改写</h2>
                </div>
                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5 overflow-x-auto">
                  {Object.keys(result.platforms).map((p) => {
                    const cfg = platformOptions.find((o) => o.value === p);
                    return (
                      <button
                        key={p}
                        onClick={() => setActivePlatform(p)}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors',
                          activePlatform === p
                            ? 'bg-card text-foreground shadow-sm font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {cfg?.label ?? p}
                      </button>
                    );
                  })}
                </div>
                {result.platforms[activePlatform] && (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{platformOptions.find((o) => o.value === activePlatform)?.label ?? activePlatform}</span>
                        <span>·</span>
                        <span>{result.platforms[activePlatform].content.length} / {platformOptions.find((o) => o.value === activePlatform)?.maxLen} 字</span>
                      </div>
                      <CopyBtn text={result.platforms[activePlatform].content} id={`platform-${activePlatform}`} />
                    </div>
                    <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.platforms[activePlatform].content}
                    </div>
                    {result.platforms[activePlatform].hashtags.length > 0 && (
                      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
                        {result.platforms[activePlatform].hashtags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Posters */}
            {activeSection === 'poster' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">配图 / 海报提示词</h2>
                  <span className="text-[10px] text-muted-foreground">可直接用于 Midjourney / DALL·E / Stable Diffusion</span>
                </div>
                {result.posters.map((p, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium">方案 {i + 1}：{p.style}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => generatePoster(i, p.prompt)}
                          disabled={posterLoading[i]}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                        >
                          {posterLoading[i]
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Sparkles className="w-3 h-3" />}
                          {posterImages[i] ? '重新生成' : '生成图片'}
                        </button>
                        <CopyBtn text={p.prompt} id={`poster-${i}`} />
                      </div>
                    </div>
                    <div className="p-4 text-sm text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap">
                      {p.prompt}
                    </div>
                    {posterImages[i] && (
                      <div className="border-t border-border bg-muted/10 p-4">
                        <img
                          src={posterImages[i]}
                          alt={`海报方案 ${i + 1}`}
                          className="rounded-md max-h-96 mx-auto shadow-sm"
                        />
                        <div className="flex justify-center mt-3">
                          <a
                            href={posterImages[i]}
                            download={`poster-${i + 1}.png`}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            <Download className="w-3 h-3" /> 下载图片
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Compliance */}
            {activeSection === 'compliance' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">合规审查结果</h2>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-status-success">
                      <CheckCircle2 className="w-3 h-3" /> {result.compliance.filter((r) => r.level === 'pass').length} 通过
                    </span>
                    <span className="flex items-center gap-1 text-status-warning">
                      <AlertTriangle className="w-3 h-3" /> {warnings} 建议修改
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.compliance.map((r, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        r.level === 'pass' ? 'border-border bg-card' : 'border-status-warning/20 bg-status-warning/5'
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {r.level === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-status-success" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-status-warning" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{r.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{r.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}