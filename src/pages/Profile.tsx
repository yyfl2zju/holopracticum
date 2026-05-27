import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, MapPin, Camera, Save, Calendar,
  Shield, Activity, FileText, Zap, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const defaults = {
  name: '',
  email: '',
  phone: '',
  company: 'HoloPracticum Inc.',
  department: '产品技术部',
  role: '平台用户',
  location: '',
  bio: '',
  joinDate: '',
  avatar: null as string | null,
};

const recentActivity = [
  { action: '运行了合同审查工作流', time: '10 分钟前', icon: FileText },
  { action: '创建了「Q1 财务分析」任务', time: '1 小时前', icon: Zap },
  { action: '发布了内容生成流程模板', time: '3 小时前', icon: Activity },
  { action: '导出了数据驾驶舱报告', time: '昨天', icon: BarChart3 },
];

const stats = [
  { label: '创建任务', value: '128', trend: '+12%' },
  { label: '完成任务', value: '96', trend: '+8%' },
  { label: '工作流运行', value: '45', trend: '+23%' },
  { label: '文档处理', value: '312', trend: '+15%' },
];

export default function Profile() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, department, location, bio, avatar_url')
        .eq('user_id', authUser.id)
        .maybeSingle();
      setUser({
        ...defaults,
        email: authUser.email ?? '',
        joinDate: authUser.created_at?.slice(0, 10) ?? '',
        name: data?.display_name ?? authUser.email?.split('@')[0] ?? '',
        department: data?.department ?? defaults.department,
        location: data?.location ?? '',
        bio: data?.bio ?? '',
        avatar: data?.avatar_url ?? null,
      });
    })();
  }, [authUser]);

  const update = (field: keyof typeof defaults, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      user_id: authUser.id,
      display_name: user.name,
      department: user.department,
      location: user.location,
      bio: user.bio,
    }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast({ title: '保存失败', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: '个人信息已保存', description: '资料更新成功' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">个人信息</h1>
        <p className="text-sm text-muted-foreground mt-1">管理您的账户信息和偏好设置</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ─── Left: Profile Card ─── */}
        <div className="col-span-1 space-y-4">
          {/* Avatar card */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                {user.name.charAt(0)}
              </div>
              <button className="absolute inset-0 rounded-full bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-background" />
              </button>
            </div>
            <h2 className="text-lg font-semibold text-foreground mt-4">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="default" className="mt-2 text-[10px]">
              <Shield size={10} className="mr-1" /> {user.role}
            </Badge>
            <p className="text-xs text-muted-foreground mt-3">
              <Calendar size={12} className="inline mr-1" />
              加入于 {user.joinDate}
            </p>
          </div>

          {/* Stats */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">使用统计</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(s => (
                <div key={s.label} className="p-3 rounded-lg bg-muted/30 text-center">
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  <div className="text-[10px] text-[hsl(var(--status-success))] font-medium">{s.trend}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">最近活动</h3>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                    <a.icon size={13} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground">{a.action}</div>
                    <div className="text-[10px] text-muted-foreground">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right: Edit Form ─── */}
        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-foreground">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><User size={13} /> 姓名</Label>
                <Input value={user.name} onChange={e => update('name', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Mail size={13} /> 邮箱</Label>
                <Input value={user.email} onChange={e => update('email', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Phone size={13} /> 手机号</Label>
                <Input value={user.phone} onChange={e => update('phone', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Building2 size={13} /> 公司</Label>
                <Input value={user.company} onChange={e => update('company', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">部门</Label>
                <Select value={user.department} onValueChange={v => update('department', v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="产品技术部">产品技术部</SelectItem>
                    <SelectItem value="市场运营部">市场运营部</SelectItem>
                    <SelectItem value="法务合规部">法务合规部</SelectItem>
                    <SelectItem value="财务部">财务部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><MapPin size={13} /> 所在地</Label>
                <Input value={user.location} onChange={e => update('location', e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">个人简介</Label>
              <Textarea
                value={user.bio}
                onChange={e => update('bio', e.target.value)}
                className="text-sm min-h-[80px]"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button size="sm" className="gap-1.5" onClick={handleSave}>
                <Save size={14} /> 保存修改
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">偏好设置</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">默认 AI 模型</Label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">默认工作流模板</Label>
                <Select defaultValue="contract">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">合同处理闭环</SelectItem>
                    <SelectItem value="dev">开发需求流程</SelectItem>
                    <SelectItem value="content">内容生成流程</SelectItem>
                    <SelectItem value="finance">财务分析流程</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">任务默认优先级</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">每页显示数量</Label>
                <Select defaultValue="20">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 条</SelectItem>
                    <SelectItem value="20">20 条</SelectItem>
                    <SelectItem value="50">50 条</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
