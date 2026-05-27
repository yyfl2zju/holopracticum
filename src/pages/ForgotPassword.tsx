import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: '发送失败', description: error.message, variant: 'destructive' });
      return;
    }
    setSent(true);
    toast({ title: '邮件已发送', description: '请查收重置密码邮件' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft size={14} /> 返回登录
        </Link>
        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-lg font-semibold text-foreground">找回密码</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">输入注册邮箱，我们将发送重置链接</p>

          {sent ? (
            <div className="text-center py-6">
              <div className="inline-flex w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-foreground">重置链接已发送至</p>
              <p className="text-sm font-medium text-foreground mt-1">{email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Mail size={13} /> 邮箱</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '发送重置链接'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}