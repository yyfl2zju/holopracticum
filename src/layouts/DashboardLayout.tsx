import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/platform/AppSidebar';
import AppHeader from '@/components/platform/AppHeader';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
