import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

export const ROUTE_PERMISSIONS = [
  { path: '/dashboard', permission: 'dashboard' },
  { path: '/users', permission: 'users' },
  { path: '/drivers', permission: 'drivers' },
  { path: '/vendors', permission: 'vendors' },
  { path: '/kyc', permission: 'kyc' },
  { path: '/bike-auto/vehicles', permission: 'vehicles' },
  { path: '/amenities', permission: 'vehicles' },
  { path: '/rapid-bookings', permission: 'rapid-bookings' },
  { path: '/carpool/pricing', permission: 'rapid-bookings' },
  { path: '/carpool/bookings', permission: 'rapid-bookings' },
  { path: '/carpool/trip-searches', permission: 'rapid-bookings' },
  { path: '/carpool/amenities', permission: 'rapid-bookings' },
  { path: '/zone/list', permission: 'zone' },
  { path: '/bus-bookings/all', permission: 'bus-bookings' },
  { path: '/live-tracking', permission: 'live-tracking' },
  { path: '/payment-settings', permission: 'payments' },
  { path: '/wallet-promo', permission: 'wallet-promo' },
  { path: '/coupons', permission: 'coupons' },
  { path: '/notifications', permission: 'notifications' },
  { path: '/support', permission: 'support' },
  { path: '/reviews', permission: 'reviews' },
  { path: '/reports', permission: 'reports' },
  { path: '/analytics', permission: 'analytics' },
  { path: '/logs', permission: 'logs' },
  { path: '/roles', permission: 'roles' },
  { path: '/staff', permission: 'staff' },
  { path: '/settings', permission: 'settings' },
];

export function hasUserPermission(user, permission) {
  if (!user) return false;

  // Root Admin / Super Admin bypass (same as solohearts)
  if (
    user.isMainAdmin ||
    user.role?.name === 'Super Admin' ||
    user.role?.permissions?.all === true
  ) {
    return true;
  }

  const userPermissions = user.role?.permissions || {};

  if (Array.isArray(permission)) {
    return permission.some((p) => {
      const pActions = userPermissions[p] || {};
      return Object.values(pActions).some((val) => val === true);
    });
  }

  const actions = userPermissions[permission] || {};
  return Object.values(actions).some((val) => val === true);
}

export function getFirstAccessibleRoute(user) {
  if (!user) return '/login';

  if (
    user.isMainAdmin ||
    user.role?.name === 'Super Admin' ||
    user.role?.permissions?.all === true
  ) {
    return '/dashboard';
  }

  for (const item of ROUTE_PERMISSIONS) {
    if (hasUserPermission(user, item.permission)) {
      return item.path;
    }
  }

  return '/login';
}

export function HomeRedirect() {
  const { user } = useAuthStore();
  const targetRoute = getFirstAccessibleRoute(user);
  return <Navigate to={targetRoute} replace />;
}

export function PermissionGuard({ permission, children }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const hasAccess = hasUserPermission(user, permission);

  if (!hasAccess) {
    const fallbackRoute = getFirstAccessibleRoute(user);

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full text-center p-6 border-amber-200 dark:border-amber-900/50 shadow-sm bg-gradient-to-b from-amber-50/50 to-transparent">
          <CardContent className="pt-2 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Access Restricted
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your assigned role does not have permission to view or manage this section.
                Please contact a Super Admin if you need access.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Go Back
              </Button>
              {fallbackRoute && fallbackRoute !== '/login' && (
                <Button
                  size="sm"
                  onClick={() => navigate(fallbackRoute)}
                  className="bg-primary text-slate-950 hover:bg-primary/90"
                >
                  My Workspace
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
