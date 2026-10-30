import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { AdminSoundAlerts } from '../common/AdminSoundAlerts';
import { useThemeStore } from '../../store/themeStore';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSidebarToggle = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleMobileSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  const closeMobileSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Real-time sound & voice announcements (SoloHearts style) */}
      <AdminSoundAlerts />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={sidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={handleMobileSidebarToggle}
        />
        <main className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
