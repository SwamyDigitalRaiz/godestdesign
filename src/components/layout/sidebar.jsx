import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Bike,
  Bus,
  Wallet,
  MapPin,
  Settings,
  Menu,
  X,
  ChevronRight,
  Shield,
  Bell,
  BarChart3,
  Briefcase,
  Headphones,
  Star,
  Ticket,
  AlertTriangle,
  Map,
  Truck,
  UserCheck,
  CreditCard,
  FileText,
  Wrench,
  Building2,
  Zap,
  SlidersHorizontal,
  Sparkles,
  Compass,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'dashboard' },

  // ── Users & Drivers ──────────────────────────────────────
  { type: 'section', label: 'People' },
  { icon: Users, label: 'Users', path: '/users', permission: 'users' },
  { icon: Car, label: 'Drivers', path: '/drivers', permission: 'drivers' },
  { icon: Building2, label: 'Fleet Operators', path: '/vendors', permission: 'vendors' },
  { icon: UserCheck, label: 'KYC Verifications', path: '/kyc', permission: 'kyc' },

  // ── Bike Auto ─────────────────────────────────────────────
  { type: 'section', label: 'Bike Auto' },
  {
    icon: Bike,
    label: 'Vehicles',
    path: '/bike-auto/vehicles',
    permission: 'rapid-bookings',
  },
  { icon: Sparkles, label: 'Amenities', path: '/amenities', permission: 'rapid-bookings' },
  { icon: Compass, label: 'Trip Searches', path: '/trip-searches', permission: 'rapid-bookings' },
  { icon: Zap, label: 'Bookings', path: '/rapid-bookings', permission: 'rapid-bookings' },
  {
    icon: MapPin,
    label: 'Zone',
    path: '/zone/list',
    permission: 'rapid-bookings',
    children: [
      { label: 'Zone List', path: '/zone/list', permission: 'rapid-bookings' },
      { label: 'Add Zone', path: '/zone/add', permission: 'rapid-bookings' },
    ],
  },

  // ── Car Pool (Car Sharing) ─────────────────────────────────
  { type: 'section', label: 'Car Pool' },
  {
    icon: Car,
    label: 'Pricing & Rules',
    path: '/carpool/pricing',
    permission: 'rapid-bookings',
  },
  {
    icon: Zap,
    label: 'Carpool Bookings',
    path: '/carpool/bookings',
    permission: 'rapid-bookings',
  },
  {
    icon: Compass,
    label: 'Trip Searches',
    path: '/carpool/trip-searches',
    permission: 'rapid-bookings',
  },
  {
    icon: Sparkles,
    label: 'Amenities',
    path: '/carpool/amenities',
    permission: 'rapid-bookings',
  },

  // ── Rides ────────────────────────────────────────────────
  { type: 'section', label: 'Other Rides' },
  {
    icon: Bus,
    label: 'Bus Bookings',
    path: '/bus-bookings',
    permission: 'bus-bookings',
    children: [
      { label: 'All Bookings', path: '/bus-bookings/all', permission: 'bus-bookings' },
      { label: 'API Providers', path: '/bus-bookings/providers', permission: 'bus-bookings' },
    ],
  },
  { icon: Map, label: 'Live Tracking', path: '/live-tracking', permission: 'live-tracking' },

  // ── Finance ───────────────────────────────────────────────
  { type: 'section', label: 'Finance' },
  { icon: SlidersHorizontal, label: 'Payment Settings', path: '/payment-settings', permission: 'payments' },
  { icon: CreditCard, label: 'Wallet & Promo', path: '/wallet-promo', permission: 'wallet-promo' },
  { icon: Ticket, label: 'Coupons', path: '/coupons', permission: 'coupons' },

  // ── Platform ──────────────────────────────────────────────
  { type: 'section', label: 'Platform' },
  { icon: Bell, label: 'Notifications', path: '/notifications', permission: 'notifications' },
  { icon: Headphones, label: 'Customer Support', path: '/support', permission: 'support' },
  { icon: Star, label: 'Reviews & Ratings', path: '/reviews', permission: 'reviews' },
  { icon: AlertTriangle, label: 'Reports & Disputes', path: '/reports', permission: 'reports' },

  // ── Analytics ─────────────────────────────────────────────
  { type: 'section', label: 'Analytics' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', permission: 'analytics' },
  { icon: FileText, label: 'Logs', path: '/logs', permission: 'logs' },

  // ── Admin ─────────────────────────────────────────────────
  { type: 'section', label: 'Admin' },
  { icon: Shield, label: 'Roles & Permissions', path: '/roles', permission: 'roles' },
  { icon: Briefcase, label: 'Staff Management', path: '/staff', permission: 'staff' },
  { icon: Settings, label: 'App Settings', path: '/settings', permission: 'settings' },
];

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState([]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => location.pathname === child.path);
        if (hasActiveChild && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => Array.from(new Set([...prev, item.label])));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (!user) return false;
    if (user.isMainAdmin || user.role?.name === 'Super Admin' || user.role?.permissions?.all === true) return true;
    const userPermissions = user.role?.permissions || {};
    if (Array.isArray(permission)) {
      return permission.some((p) => {
        const pActions = userPermissions[p] || {};
        return Object.values(pActions).some((val) => val === true);
      });
    }
    const actions = userPermissions[permission] || {};
    return Object.values(actions).some((val) => val === true);
  };

  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.type === 'section') return item;
      if (item.children) {
        const filteredChildren = item.children.filter((child) => hasPermission(child.permission));
        if (filteredChildren.length > 0) return { ...item, children: filteredChildren };
        return null;
      }
      return hasPermission(item.permission) ? item : null;
    })
    .filter(Boolean);

  const toggleExpanded = (label) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path) => {
    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    const targetPath = path.replace(/\/$/, '') || '/';
    if (targetPath === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    if (targetPath === '/settings') return currentPath === '/settings';
    return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
  };

  const isChildActive = (childPath, allChildren = []) => {
    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    const targetPath = childPath.replace(/\/$/, '') || '/';
    if (currentPath === targetPath) return true;

    // Match sub-paths only if no other sibling child is a more specific match
    if (currentPath.startsWith(targetPath + '/')) {
      const hasMoreSpecificSibling = allChildren.some((other) => {
        const otherPath = other.path.replace(/\/$/, '') || '/';
        return (
          otherPath !== targetPath &&
          otherPath.length > targetPath.length &&
          (currentPath === otherPath || currentPath.startsWith(otherPath + '/'))
        );
      });
      return !hasMoreSpecificSibling;
    }
    return false;
  };

  const desktopNavRef = useRef(null);
  const mobileNavRef = useRef(null);

  const handleNavScroll = (e) => {
    sessionStorage.setItem('godest_admin_sidebar_scroll', String(e.currentTarget.scrollTop));
  };

  useLayoutEffect(() => {
    const saved = sessionStorage.getItem('godest_admin_sidebar_scroll');
    if (saved !== null) {
      const top = Number(saved);
      if (desktopNavRef.current) desktopNavRef.current.scrollTop = top;
      if (mobileNavRef.current) mobileNavRef.current.scrollTop = top;
    }
  }, [location.pathname]);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && onMobileClose) onMobileClose();
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Logo Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/30">
            <span className="text-primary-foreground text-sm font-black tracking-tight">G</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight tracking-wide flex items-center gap-1.5">
                Go Dest
                <span className="h-1.5 w-1.5 rounded-full bg-secondary inline-block" />
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Super Admin</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onMobileClose || onToggle}
            className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 lg:flex hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 hidden"
          />
        )}
      </div>

      {/* Nav */}
      <nav
        ref={isMobile ? mobileNavRef : desktopNavRef}
        onScroll={handleNavScroll}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin"
      >
        <ul className="space-y-0.5">
          {filteredMenuItems.map((item, idx) => {
            if (item.type === 'section') {
              if (collapsed) return null;
              return (
                <li key={`section-${idx}`} className="pt-3 pb-1 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                    {item.label}
                  </span>
                </li>
              );
            }

            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.label);
            const isParentActive = hasChildren
              ? item.children.some((child) => isChildActive(child.path, item.children))
              : isActive(item.path);
            const active = isParentActive;

            return (
              <li key={item.path || item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 relative',
                        isParentActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn('h-4 w-4 flex-shrink-0', isParentActive && 'text-primary')} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          <ChevronRight
                            className={cn('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-90')}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="mt-1 ml-4 pl-3 border-l-2 border-primary/40 space-y-0.5">
                        {item.children.map((child) => {
                          const childActive = isChildActive(child.path, item.children);
                          return (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                onClick={handleLinkClick}
                                className={cn(
                                  'flex items-center rounded-md px-2 py-1.5 text-sm transition-colors',
                                  childActive
                                    ? 'text-primary font-semibold bg-primary/10'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-primary-foreground' : '')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Super Admin'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'admin@godest.in'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 hidden lg:block',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {renderSidebarContent(false)}
        {/* Collapse toggle tab */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[72px] h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', collapsed ? '' : 'rotate-180')} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:hidden w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {renderSidebarContent(true)}
      </div>
    </>
  );
}
