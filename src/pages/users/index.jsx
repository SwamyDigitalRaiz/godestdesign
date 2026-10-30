import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useUserStore } from '../../store/userStore';
import { useToast } from '../../components/ui/toaster';
import { getAdminSocket } from '../../services/socketService';
import {
  Search,
  Filter,
  Eye,
  Ban,
  UserX,
  Users,
  CheckCircle,
  XCircle,
  Car,
  Bike,
  Shield,
  Phone,
  Mail,
  MapPin,
  Wallet,
  ArrowRight,
  Sparkles,
  Smartphone,
  Calendar,
  Clock,
} from 'lucide-react';

export function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, pagination, stats, loading, fetchUsers, toggleBlockUser, deleteUser, updateUserPresence } = useUserStore();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  // Real-time socket listener for user presence & live location
  useEffect(() => {
    const socket = getAdminSocket();
    const handlePresence = (data) => {
      if (data) {
        updateUserPresence(data);
      }
    };

    socket.on('user:presence:update', handlePresence);
    socket.on('admin:user:location', handlePresence);

    return () => {
      socket.off('user:presence:update', handlePresence);
      socket.off('admin:user:location', handlePresence);
    };
  }, [updateUserPresence]);

  // Fetch users from backend with filters
  const loadUsers = useCallback(() => {
    fetchUsers({
      page,
      limit: 20,
      search: search.trim(),
      status: statusFilter !== 'all' ? statusFilter : undefined,
      city: cityFilter !== 'all' ? cityFilter : undefined,
    });
  }, [fetchUsers, page, search, statusFilter, cityFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // For display, use server-side filtered list
  const filteredUsers = users;

  const activeCount = stats?.activeCount ?? 0;
  const suspendedCount = stats?.suspendedCount ?? 0;
  const totalRidesSum = stats?.totalRidesSum ?? 0;

  const handleToggleBlock = async (user) => {
    const id = user._id || user.id || user.customId;
    const newStatus = await toggleBlockUser(id);
    toast({
      title: newStatus === 'Suspended' ? 'User Suspended' : 'User Activated',
      description: `${user.name} is now ${newStatus === 'Suspended' ? 'suspended' : 'active'}.`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id || deleteTarget.customId;
    await deleteUser(id);
    toast({
      title: 'User Deleted',
      description: `${deleteTarget.name} has been removed.`,
    });
    setDeleteTarget(null);
  };

  const cities = Array.from(new Set(users.map((u) => u.city))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Passenger Users
            </h1>
            <Badge variant="outline" className="text-xs font-normal border-primary/40 text-primary">
              {users.length} Users
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage registered passenger profiles, monitor mobility ride volume, wallet balances, and user statuses.
          </p>
        </div>
      </div>

      {/* ── 4 Top KPI Stat Cards (SoloHearts Pattern) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Passengers</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Riders</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Suspended Accounts</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {suspendedCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Ban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Rides Completed</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">
                {totalRidesSum}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter and Search ────────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, phone, email, ID..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <div className="flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                {['all', 'active', 'suspended'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded capitalize transition-colors cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── User Table ───────────────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Current Location</th>
                <th className="py-3 px-4">App Version</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4">Last Seen</th>
                <th className="py-3 px-4">Rides</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      No passengers found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your search query or city filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/profile/${user.id}`)}
                  >
                    {/* User ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {user.id}
                    </td>

                    {/* Passenger Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-9 w-9 rounded-full bg-primary/20 text-slate-950 font-black text-xs flex items-center justify-center border border-primary/40 shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          {user.isOnline && (
                            <span
                              title="Online right now"
                              className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {user.name || 'New Rider'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              {user.tier || 'Standard'}
                            </span>
                            <span className="text-[10px] text-slate-400">• ★ {user.rating || 5.0}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        <p className="font-mono text-slate-700 dark:text-slate-300">{user.phone}</p>
                        <p className="text-slate-400 text-[11px]">{user.email || '—'}</p>
                      </div>
                    </td>

                    {/* Current Location */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs max-w-[170px]">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate" title={user.location || user.city || 'Hyderabad, Telangana'}>
                            {user.location || user.city || 'Hyderabad, Telangana'}
                          </span>
                        </div>
                        {user.currentLocation?.coordinates && (
                          <span className="text-[10px] font-mono text-slate-400 pl-5 block">
                            {user.currentLocation.coordinates[1]?.toFixed(3)}°N, {user.currentLocation.coordinates[0]?.toFixed(3)}°E
                          </span>
                        )}
                      </div>
                    </td>

                    {/* App Version */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        <Smartphone className="h-3 w-3 text-slate-400" />
                        v{user.appVersion || '1.0.0'}
                        {user.appBuildNumber ? <span className="text-slate-400">({user.appBuildNumber})</span> : ''}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(user.joinDate || user.createdAt || Date.now()).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Last Seen */}
                    <td className="py-3.5 px-4">
                      {user.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <div className="text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium block">
                            {new Date(user.lastSeen || user.lastActive || user.updatedAt || user.createdAt || Date.now()).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(user.lastSeen || user.lastActive || user.updatedAt || user.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Rides */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {user.totalRides || 0}
                      </span>
                      <p className="text-[10px] text-slate-400">rides</p>
                    </td>

                    {/* Wallet Balance */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        ₹{user.walletBalance?.toLocaleString('en-IN') || 0}
                      </span>
                      {user.promoBalance > 0 && (
                        <p className="text-[10px] text-slate-400">+₹{user.promoBalance} promo</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* View Profile (SoloHearts style Eye action) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                          onClick={() => navigate(`/users/profile/${user.id}`)}
                          title="View SoloHearts-style User Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Block / Unblock */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            user.status === 'Suspended'
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                          onClick={() => handleToggleBlock(user)}
                          title={user.status === 'Suspended' ? 'Unblock User' : 'Suspend Account'}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setDeleteTarget(user)}
                          title="Delete User Account"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Confirm Delete Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete User: ${deleteTarget?.name}`}
        description="Are you sure you want to permanently delete this user account? All their ride history and wallet records will be archived."
        confirmText="Delete Account"
        variant="danger"
      />
    </div>
  );
}
