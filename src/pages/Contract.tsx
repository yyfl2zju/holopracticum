import { useEffect, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  RefreshCw,
  Sparkles,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  History,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromFile } from '@/lib/extractText';

const contractTypes = [
  { value: 'labor', label: '劳动合同' },
  { value: 'service', label: '服务协议' },
  { value: 'nda', label: '保密协议' },
  { value: 'purchase', label: '采购合同' },
  { value: 'lease', label: '租赁合同' },
  { value: 'other', label: '其他' },
];

type RiskLevel = 'high' | 'medium' | 'low';
interface Risk {
  level: RiskLevel;
  clause: string;
  issue: string;
  suggestion: string;
  basis?: string;
}
interface Review {
  id: string;
  file_name: string;
  contract_type: string;
  score: number | null;
  summary: string | null;
  risks: Risk[];
  created_at: string;
}

const riskLevelConfig: Record<RiskLevel, { label: string; icon: typeof ShieldAlert; color: string; bg: string; border: string }> = {
  high: { label: '高风险', icon: ShieldAlert, color: 'text-status-error', bg: 'bg-status-error/10', border: 'border-status-error/20' },
  medium: { label: '中风险', icon: ShieldQuestion, color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20' },
  low: { label: '低风险', icon: ShieldCheck, color: 'text-status-success', bg: 'bg-status-success/10', border: 'border-status-success/20' },
};

type ViewState = 'upload' | 'reviewing' | 'result';

export default function Contract() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewState, setViewState] = useState<ViewState>('upload');
  const [selectedType, setSelectedType] = useState('labor');
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const [review, setReview] = useState<Review | null>(null);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [history, setHistory] = useState<Review[]>([]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('contract_reviews')
      .select('id,file_name,contract_type,score,summary,risks,created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setHistory(data as unknown as Review[]);
  };

  useEffect(() => { loadHistory(); }, [user]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast({ title: '文件过大', description: '超过 20MB', variant: 'destructive' });
      return;
    }
    setPickedFile(f);
  };

  const handleReset = () => {
    setViewState('upload');
    setPickedFile(null);
    setPastedText('');
    setReview(null);
    setExpandedRisk(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReview = async () => {
    if (!user) return;
    if (!pickedFile && !pastedText.trim()) {
      toast({ title: '请先上传合同或粘贴文本', variant: 'destructive' });
      return;
    }
    setReviewing(true);
    setViewState('reviewing');
    let attachmentId: string | null = null;
    let fileName = '粘贴的合同文本';
    let text = pastedText.trim();
    try {
      if (pickedFile) {
        fileName = pickedFile.name;
        setProgressLabel('正在提取文本...');
        text = await extractTextFromFile(pickedFile);
        if (!text || text.length < 30) throw new Error('未提取到有效文本，请检查文件');

        setProgressLabel('正在上传文件...');
        const path = `${user.id}/${crypto.randomUUID()}-${pickedFile.name}`;
        const { error: upErr } = await supabase.storage
          .from('task-attachments')
          .upload(path, pickedFile, { contentType: pickedFile.type });
        if (!upErr) {
          const { data: att } = await supabase
            .from('task_attachments')
            .insert({
              user_id: user.id,
              file_name: pickedFile.name,
              file_path: path,
              file_size: pickedFile.size,
              mime_type: pickedFile.type,
            })
            .select('id')
            .single();
          attachmentId = att?.id ?? null;
        }
      }

      setProgressLabel('AI 正在逐条审查条款...');
      const { data, error } = await supabase.functions.invoke('review-contract', {
        body: {
          text,
          file_name: fileName,
          contract_type: selectedType,
          attachment_id: attachmentId,
        },
      });
      if (error) throw new Error(error.message);
      const r = (data as { review: Review })?.review;
      if (!r) throw new Error('未返回结果');
      setReview(r);
      setExpandedRisk(r.risks[0] ? `${r.id}-0` : null);
      setViewState('result');
      loadHistory();
      toast({ title: '审查完成', description: `共识别 ${r.risks.length} 条风险` });
    } catch (e: any) {
      toast({ title: '审查失败', description: e.message, variant: 'destructive' });
      setViewState('upload');
    } finally {
      setReviewing(false);
      setProgressLabel('');
    }
  };

  const handleExport = () => {
    if (!review) return;
    const lines: string[] = [
      `# 合同审查报告`,
      ``,
      `- 文件：${review.file_name}`,
      `- 类型：${contractTypes.find((c) => c.value === review.contract_type)?.label ?? review.contract_type}`,
      `- 合规评分：${review.score ?? 'N/A'} / 100`,
      `- 审查时间：${new Date(review.created_at).toLocaleString('zh-CN')}`,
      ``,
      `## 总体评价`,
      review.summary ?? '',
      ``,
      `## 风险条款（${review.risks.length}）`,
      ``,
    ];
    review.risks.forEach((r, i) => {
      lines.push(`### ${i + 1}. [${riskLevelConfig[r.level].label}] ${r.clause}`);
      lines.push(`**问题：** ${r.issue}`);
      lines.push('');
      lines.push(`**建议：** ${r.suggestion}`);
      if (r.basis) {
        lines.push('');
        lines.push(`**依据：** ${r.basis}`);
      }
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${review.file_name.replace(/\.[^.]+$/, '')}-审查报告.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadHistoryItem = (r: Review) => {
    setReview(r);
    setSelectedType(r.contract_type);
    setExpandedRisk(r.risks[0] ? `${r.id}-0` : null);
    setViewState('result');
  };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('contract_reviews').delete().eq('id', id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (review?.id === id) handleReset();
  };

  const summary = review
    ? {
        high: review.risks.filter((r) => r.level === 'high').length,
        medium: review.risks.filter((r) => r.level === 'medium').length,
        low: review.risks.filter((r) => r.level === 'low').length,
      }
    : { high: 0, medium: 0, low: 0 };

  const scoreColor = review?.score == null
    ? 'text-muted-foreground'
    : review.score >= 80
    ? 'text-status-success'
    : review.score >= 60
    ? 'text-status-warning'
    : 'text-status-error';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">合同与文档处理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            上传 PDF / Word 合同或粘贴文本，AI 自动逐条识别风险并给出修改建议
          </p>
        </div>
        {viewState === 'result' && review && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 新建审查
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> 导出报告
            </button>
          </div>
        )}
      </div>

      {viewState === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={handleFilePick}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">点击上传合同文件</p>
                <p className="text-xs text-muted-foreground mt-1">支持 PDF、Word(.docx)、文本，最大 20MB</p>
              </div>
            </div>

            {pickedFile && (
              <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{pickedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(pickedFile.size / 1024).toFixed(1)} KB · {pickedFile.type || '未知类型'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPickedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">或直接粘贴合同文本</p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="将合同条款粘贴到此处..."
                className="w-full min-h-[140px] bg-background border border-input rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              {pastedText && (
                <p className="text-[11px] text-muted-foreground">已输入 {pastedText.length} 字符</p>
              )}
            </div>

            <button
              onClick={handleReview}
              disabled={reviewing || (!pickedFile && !pastedText.trim())}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              开始 AI 审查
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium">合同类型</h3>
              <div className="grid grid-cols-2 gap-2">
                {contractTypes.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setSelectedType(ct.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs transition-colors border',
                      selectedType === ct.value
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4" /> 历史审查
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">暂无记录</p>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => loadHistoryItem(h)}
                      className="group flex items-start gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent/50 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{h.file_name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {h.score ?? '-'} 分 · {h.risks.length} 风险 ·{' '}
                          {new Date(h.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteHistory(h.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewState === 'reviewing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{progressLabel || 'AI 正在审查合同...'}</p>
            <p className="text-xs text-muted-foreground mt-1">大型合同可能需要 10-30 秒</p>
          </div>
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {viewState === 'result' && review && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {review.summary && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> 总体评价
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.summary}</p>
              </div>
            )}

            <div className="space-y-3">
              {review.risks.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-status-success mx-auto mb-2" />
                  <p className="text-sm font-medium">未发现明显风险条款</p>
                  <p className="text-xs text-muted-foreground mt-1">合同结构与表述较为规范</p>
                </div>
              ) : (
                review.risks.map((risk, idx) => {
                  const cfg = riskLevelConfig[risk.level];
                  const Icon = cfg.icon;
                  const key = `${review.id}-${idx}`;
                  const isExpanded = expandedRisk === key;
                  return (
                    <div
                      key={key}
                      className={cn('bg-card border rounded-xl overflow-hidden transition-colors', cfg.border)}
                    >
                      <button
                        onClick={() => setExpandedRisk(isExpanded ? null : key)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                          <Icon className={cn('w-4 h-4', cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{risk.clause}</span>
                            <span className={cn('status-badge', cfg.bg, cfg.color)}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{risk.issue}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="pl-11">
                            <div className="bg-background rounded-lg p-3 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">问题描述</p>
                              <p className="text-sm">{risk.issue}</p>
                            </div>
                          </div>
                          <div className="pl-11">
                            <div className="bg-status-success/5 border border-status-success/10 rounded-lg p-3 space-y-1">
                              <p className="text-xs font-medium text-status-success flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> 修改建议
                              </p>
                              <p className="text-sm">{risk.suggestion}</p>
                            </div>
                          </div>
                          {risk.basis && (
                            <div className="pl-11">
                              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 space-y-1">
                                <p className="text-xs font-medium text-primary">法律依据</p>
                                <p className="text-sm">{risk.basis}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 text-center space-y-3">
              <p className="text-xs text-muted-foreground">合规评分</p>
              <p className={cn('text-5xl font-bold', scoreColor)}>{review.score ?? '—'}</p>
              <p className="text-xs text-muted-foreground">满分 100 · {review.risks.length} 个风险条款</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium">风险概览</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-status-error" /> 高风险
                  </span>
                  <span className="text-sm font-semibold text-status-error">{summary.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-status-warning" /> 中风险
                  </span>
                  <span className="text-sm font-semibold text-status-warning">{summary.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> 低风险
                  </span>
                  <span className="text-sm font-semibold text-status-success">{summary.low}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-medium">文件信息</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between gap-2">
                  <span>文件名</span>
                  <span className="text-foreground truncate" title={review.file_name}>{review.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>合同类型</span>
                  <span className="text-foreground">
                    {contractTypes.find((c) => c.value === review.contract_type)?.label ?? review.contract_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>审查时间</span>
                  <span className="text-foreground">
                    {new Date(review.created_at).toLocaleString('zh-CN', {
                      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}