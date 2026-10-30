import { Bell, Moon, Sun, LogOut, Clock, Calendar, Menu, User, Check, Trash2, MapPin, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { isSoundMuted, setSoundMuted, playNotificationSound } from '../../services/soundService';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header({ sidebarCollapsed, onMobileMenuToggle }) {
  const { theme, toggleTheme } = useThemeStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundMuted, setLocalSoundMuted] = useState(isSoundMuted());
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'ride', title: 'New Ride Booking', description: 'Auto ride booked in Sector 12', time: new Date(), read: false },
    { id: 2, type: 'driver', title: 'New Driver Registration', description: 'Ramesh Kumar applied for driver onboarding', time: new Date(Date.now() - 300000), read: false },
    { id: 3, type: 'alert', title: 'Surge Zone Detected', description: 'High demand in Jubilee Hills area', time: new Date(Date.now() - 600000), read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const notifIcon = (type) => {
    if (type === 'ride') return <MapPin className="h-3.5 w-3.5 text-blue-500" />;
    if (type === 'driver') return <User className="h-3.5 w-3.5 text-emerald-500" />;
    if (type === 'alert') return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    return <Bell className="h-3.5 w-3.5 text-slate-400" />;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 sm:gap-4 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all w-full px-2 sm:px-4">
      {/* Left: Mobile menu + Date/Time */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="lg:hidden h-9 w-9 flex-shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-medium truncate">{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-medium tabular-nums">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Sound alerts toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const next = !soundMuted;
            setSoundMuted(next);
            setLocalSoundMuted(next);
            if (!next) {
              playNotificationSound('registration');
            }
          }}
          className="h-8 w-8 sm:h-9 sm:w-9"
          title={soundMuted ? 'Unmute Audio & Voice Alerts' : 'Mute Audio & Voice Alerts'}
        >
          {soundMuted ? (
            <VolumeX className="h-4 w-4 text-slate-400" />
          ) : (
            <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-9 sm:w-9">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold">Notifications</p>
              {notifications.length > 0 && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={markAllRead} title="Mark all read">
                    <Check className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearAll} title="Clear all">
                    <Trash2 className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                </div>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto pt-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Bell className="h-8 w-8 text-slate-300" />
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="cursor-pointer flex flex-col items-start gap-1 p-3 mx-1 my-0.5 rounded-md border-b border-slate-50 dark:border-slate-800 last:border-0 outline-none"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-0.5 p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 shrink-0">
                        {notifIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm truncate pr-2 ${!notification.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              {!sidebarCollapsed && (
                <div className="text-left hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.isMainAdmin ? 'Super Admin' : (user?.role?.name || 'Staff')}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-lg">
            <div className="px-2 py-2 border-b">
              <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'admin@maat.in'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
