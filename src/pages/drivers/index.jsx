import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useDriverStore } from '../../store/driverStore';
import { useToast } from '../../components/ui/toaster';
import { getAdminSocket } from '../../services/socketService';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Bike,
  ShieldCheck,
  Phone,
  Plus,
  Car,
  Building2,
  FileText,
  CreditCard,
  MapPin,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Check,
  X,
  ExternalLink,
  Trash2,
  ToggleLeft,
  Smartphone,
  Sparkles,
  Edit,
  Calendar,
} from 'lucide-react';

export function DriversPage() {
  const navigate = useNavigate();
  const { drivers, stats, loading, fetchDrivers, approveDriver, rejectDriver, toggleDriverStatus, deleteDriver, updateDriverPresence } = useDriverStore();
  const { toast } = useToast();

  const [mainTab, setMainTab] = useState('requests'); // 'requests' | 'all' | 'online' | 'approved' | 'rejected'
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Rejection modal state
  const [rejectingDriver, setRejectingDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState('Driving license expired or illegible');
  const [customReason, setCustomReason] = useState('');

  // Real-time socket presence for drivers (same like SoloHearts)
  useEffect(() => {
    const socket = getAdminSocket();
    const handlePresence = (data) => {
      if (data) {
        updateDriverPresence(data);
      }
    };

    socket.on('driver:presence:update', handlePresence);
    socket.on('admin:driver:location', handlePresence);

    return () => {
      socket.off('driver:presence:update', handlePresence);
      socket.off('admin:driver:location', handlePresence);
    };
  }, [updateDriverPresence]);

  // Fetch drivers from backend when filters or tab changes
  const loadDrivers = useCallback(() => {
    const params = { limit: 50, search: search.trim() };
    if (mainTab === 'requests') params.kycStatus = 'pending';
    else if (mainTab === 'approved') params.kycStatus = 'approved';
    else if (mainTab === 'rejected') params.kycStatus = 'rejected';
    else if (mainTab === 'online') params.dutyStatus = 'online';

    if (vehicleFilter !== 'all') params.vehicleType = vehicleFilter;
    if (vendorFilter !== 'all') params.source = vendorFilter;

    fetchDrivers(params);
  }, [fetchDrivers, mainTab, search, vehicleFilter, vendorFilter]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  // Counts — use backend stats where available
  const pendingRequests = drivers.filter((d) => d.kycStatus === 'pending' || d.kycStatus === 'in_review');
  const approvedDrivers = drivers.filter((d) => d.kycStatus === 'approved');
  const rejectedDrivers = drivers.filter((d) => d.kycStatus === 'rejected');
  const onlineDrivers = drivers.filter((d) => d.dutyStatus === 'online');

  // For current tab, display already filtered from server
  const filteredDrivers = drivers;

  const handleApprove = async (driver) => {
    const id = driver._id || driver.id || driver.customId;
    await approveDriver(id);
    toast({
      title: 'Driver Approved & Activated',
      description: `${driver.name || driver.firstName} has been officially approved. Their vehicle is now authorized on the platform.`,
      variant: 'success',
    });
    if (selectedDriver?._id === id || selectedDriver?.id === id) {
      setSelectedDriver((prev) => ({ ...prev, kycStatus: 'approved', status: true, dutyStatus: 'online' }));
    }
  };

  const handleOpenReject = (driver) => {
    setRejectingDriver(driver);
    setRejectReason('Driving license expired or illegible');
    setCustomReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingDriver) return;
    const finalReason = rejectReason === 'Other' ? customReason.trim() || 'Document verification failed' : rejectReason;
    const id = rejectingDriver._id || rejectingDriver.id || rejectingDriver.customId;
    
    await rejectDriver(id, finalReason);
    toast({
      title: 'Driver Onboarding Rejected',
      description: `Request for ${rejectingDriver.name || rejectingDriver.firstName} has been rejected. Reason logged: ${finalReason}.`,
      variant: 'destructive',
    });

    if (selectedDriver?._id === id || selectedDriver?.id === id) {
      setSelectedDriver((prev) => ({ ...prev, kycStatus: 'rejected', status: false, rejectionReason: finalReason }));
    }
    setRejectingDriver(null);
  };

  const handleDelete = async (driver) => {
    const id = driver._id || driver.id || driver.customId;
    if (confirm(`Are you sure you want to delete ${driver.name || driver.firstName}? This action cannot be undone.`)) {
      await deleteDriver(id);
      toast({
        title: 'Driver Removed',
        description: `${driver.name || driver.firstName} has been removed from the platform.`,
      });
      if (selectedDriver?._id === id || selectedDriver?.id === id) setSelectedDriver(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>People</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Drivers</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Drivers & Fleet Management
            </h1>
            {pendingRequests.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                {pendingRequests.length} Registration Request{pendingRequests.length > 1 ? 's' : ''} Pending
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review driver registration & onboarding requests, verify KYC documents, and monitor active fleet operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/bike-auto/drivers/add">
            <Button size="sm" className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Onboard Direct Driver
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          onClick={() => setMainTab('all')}
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            mainTab === 'all' ? 'ring-2 ring-primary/40 bg-primary/5' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Fleet</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{drivers.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Registered Drivers</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setMainTab('requests')}
          className={`cursor-pointer transition-all hover:border-amber-500/50 ${
            mainTab === 'requests' ? 'ring-2 ring-amber-500/50 bg-amber-500/5' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Registration Requests</p>
                {pendingRequests.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingRequests.length}</h3>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Awaiting Approval</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setMainTab('online')}
          className={`cursor-pointer transition-all hover:border-emerald-500/50 ${
            mainTab === 'online' ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active On Duty</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{onlineDrivers.length}</h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                Live on Road
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setMainTab('approved')}
          className={`cursor-pointer transition-all hover:border-purple-500/50 ${
            mainTab === 'approved' ? 'ring-2 ring-purple-500/50 bg-purple-500/5' : ''
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">KYC Verified</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{approvedDrivers.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Compliant Drivers</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setMainTab('requests')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            mainTab === 'requests'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Registration Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              pendingRequests.length > 0
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('all')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            mainTab === 'all'
              ? 'border-primary text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Car className="h-4 w-4" />
          <span>All Drivers</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {drivers.length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('online')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            mainTab === 'online'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>On Duty</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            {onlineDrivers.length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('approved')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            mainTab === 'approved'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Approved</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            {approvedDrivers.length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('rejected')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            mainTab === 'rejected'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <XCircle className="h-4 w-4" />
          <span>Rejected</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            {rejectedDrivers.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by driver name, phone, vehicle plate, vendor..."
                className="pl-9 bg-slate-50/50 dark:bg-slate-900/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Vehicle Type Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'auto', label: 'Auto' },
                  { id: 'bike', label: 'Bike' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setVehicleFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      vehicleFilter === tab.id
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Vendor Affiliation Filter */}
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="all">All Sources</option>
                <option value="admin">Created by Admin</option>
                <option value="fleet_operator">Fleet Operator</option>
                <option value="self_registered">Self-Registered</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION: FULL DRIVERS TABLE (FOR ALL TABS) ──────────────── */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Driver Profile</th>
                  <th className="py-3.5 px-4">Vehicle Specs</th>
                  <th className="py-3.5 px-4">Current Location</th>
                  <th className="py-3.5 px-4">App Version</th>
                  <th className="py-3.5 px-4">Join Date</th>
                  <th className="py-3.5 px-4">Last Seen</th>
                  <th className="py-3.5 px-4">Operator / Source</th>
                  <th className="py-3.5 px-4">Duty Status</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4">Wallet</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-500">
                      No drivers match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((drv) => (
                    <tr
                      key={drv.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Driver info */}
                      <td className="py-3.5 px-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/drivers/profile/${drv._id || drv.id || drv.customId}`)}
                        >
                          <img
                            src={
                              drv.profileImage ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'
                            }
                            alt={drv.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:border-amber-400 transition-colors"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {drv.name || `${drv.firstName} ${drv.lastName}`}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {drv.primaryPhone || drv.phone}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">{drv.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                            {drv.vehicleType?.includes('Auto') ? (
                              <Car className="h-4 w-4" />
                            ) : drv.vehicleType?.includes('Bike') ? (
                              <Bike className="h-4 w-4" />
                            ) : (
                              <Car className="h-4 w-4" />
                            )}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                              {drv.vehicleType || 'Auto'}
                            </p>
                            <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                              {drv.vehicleNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Current Location */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs max-w-[170px]">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="truncate" title={drv.location || drv.zone || 'Cyberabad, Hyderabad'}>
                              {drv.location || drv.zone || 'Cyberabad, Hyderabad'}
                            </span>
                          </div>
                          {drv.liveLocation?.coordinates && (
                            <span className="text-[10px] font-mono text-slate-400 pl-5 block">
                              {drv.liveLocation.coordinates[1]?.toFixed(3)}°N, {drv.liveLocation.coordinates[0]?.toFixed(3)}°E
                            </span>
                          )}
                        </div>
                      </td>

                      {/* App Version */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          <Smartphone className="h-3 w-3 text-slate-400" />
                          v{drv.appVersion || '1.0.0'}
                          {drv.appBuildNumber ? <span className="text-slate-400">({drv.appBuildNumber})</span> : ''}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(drv.joinDate || drv.createdAt || Date.now()).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Last Seen (Real-time Status) */}
                      <td className="py-3.5 px-4">
                        {drv.isOnline || drv.dutyStatus === 'online' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <div className="text-xs">
                            <span className="text-slate-700 dark:text-slate-300 font-medium block">
                              {new Date(drv.lastSeen || drv.updatedAt || drv.createdAt || Date.now()).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(drv.lastSeen || drv.updatedAt || drv.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Operator / Source */}
                      <td className="py-3.5 px-4">
                        {drv.source === 'admin' ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              Created by Admin
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Admin Panel</p>
                          </div>
                        ) : (drv.source === 'fleet_operator' || drv.source === 'vendor' || drv.vendorId) ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              Fleet Operator
                            </span>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[130px]">{(drv.vendor && drv.vendor !== 'Direct Partner') ? drv.vendor : (drv.vendorId?.name || drv.createdByName || 'Fleet Partner')}</p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Smartphone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              Self-Registered
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Mobile App</p>
                          </div>
                        )}
                      </td>

                      {/* Rating & Trips */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {drv.rating || '5.0'}
                        </div>
                        <p className="text-xs text-slate-400">{drv.trips ?? 0} rides completed</p>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {drv.walletBalance || '₹0'}
                        </span>
                      </td>

                      {/* Duty Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            drv.dutyStatus === 'online'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : drv.dutyStatus === 'busy'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              drv.dutyStatus === 'online'
                                ? 'bg-emerald-500 animate-pulse'
                                : drv.dutyStatus === 'busy'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {drv.dutyStatus || 'offline'}
                        </span>
                      </td>

                      {/* KYC Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            drv.kycStatus === 'approved'
                              ? 'success'
                              : drv.kycStatus === 'pending'
                              ? 'warning'
                              : 'destructive'
                          }
                          className="capitalize text-xs"
                        >
                          {drv.kycStatus || 'pending'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-pointer"
                            onClick={() => navigate(`/drivers/profile/${drv._id || drv.id || drv.customId}`)}
                            title="View Driver Profile"
                          >
                            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-pointer text-slate-500 hover:text-primary"
                            onClick={() => navigate(`/bike-auto/drivers/edit/${drv._id || drv.id || drv.customId}`, { state: { driver: drv } })}
                            title="Edit Driver Profile"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {drv.kycStatus === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleApprove(drv)}
                                title="Approve Driver"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleOpenReject(drv)}
                                title="Reject Request"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => handleDelete(drv)}
                            title="Delete Driver"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* ── DRIVER KYC DOSSIER MODAL ─────────────────────────────────── */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-slate-200 dark:border-slate-800 animate-scale-in my-auto">
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedDriver.profileImage ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
                    }
                    alt={selectedDriver.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {selectedDriver.name || `${selectedDriver.firstName} ${selectedDriver.lastName}`}
                      </h3>
                      <Badge
                        variant={
                          selectedDriver.kycStatus === 'approved'
                            ? 'success'
                            : selectedDriver.kycStatus === 'pending'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="capitalize text-xs"
                      >
                        {selectedDriver.kycStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Driver ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{selectedDriver.id}</span>
                      {selectedDriver.source === 'admin'
                        ? ' • Origin: Created by Admin'
                        : (selectedDriver.source === 'fleet_operator' || selectedDriver.source === 'vendor' || selectedDriver.vendorId)
                        ? ` • Submitting Fleet: ${selectedDriver.vendor || 'Fleet Operator'}`
                        : ' • Origin: Self-Registered (Mobile App)'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Personal Info Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Personal & Contact Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Primary Phone</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.primaryPhone || selectedDriver.phone}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Email Address</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                      {selectedDriver.email || 'Not provided'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Operating Zone</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.zone || 'Cyberabad / Hitec City'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-3">
                    <p className="text-slate-400 font-medium">Residential Address</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.address || 'Address details on file'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Vehicle Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Category</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.vehicleType || 'Auto'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Plate Number</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.vehicleNumber}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Capacity</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.passengerCapacity || (selectedDriver.vehicleType?.includes('Bike') ? 1 : 3)} Pax
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Color</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedDriver.vehicleColor || 'Yellow & Black'}
                    </p>
                  </div>
                </div>
              </div>

              {/* KYC Compliance & Verification */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  KYC & Legal Documentation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 font-medium flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                        Driving License
                      </p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {selectedDriver.drivingLicenseNumber || 'DL-PENDING'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      Verified
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-amber-500" />
                        Vehicle Registration (RC)
                      </p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {selectedDriver.rcNumber || selectedDriver.vehicleNumber}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      Active
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 font-medium flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Commercial Insurance
                      </p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {selectedDriver.insuranceNumber || 'POL-ICICI-881920'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      Valid
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 font-medium flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                        Bank Settlement Account
                      </p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {selectedDriver.bankName || 'HDFC Bank'} • {selectedDriver.ibanNumber?.slice(-4) || '9012'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
                      KYC Linked
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedDriver(null)}>
                  Close
                </Button>

                <div className="flex items-center gap-2">
                  {selectedDriver.kycStatus === 'pending' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleOpenReject(selectedDriver)}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Reject Request
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                        onClick={() => handleApprove(selectedDriver)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Approve & Authorize Driver
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDriverStatus(selectedDriver.id)}
                      className="text-xs"
                    >
                      {selectedDriver.status ? 'Deactivate Driver' : 'Activate Driver'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── REJECTION REASON MODAL ──────────────────────────────────── */}
      {rejectingDriver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 animate-scale-in">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Reject Driver Onboarding
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {rejectingDriver.name || rejectingDriver.firstName} ({rejectingDriver.id})
                  </p>
                </div>
                <button
                  onClick={() => setRejectingDriver(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Reason for Rejection:
                </label>
                {[
                  'Driving license expired or illegible',
                  'Vehicle registration (RC) number mismatch',
                  'Commercial insurance expired or invalid',
                  'Driver background check failed',
                  'Vehicle age exceeds platform threshold (>8 years)',
                  'Other',
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={rejectReason === reason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{reason}</span>
                  </label>
                ))}

                {rejectReason === 'Other' && (
                  <textarea
                    rows={3}
                    placeholder="Enter specific rejection reason to inform the fleet operator..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setRejectingDriver(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  onClick={handleConfirmReject}
                >
                  Confirm Rejection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
