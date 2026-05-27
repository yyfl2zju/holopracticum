import { useEffect, useRef, useState } from 'react';
import {
  BarChart3, Upload, TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2,
  Sparkles, Bot, RefreshCw, FileSpreadsheet, ShieldAlert,
  Lightbulb, X, Calendar, Loader2, History, Download, Trash2,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Area, AreaChart, Legend,
  RadialBarChart, RadialBar, LineChart, Line, ComposedChart,
} from 'recharts';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// ---------- Types ----------
interface KPI { title: string; value: string; change: string; trend: 'up'|'down'|'flat'; subtitle: string; positive: boolean; }
interface Monthly { month: string; revenue: number; cost: number; profit: number; cashflow: number; }
interface Cost { name: string; value: number; }
interface Forecast { month: string; actual: number | null; forecast: number | null; }
interface Risk { level: 'high'|'medium'|'low'; title: string; detail: string; metric: string; date: string; }
interface Insight { type: 'optimization'|'prediction'|'warning'|'opportunity'; title: string; content: string; }
interface AnalysisResult {
  id?: string;
  fileName: string;
  rowCount: number;
  summary: string;
  kpis: KPI[];
  monthly: Monthly[];
  cost_structure: Cost[];
  forecast: Forecast[];
  risks: Risk[];
  insights: Insight[];
  created_at?: string;
}

const COST_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(142, 71%, 45%)',
  'hsl(0, 84%, 60%)',
  'hsl(190, 85%, 50%)',
];

const riskLevelCfg = {
  high: { label: '高', color: 'text-status-error', bg: 'bg-status-error/10', border: 'border-status-error/30', glow: 'shadow-[0_0_20px_-5px_hsl(var(--status-error)/0.5)]' },
  medium: { label: '中', color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30', glow: '' },
  low: { label: '低', color: 'text-status-info', bg: 'bg-status-info/10', border: 'border-status-info/30', glow: '' },
};

const insightIcons = { optimization: Sparkles, prediction: TrendingUp, warning: AlertTriangle, opportunity: Lightbulb };
const insightColors = { optimization: 'text-primary', prediction: 'text-status-success', warning: 'text-status-warning', opportunity: 'text-status-info' };

// ---------- File parsing ----------
async function parseFile(file: File): Promise<{ columns: string[]; rows: any[] }> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true, dynamicTyping: true,
        complete: (r) => resolve({ columns: r.meta.fields || [], rows: r.data as any[] }),
        error: reject,
      });
    });
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });
    const columns = Object.keys(json[0] || {});
    return { columns, rows: json };
  }
  throw new Error('暂只支持 CSV / XLSX / XLS');
}

// ---------- Custom Tooltip ----------
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-medium mb-1.5 text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => entry.value != null && (
        <p key={i} className="flex items-center gap-2 text-foreground">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

type ViewState = 'upload' | 'analyzing' | 'result';

export default function DashboardBI() {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeChart, setActiveChart] = useState<'revenue' | 'cashflow' | 'cost'>('revenue');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history
  useEffect(() => {
    if (!user) return;
    supabase.from('data_analyses').select('*').order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => {
        if (data) setHistory(data.map((d: any) => ({
          id: d.id, fileName: d.file_name, rowCount: d.row_count,
          summary: d.summary || '', kpis: d.kpis, monthly: d.monthly,
          cost_structure: d.cost_structure, forecast: d.forecast,
          risks: d.risks, insights: d.insights, created_at: d.created_at,
        })));
      });
  }, [user, result]);

  const handleFilePick = async (f: File) => {
    setFile(f);
    setParsing(true);
    try {
      const p = await parseFile(f);
      if (p.rows.length === 0) throw new Error('文件为空');
      setParsed(p);
      toast.success(`解析完成：${p.rows.length} 行 × ${p.columns.length} 列`);
    } catch (e: any) {
      toast.error(e.message || '解析失败');
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!parsed || !file || !user) return;
    setViewState('analyzing');
    setAnalyzeStep(0);
    const steps = [800, 600, 700, 600];
    let stepIdx = 0;
    const stepTimer = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) setAnalyzeStep(stepIdx);
      else clearInterval(stepTimer);
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-data', {
        body: { fileName: file.name, rows: parsed.rows, columns: parsed.columns },
      });
      clearInterval(stepTimer);
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalyzeStep(steps.length);

      // Persist
      const { data: saved } = await supabase.from('data_analyses').insert({
        user_id: user.id,
        file_name: file.name,
        row_count: parsed.rows.length,
        summary: data.summary,
        kpis: data.kpis, monthly: data.monthly,
        cost_structure: data.cost_structure, forecast: data.forecast,
        risks: data.risks, insights: data.insights,
      }).select().single();

      setResult({
        id: saved?.id,
        fileName: file.name,
        rowCount: parsed.rows.length,
        summary: data.summary,
        kpis: data.kpis, monthly: data.monthly,
        cost_structure: data.cost_structure, forecast: data.forecast,
        risks: data.risks, insights: data.insights,
      });
      setViewState('result');
      toast.success('AI 分析完成');
    } catch (e: any) {
      clearInterval(stepTimer);
      toast.error(e.message || '分析失败');
      setViewState('upload');
    }
  };

  const handleReset = () => {
    setViewState('upload');
    setFile(null);
    setParsed(null);
    setResult(null);
    setActiveChart('revenue');
  };

  const loadHistory = (h: AnalysisResult) => {
    setResult(h);
    setViewState('result');
    setShowHistory(false);
  };

  const deleteHistory = async (id: string) => {
    await supabase.from('data_analyses').delete().eq('id', id);
    setHistory(history.filter(h => h.id !== id));
    toast.success('已删除');
  };

  const exportReport = () => {
    if (!result) return;
    const md = `# 数据分析报告 - ${result.fileName}\n\n${result.summary}\n\n## KPI\n${result.kpis.map(k => `- **${k.title}**: ${k.value} (${k.change}) — ${k.subtitle}`).join('\n')}\n\n## 风险预警\n${result.risks.map(r => `- [${r.level.toUpperCase()}] ${r.title}\n  ${r.detail} (${r.metric})`).join('\n')}\n\n## AI 决策建议\n${result.insights.map(i => `### ${i.title}\n${i.content}`).join('\n\n')}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${result.fileName}-分析报告.md`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">数据驾驶舱</h1>
            <p className="text-[11px] text-muted-foreground">
              {viewState === 'result' ? `${result?.fileName} · ${result?.rowCount} 行数据 · AI 洞察` : '上传 Excel/CSV，AI 自动生成图表、预测与风险分析'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            <History className="w-3 h-3" /> 历史 ({history.length})
          </button>
          {viewState === 'result' && (
            <>
              <button onClick={exportReport} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors">
                <Download className="w-3 h-3" /> 导出
              </button>
              <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <RefreshCw className="w-3 h-3" /> 新分析
              </button>
            </>
          )}
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2 animate-fade-in">
          <p className="text-xs font-medium mb-2">历史分析记录</p>
          {history.length === 0 && <p className="text-xs text-muted-foreground">暂无历史记录</p>}
          {history.map(h => (
            <div key={h.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/30 transition-colors group">
              <button onClick={() => loadHistory(h)} className="flex items-center gap-3 flex-1 text-left">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-medium">{h.fileName}</p>
                  <p className="text-[10px] text-muted-foreground">{h.rowCount} 行 · {new Date(h.created_at!).toLocaleString('zh-CN')}</p>
                </div>
              </button>
              <button onClick={() => deleteHistory(h.id!)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ============ UPLOAD ============ */}
      {viewState === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFilePick(f); }}
              className="relative border-2 border-dashed border-border rounded-xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_70%)] pointer-events-none" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative z-10">
                {parsing ? <Loader2 className="w-7 h-7 text-primary animate-spin" /> : <Upload className="w-7 h-7 text-primary" />}
              </div>
              <div className="text-center relative z-10">
                <p className="text-sm font-medium">{parsing ? '正在解析文件...' : '点击或拖拽上传财务/业务数据文件'}</p>
                <p className="text-xs text-muted-foreground mt-1">支持 .xlsx / .xls / .csv，最大 50MB</p>
              </div>
              <input
                ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilePick(f); }}
              />
            </div>

            {file && parsed && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-status-success" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · {parsed.rows.length} 行 · {parsed.columns.length} 列</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setParsed(null); }} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Data preview */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-border bg-muted/30">
                    <p className="text-xs font-medium">数据预览（前 5 行）</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/20">
                        <tr>
                          {parsed.columns.slice(0, 8).map(c => (
                            <th key={c} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.rows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            {parsed.columns.slice(0, 8).map(c => (
                              <td key={c} className="px-3 py-1.5 whitespace-nowrap">{String(row[c] ?? '-').slice(0, 30)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg shadow-primary/20"
                >
                  <Sparkles className="w-4 h-4" /> 开始 AI 分析
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> AI 分析维度
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-status-success" /> 自动识别时间/指标列</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-status-success" /> 收入/支出趋势分析</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-status-success" /> 现金流预测（3 期）</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-status-success" /> 成本结构拆解</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-status-success" /> 异常检测与风险预警</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-status-success" /> AI 决策建议</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ANALYZING ============ */}
      {viewState === 'analyzing' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,hsl(var(--primary)/0.05),transparent,hsl(var(--primary)/0.05))] animate-spin" style={{ animationDuration: '8s' }} />
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 relative">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-mono">AI 数据分析中...</span>
          </div>
          <div className="p-6 space-y-4 relative">
            {['解析数据结构与列含义', '识别时间序列与关键指标', '生成图表 / 训练预测模型', '异常检测与 AI 洞察生成'].map((step, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  i < analyzeStep ? 'bg-status-success/10' : i === analyzeStep ? 'bg-primary/10' : 'bg-secondary'
                )}>
                  {i < analyzeStep ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    : i === analyzeStep ? <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    : <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                </div>
                <span className={cn('text-xs', i <= analyzeStep ? 'text-foreground' : 'text-muted-foreground')}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ RESULT ============ */}
      {viewState === 'result' && result && (
        <div className="space-y-5 animate-fade-in">
          {/* Summary banner */}
          {result.summary && (
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="flex items-start gap-3 relative">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary mb-1">AI 数据摘要</p>
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards — gradient + sparkline */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {result.kpis.map((kpi, i) => {
              const Icon = [DollarSign, TrendingDown, TrendingUp, BarChart3][i % 4];
              const sparkData = result.monthly.slice(-7).map((m, idx) => ({ x: idx, y: [m.revenue, m.cost, m.profit, m.cashflow][i % 4] }));
              const isPositive = kpi.positive;
              return (
                <div key={i} className="relative overflow-hidden bg-card border border-border rounded-xl p-4 group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{kpi.title}</span>
                      <Icon className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded',
                          isPositive ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
                        )}>
                          {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {kpi.change}
                        </span>
                      </div>
                      {/* Sparkline */}
                      <div className="w-16 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkData}>
                            <Line type="monotone" dataKey="y" stroke={isPositive ? 'hsl(var(--status-success))' : 'hsl(var(--status-error))'} strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{kpi.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
                  {[
                    { key: 'revenue' as const, label: '收入 / 支出 / 利润' },
                    { key: 'cashflow' as const, label: '现金流预测' },
                    { key: 'cost' as const, label: '成本结构' },
                  ].map((t) => (
                    <button
                      key={t.key} onClick={() => setActiveChart(t.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs transition-all',
                        activeChart === t.key ? 'bg-card text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              {/* Revenue / Cost / Profit combo */}
              {activeChart === 'revenue' && (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={result.monthly}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--status-success))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--status-success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <ReTooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="revenue" name="收入" fill="url(#revGrad)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="cost" name="支出" fill="url(#costGrad)" radius={[6, 6, 0, 0]} />
                    <Area type="monotone" dataKey="profit" name="利润" stroke="hsl(var(--status-success))" strokeWidth={2} fill="url(#profitGrad)" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {/* Cashflow gradient area */}
              {activeChart === 'cashflow' && (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={result.forecast}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--status-warning))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--status-warning))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <ReTooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Area dataKey="actual" name="实际" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#actualGrad)" connectNulls={false} />
                    <Area dataKey="forecast" name="AI 预测" stroke="hsl(var(--status-warning))" strokeWidth={2.5} strokeDasharray="6 3" fill="url(#forecastGrad)" connectNulls={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {/* Cost structure — radial bar + legend */}
              {activeChart === 'cost' && (
                <div className="grid grid-cols-2 gap-4 items-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadialBarChart
                      innerRadius="25%" outerRadius="100%"
                      data={result.cost_structure.map((c, i) => ({ ...c, fill: COST_COLORS[i % COST_COLORS.length] }))}
                      startAngle={90} endAngle={-270}
                    >
                      <RadialBar dataKey="value" background={{ fill: 'hsl(var(--muted) / 0.3)' }} cornerRadius={6} />
                      <ReTooltip content={<ChartTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {result.cost_structure.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COST_COLORS[i % COST_COLORS.length] }} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: COST_COLORS[i % COST_COLORS.length] }} />
                          </div>
                          <span className="font-mono font-medium w-10 text-right">{item.value.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Alerts */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-status-error" /> 风险预警
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-status-error/10 text-status-error font-medium">
                  {result.risks.filter(r => r.level === 'high').length} 高 · {result.risks.length} 总
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px]">
                {result.risks.map((risk, idx) => {
                  const cfg = riskLevelCfg[risk.level];
                  return (
                    <div key={idx} className={cn('p-3 rounded-lg border', cfg.border, cfg.bg, cfg.glow)}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', cfg.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium leading-snug">{risk.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{risk.detail}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn('text-[10px] font-mono font-medium', cfg.color)}>{risk.metric}</span>
                            <span className="text-[9px] text-muted-foreground">{risk.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">AI 决策建议</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                基于 {result.rowCount} 行数据生成
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.insights.map((insight, i) => {
                const Icon = insightIcons[insight.type];
                const color = insightColors[insight.type];
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 hover:border-primary/20 transition-all group">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', color.replace('text-', 'bg-') + '/10')}>
                      <Icon className={cn('w-4 h-4', color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{insight.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{insight.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}