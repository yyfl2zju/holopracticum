import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Contract from "@/pages/Contract";
import DevAssist from "@/pages/DevAssist";
import Content from "@/pages/Content";
import DashboardBI from "@/pages/DashboardBI";
import Workflow from "@/pages/Workflow";
import Agent from "@/pages/Agent";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

// Placeholder pages for routes not yet built
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">此页面将在下一个迭代中实现</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="holopracticum-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/contract" element={<Contract />} />
              <Route path="/dev-assist" element={<DevAssist />} />
              <Route path="/content" element={<Content />} />
              <Route path="/dashboard-bi" element={<DashboardBI />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
