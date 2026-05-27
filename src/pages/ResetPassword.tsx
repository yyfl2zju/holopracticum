import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: '两次密码不一致', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: '更新失败', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: '密码已更新', description: '请使用新密码登录' });
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-lg font-semibold text-foreground">设置新密码</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">请输入您的新密码</p>

          {!ready ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              正在验证链接...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Lock size={13} /> 新密码</Label>
                <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Lock size={13} /> 确认密码</Label>
                <Input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '更新密码'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}