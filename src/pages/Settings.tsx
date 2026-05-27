import { useState } from 'react';
import {
  Sun, Moon, Monitor, Bell, BellOff, Key, Eye, EyeOff, Globe, Shield,
  Database, Trash2, Download, RefreshCw, Copy, Check, Plus, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';

type SettingsTab = 'general' | 'notifications' | 'api' | 'security' | 'data';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: '通用设置', icon: Globe },
  { id: 'notifications', label: '通知管理', icon: Bell },
  { id: 'api', label: 'API 密钥', icon: Key },
  { id: 'security', label: '安全设置', icon: Shield },
  { id: 'data', label: '数据管理', icon: Database },
];

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const mockApiKeys: ApiKey[] = [
  { id: '1', name: '生产环境', key: 'hp_prod_sk_a1b2c3d4e5f6...', created: '2025-12-01', lastUsed: '2026-03-14', status: 'active' },
  { id: '2', name: '测试环境', key: 'hp_test_sk_x7y8z9w0v1u2...', created: '2026-01-15', lastUsed: '2026-03-10', status: 'active' },
  { id: '3', name: '旧版密钥', key: 'hp_old_sk_m3n4o5p6q7r8...', created: '2025-06-01', lastUsed: '2025-11-20', status: 'revoked' },
];

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // General
  const [language, setLanguage] = useState('zh-CN');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [autoSave, setAutoSave] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [taskNotif, setTaskNotif] = useState(true);
  const [riskNotif, setRiskNotif] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [desktopNotif, setDesktopNotif] = useState(true);

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelist, setIpWhitelist] = useState('');

  // API Keys
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revokeKey = (id: string) => {
    setApiKeys(ks => ks.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
    toast({ title: '已撤销', description: 'API 密钥已停用' });
  };

  const handleSave = () => toast({ title: '设置已保存', description: '所有更改已成功应用' });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">系统设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理平台偏好、通知、API 和安全配置</p>
      </div>

      <div className="flex gap-6">
        {/* Left tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === t.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">

            {/* ─── General ─── */}
            {activeTab === 'general' && (
              <>
                <h2 className="text-base font-semibold text-foreground">通用设置</h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm">主题</Label>
                    <div className="flex gap-2">
                      {([
                        { value: 'light', label: '浅色', icon: Sun },
                        { value: 'dark', label: '深色', icon: Moon },
                        { value: 'system', label: '跟随系统', icon: Monitor },
                      ] as const).map(t => (
                        <Button
                          key={t.value}
                          variant={theme === t.value ? 'default' : 'outline'}
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setTheme(t.value)}
                        >
                          <t.icon size={14} /> {t.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">语言</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh-CN">简体中文</SelectItem>
                          <SelectItem value="en-US">English</SelectItem>
                          <SelectItem value="ja-JP">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">时区</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Shanghai">Asia/Shanghai (UTC+8)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm">自动保存</Label>
                      <p className="text-xs text-muted-foreground">编辑内容时自动保存草稿</p>
                    </div>
                    <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm">使用分析</Label>
                      <p className="text-xs text-muted-foreground">帮助我们改进产品体验</p>
                    </div>
                    <Switch checked={analytics} onCheckedChange={setAnalytics} />
                  </div>
                </div>
              </>
            )}

            {/* ─── Notifications ─── */}
            {activeTab === 'notifications' && (
              <>
                <h2 className="text-base font-semibold text-foreground">通知管理</h2>
                <div className="space-y-4">
                  {[
                    { label: '邮件通知', desc: '任务完成、审批提醒发送到邮箱', checked: emailNotif, onChange: setEmailNotif },
                    { label: '任务状态变更', desc: '任务创建、完成或失败时通知', checked: taskNotif, onChange: setTaskNotif },
                    { label: '风险预警', desc: '合同或财务异常时即时提醒', checked: riskNotif, onChange: setRiskNotif },
                    { label: '桌面通知', desc: '浏览器推送桌面消息', checked: desktopNotif, onChange: setDesktopNotif },
                    { label: '周报汇总', desc: '每周一收到平台使用报告', checked: weeklyReport, onChange: setWeeklyReport },
                  ].map(n => (
                    <div key={n.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <Label className="text-sm">{n.label}</Label>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                      <Switch checked={n.checked} onCheckedChange={n.onChange} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ─── API Keys ─── */}
            {activeTab === 'api' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">API 密钥管理</h2>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus size={14} /> 创建密钥
                  </Button>
                </div>
                <div className="space-y-3">
                  {apiKeys.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{k.name}</span>
                          <Badge variant={k.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                            {k.status === 'active' ? '活跃' : '已撤销'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          {k.key}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          创建于 {k.created} · 上次使用 {k.lastUsed}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyKey(k.id, k.key)}>
                          {copiedId === k.id ? <Check size={14} className="text-[hsl(var(--status-success))]" /> : <Copy size={14} />}
                        </Button>
                        {k.status === 'active' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => revokeKey(k.id)}>
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ─── Security ─── */}
            {activeTab === 'security' && (
              <>
                <h2 className="text-base font-semibold text-foreground">安全设置</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm">双因素认证 (2FA)</Label>
                      <p className="text-xs text-muted-foreground">使用验证器应用增强账户安全</p>
                    </div>
                    <Switch checked={twoFA} onCheckedChange={setTwoFA} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">会话超时（分钟）</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger className="h-9 text-sm w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 分钟</SelectItem>
                        <SelectItem value="30">30 分钟</SelectItem>
                        <SelectItem value="60">1 小时</SelectItem>
                        <SelectItem value="480">8 小时</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">IP 白名单</Label>
                    <p className="text-xs text-muted-foreground">仅允许指定 IP 访问 API，每行一个</p>
                    <Textarea
                      value={ipWhitelist}
                      onChange={e => setIpWhitelist(e.target.value)}
                      placeholder="192.168.1.0/24&#10;10.0.0.1"
                      className="text-xs font-mono min-h-[80px]"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="text-sm font-medium text-foreground mb-2">登录历史</div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {[
                        { time: '2026-03-15 09:23', ip: '120.78.xx.xx', device: 'Chrome / macOS', status: '成功' },
                        { time: '2026-03-14 18:45', ip: '120.78.xx.xx', device: 'Chrome / macOS', status: '成功' },
                        { time: '2026-03-13 14:12', ip: '223.104.xx.xx', device: 'Safari / iOS', status: '成功' },
                      ].map((l, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span>{l.time}</span>
                          <span>{l.ip}</span>
                          <span>{l.device}</span>
                          <Badge variant="secondary" className="text-[10px]">{l.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─── Data ─── */}
            {activeTab === 'data' && (
              <>
                <h2 className="text-base font-semibold text-foreground">数据管理</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">导出数据</div>
                      <p className="text-xs text-muted-foreground mt-0.5">导出全部任务、工作流和配置数据</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Download size={14} /> 导出 JSON
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">同步状态</div>
                      <p className="text-xs text-muted-foreground mt-0.5">上次同步：2026-03-15 09:00</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <RefreshCw size={14} /> 立即同步
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-destructive">清除数据</div>
                      <p className="text-xs text-muted-foreground mt-0.5">删除所有本地缓存和临时文件</p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-1.5 text-xs">
                      <Trash2 size={14} /> 清除缓存
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Save */}
            <div className="pt-4 border-t border-border flex justify-end">
              <Button size="sm" onClick={handleSave}>保存设置</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
