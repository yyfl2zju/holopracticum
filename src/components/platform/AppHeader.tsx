import { Bell, Search, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AppHeader() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? null));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast({ title: '已退出登录', description: '您已安全退出系统' });
    navigate('/auth', { replace: true });
  };

  const initial = (displayName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 w-full max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索任务、文档、工作流..."
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-background rounded border border-border">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-muted-foreground" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-muted-foreground" />
          )}
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors relative">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all">
              <span className="text-xs font-semibold text-primary">{initial}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {user?.email && (
              <div className="px-2 py-1.5 text-[11px] text-muted-foreground truncate">{user.email}</div>
            )}
            <DropdownMenuItem onClick={() => navigate('/profile')} className="text-xs gap-2 cursor-pointer">
              <User size={14} /> 个人信息
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs gap-2 cursor-pointer">
              <Settings size={14} /> 系统设置
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut size={14} /> 退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
