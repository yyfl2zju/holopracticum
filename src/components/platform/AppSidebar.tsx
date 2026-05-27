import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  FileCheck,
  Code,
  PenTool,
  BarChart3,
  Workflow,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { title: '控制台', icon: LayoutDashboard, path: '/' },
  { title: '任务中心', icon: Zap, path: '/tasks' },
  { title: '合同文档', icon: FileCheck, path: '/contract' },
  { title: '开发辅助', icon: Code, path: '/dev-assist' },
  { title: '内容创作', icon: PenTool, path: '/content' },
  { title: '数据驾驶舱', icon: BarChart3, path: '/dashboard-bi' },
  { title: '流程编排', icon: Workflow, path: '/workflow' },
  { title: '智能体', icon: Sparkles, path: '/agent' },
];

const bottomItems = [
  { title: '个人信息', icon: User, path: '/profile' },
  { title: '系统设置', icon: Settings, path: '/settings' },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 relative shrink-0',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
        <img src="/logo.png" alt="独航者矩阵" className="w-8 h-8 object-contain shrink-0" />
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight whitespace-nowrap">
            独航者矩阵
          </span>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-primary-foreground font-medium'
                : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-primary-foreground font-medium'
                : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[60px] w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
