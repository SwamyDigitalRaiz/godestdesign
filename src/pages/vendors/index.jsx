import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useFleetOperatorStore } from '../../store/fleetOperatorStore';
import { useToast } from '../../components/ui/toaster';
import {
  Building2,
  Users,
  Search,
  Plus,
  Eye,
  Percent,
  Phone,
  ShieldCheck,
  CheckCircle,
  Car,
  Bike,
  KeyRound,
  Copy,
  Check,
  Lock,
  Mail,
  RefreshCw,
  Power,
  Trash2,
  Edit3,
  Sparkles,
  AlertCircle,
  Landmark,
  UserPlus,
  UserMinus,
  Star,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function VendorsPage() {
  const {
    operators,
    stats,
    loading,
    currentOperator,
    availableDrivers,
    fetchOperators,
    fetchOperatorById,
    addOperator,
    updateOperator,
    toggleOperatorStatus,
    deleteOperator,
    resetOperatorPassword,
    fetchAvailableDrivers,
    assignDriverToOperator,
    unassignDriverFromOperator,
  } = useFleetOperatorStore();

  const { toast } = useToast();

  useEffect(() => {
    fetchOperators({ limit: 50 });
  }, [fetchOperators]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [operatorToEdit, setOperatorToEdit] = useState(null);
  const [viewModalOperatorId, setViewModalOperatorId] = useState(null);
  const [credentialsModalOperator, setCredentialsModalOperator] = useState(null);
  const [deleteConfirmOperator, setDeleteConfirmOperator] = useState(null);
  const [copied, setCopied] = useState(false);

  // View modal tab
  const [viewActiveTab, setViewActiveTab] = useState('overview'); // 'overview' | 'drivers'
  const [selectedDriverToAssign, setSelectedDriverToAssign] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Add Form State
  const initialFormState = {
    name: '',
    manager: '',
    phone: '',
    email: '',
    city: 'Hyderabad',
    hub: '',
    fleetType: 'Mixed Fleet (Auto & Bike)',
    autoCount: 15,
    bikeCount: 10,
    commissionRate: 8.5,
    password: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
    payoutFrequency: 'Daily Automated (Midnight)',
  };

  const [form, setForm] = useState(initialFormState);
  const [activeStep, setActiveStep] = useState(1); // 1: Company, 2: Owner & Auth, 3: Commercials

  // Edit Form State
  const [editForm, setEditForm] = useState(initialFormState);

  // Auto-generate temporary password helper
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const pwd = `MAAT@Fleet#${rand}`;
    setForm((prev) => ({ ...prev, password: pwd }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    generateRandomPassword();
    setActiveStep(1);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (op) => {
    setOperatorToEdit(op);
    setEditForm({
      name: op.name || '',
      manager: op.manager || '',
      phone: op.phone || '',
      email: op.email || '',
      city: op.city || 'Hyderabad',
      hub: op.hub || '',
      fleetType: op.fleetType || 'Mixed Fleet (Auto & Bike)',
      autoCount: op.autoCount || 0,
      bikeCount: op.bikeCount || 0,
      commissionRate: op.commissionRate || 8.5,
      password: '',
      accountName: op.bankDetails?.accountName || '',
      accountNumber: op.bankDetails?.accountNumber || '',
      ifsc: op.bankDetails?.ifsc || '',
      bankName: op.bankDetails?.bankName || '',
      upiId: op.bankDetails?.upiId || '',
      payoutFrequency: op.bankDetails?.payoutFrequency || 'Daily Automated (Midnight)',
    });
    setIsEditModalOpen(true);
  };

  // Open Details Modal
  const handleOpenView = async (op) => {
    setViewModalOperatorId(op.id || op._id);
    setViewActiveTab('overview');
    await fetchOperatorById(op.id || op._id);
    await fetchAvailableDrivers();
  };

  // Submit Add Fleet Operator
  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.manager.trim() || !form.phone.trim() || !form.email.trim()) {
      toast({
        title: 'Required Information Missing',
        description: 'Please fill in Company Name, Manager Name, Phone, and Email.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      ...form,
      bankDetails: {
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        bankName: form.bankName,
        upiId: form.upiId,
        payoutFrequency: form.payoutFrequency,
      },
    };

    const res = await addOperator(payload);
    if (!res || !res.success) {
      toast({
        title: 'Failed to Add Fleet Operator',
        description: res?.message || 'Something went wrong.',
        variant: 'destructive',
      });
      return;
    }

    const created = res.operator;
    setIsAddModalOpen(false);
    setForm(initialFormState);

    // Prompt credentials modal immediately so admin can copy and send to operator
    setCredentialsModalOperator(created);
    toast({
      title: 'Fleet Operator Added Successfully 🎉',
      description: `Partner account created with custom ID ${created.customId || created.id}.`,
    });
  };

  // Submit Edit Fleet Operator
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!operatorToEdit) return;

    const opId = operatorToEdit._id || operatorToEdit.id;
    const payload = {
      ...editForm,
      bankDetails: {
        accountName: editForm.accountName,
        accountNumber: editForm.accountNumber,
        ifsc: editForm.ifsc,
        bankName: editForm.bankName,
        upiId: editForm.upiId,
        payoutFrequency: editForm.payoutFrequency,
      },
    };

    const res = await updateOperator(opId, payload);
    if (!res || !res.success) {
      toast({
        title: 'Failed to Update Operator',
        description: res?.message || 'Error updating operator.',
        variant: 'destructive',
      });
      return;
    }

    setIsEditModalOpen(false);
    setOperatorToEdit(null);
    toast({
      title: 'Operator Updated Successfully',
      description: `${editForm.name} profile has been saved.`,
    });
  };

  // Delete Operator
  const handleConfirmDelete = async () => {
    if (!deleteConfirmOperator) return;
    const opId = deleteConfirmOperator._id || deleteConfirmOperator.id;
    const res = await deleteOperator(opId);
    if (res.success) {
      toast({
        title: 'Fleet Operator Deleted',
        description: `${deleteConfirmOperator.name} has been removed and attached drivers unassigned.`,
      });
      setDeleteConfirmOperator(null);
      if (viewModalOperatorId === opId) setViewModalOperatorId(null);
    } else {
      toast({
        title: 'Delete Failed',
        description: res.message || 'Could not delete operator.',
        variant: 'destructive',
      });
    }
  };

  // Assign Driver to Operator from View Modal
  const handleAssignDriver = async () => {
    if (!selectedDriverToAssign || !viewModalOperatorId) return;
    setIsAssigning(true);
    const res = await assignDriverToOperator(viewModalOperatorId, selectedDriverToAssign);
    setIsAssigning(false);
    if (res.success) {
      toast({
        title: 'Driver Attached to Fleet 🎉',
        description: res.message,
      });
      setSelectedDriverToAssign('');
      await fetchAvailableDrivers();
    } else {
      toast({
        title: 'Assignment Failed',
        description: res.message,
        variant: 'destructive',
      });
    }
  };

  // Unassign Driver from Operator
  const handleUnassignDriver = async (driverId, driverName) => {
    if (!viewModalOperatorId) return;
    const res = await unassignDriverFromOperator(viewModalOperatorId, driverId);
    if (res.success) {
      toast({
        title: 'Driver Unassigned',
        description: `${driverName || 'Driver'} is now a Direct Partner.`,
      });
      await fetchAvailableDrivers();
    } else {
      toast({
        title: 'Failed to Unassign Driver',
        description: res.message,
        variant: 'destructive',
      });
    }
  };

  // Copy Credentials Handler
  const handleCopyCredentials = (operator) => {
    if (!operator) return;
    const tempPwd = operator.portalAccess?.tempPassword || 'MAAT@Fleet#2026';
    const text = `🚗 *Go Dest Fleet Operator Portal Access*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Company:* ${operator.name}
🆔 *Operator ID:* ${operator.id || operator.customId || operator._id}
👤 *Contact:* ${operator.manager} (${operator.phone})
🌐 *Portal URL:* http://localhost:5173/login (or https://vendor.godest.in)
📧 *Login Email:* ${operator.portalAccess?.username || operator.email}
🔑 *Temporary Password:* ${tempPwd}
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Instructions:*
1. Sign in to your dedicated Vendor Fleet Portal.
2. View real-time ride demand, manage your vehicle cluster, and assign drivers.
3. For security, please update your password upon first login.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Credentials Copied! 📋',
      description: 'Vendor portal login details copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // Reset Password for Operator
  const handleResetPassword = async (operatorId) => {
    const res = await resetOperatorPassword(operatorId);
    if (res.success) {
      toast({
        title: 'New Password Generated 🔑',
        description: `Temporary password set to: ${res.tempPassword}`,
      });
    } else {
      toast({
        title: 'Failed to Reset Password',
        description: res.message || 'Could not reset password.',
        variant: 'destructive',
      });
    }
  };

  // Unique Cities for Filter
  const cities = useMemo(() => {
    const setOfCities = new Set(operators.map((op) => op.city).filter(Boolean));
    return Array.from(setOfCities);
  }, [operators]);

  // Filtered operators
  const filtered = useMemo(() => {
    return operators.filter((v) => {
      const matchSearch =
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.manager?.toLowerCase().includes(search.toLowerCase()) ||
        v.city?.toLowerCase().includes(search.toLowerCase()) ||
        v.id?.toLowerCase().includes(search.toLowerCase()) ||
        v.customId?.toLowerCase().includes(search.toLowerCase()) ||
        v.hub?.toLowerCase().includes(search.toLowerCase()) ||
        v.phone?.includes(search);

      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchCity = cityFilter === 'all' || v.city === cityFilter;
      return matchSearch && matchStatus && matchCity;
    });
  }, [operators, search, statusFilter, cityFilter]);

  // Aggregate stats
  const totalVehicles = operators.reduce((acc, curr) => acc + (curr.autoCount || 0) + (curr.bikeCount || 0), 0);
  const totalAttachedDrivers = operators.reduce((acc, curr) => acc + (curr.activeDrivers || curr.realDriverCount || 0), 0);
  const avgCommission = (
    operators.reduce((a, b) => a + (b.commissionRate || 0), 0) / (operators.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Fleet Operators & Vendors
            </h1>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0 font-medium text-xs">
              Partner Hub
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Onboard fleet vendor partners, issue vendor portal credentials, manage driver allocations, and monitor private vehicle clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOperators({ limit: 50 })}
            className="text-xs flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm text-xs h-9"
          >
            <Plus className="h-4 w-4" />
            Add Fleet Operator
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Total Fleet Operators
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.totalOperators || operators.length}
              </h3>
              <p className="text-[11px] text-purple-600/80 dark:text-purple-400 mt-0.5">
                {stats.activeOperators || operators.filter((o) => o.status === 'active').length} Active Agencies
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Managed Fleet Vehicles
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalVehicles}
              </h3>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400 mt-0.5">
                Autos & Bikes Combined
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Attached Drivers
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalAttachedDrivers}
              </h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400 mt-0.5">
                Allocated to Fleet Partners
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Avg Commission Rate
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {avgCommission}%
              </h3>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400 mt-0.5">
                Per Completed Booking
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search fleet operator, manager, phone, city, corridor..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Operators Table */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-xs">
              <tr>
                <th className="py-3 px-4 font-semibold">Operator / Agency</th>
                <th className="py-3 px-4 font-semibold">Manager & Contact</th>
                <th className="py-3 px-4 font-semibold">City & Operating Hub</th>
                <th className="py-3 px-4 font-semibold">Managed Fleet</th>
                <th className="py-3 px-4 font-semibold">Commission</th>
                <th className="py-3 px-4 font-semibold">Portal Access</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading && operators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading fleet operators...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No fleet operators found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((op) => (
                  <tr key={op._id || op.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Operator Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {op.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {op.id || op.customId} • {op.fleetType || 'Mixed Fleet'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Manager & Contact */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{op.manager}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {op.phone}
                      </div>
                    </td>

                    {/* City & Hub */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{op.city}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{op.hub || 'City Central'}</div>
                    </td>

                    {/* Managed Fleet */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {op.autoCount > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200">
                            {op.autoCount} Autos
                          </Badge>
                        )}
                        {op.bikeCount > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200">
                            {op.bikeCount} Bikes
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {op.realDriverCount !== undefined ? op.realDriverCount : (op.activeDrivers || 0)}
                        </span>
                        <span>Drivers Attached</span>
                      </div>
                    </td>

                    {/* Commission */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {op.commissionRate}%
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {op.monthlyVolume || 'Standard'}
                      </div>
                    </td>

                    {/* Portal Credentials status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setCredentialsModalOperator(op)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Login Keys
                      </button>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                        {op.portalAccess?.username || op.email}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge
                        className={`text-[10px] font-semibold border-0 capitalize ${
                          op.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {op.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                          onClick={() => handleOpenView(op)}
                          title="View Operator Details & Drivers"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                          onClick={() => handleOpenEdit(op)}
                          title="Edit Fleet Operator"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            op.status === 'active'
                              ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                          title={op.status === 'active' ? 'Suspend Operator' : 'Activate Operator'}
                          onClick={async () => {
                            const res = await toggleOperatorStatus(op._id || op.id);
                            if (res.success) {
                              toast({
                                title: `Operator ${res.status === 'active' ? 'Activated' : 'Suspended'}`,
                                description: `${op.name} portal status updated.`,
                              });
                            }
                          }}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setDeleteConfirmOperator(op)}
                          title="Delete Fleet Operator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD FLEET OPERATOR (MULTI-STEP WIZARD) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Add Fleet Operator & Issue Credentials
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Register a private vehicle owner or fleet agency and generate vendor portal access.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper Header */}
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-1">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                activeStep === 1
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold">Step 1</div>
              <div className="text-[11px] truncate">Company & Fleet</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                activeStep === 2
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold">Step 2</div>
              <div className="text-[11px] truncate">Manager & Login Keys</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                activeStep === 3
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold">Step 3</div>
              <div className="text-[11px] truncate">Settlement & Bank</div>
            </button>
          </div>

          <form onSubmit={handleSubmitAdd} className="space-y-4 pt-2">
            {/* STEP 1: Company Profile */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Fleet Agency / Company Name *</Label>
                  <Input
                    placeholder="e.g. Hyderabad Metro Cabs & Auto Logistics"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Fleet Category *</Label>
                    <select
                      value={form.fleetType}
                      onChange={(e) => setForm({ ...form, fleetType: e.target.value })}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Auto Rickshaw Fleet">Auto Rickshaws Only</option>
                      <option value="Bike Captains Fleet">Bike Fleet (Two-Wheelers)</option>
                      <option value="City Cabs (Sedan & SUV)">City Cabs (Sedan & SUV)</option>
                      <option value="Mixed Fleet (Auto & Bike)">Mixed Fleet (Auto & Bike)</option>
                      <option value="All Modes (Cab, Auto & Bike)">All Modes (Cab, Auto & Bike)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Primary City *</Label>
                    <Input
                      placeholder="e.g. Hyderabad, Vijayawada, Bangalore"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Operating Corridor / Hub</Label>
                  <Input
                    placeholder="e.g. Hitec City Corridor & Gachibowli Ring Road"
                    value={form.hub}
                    onChange={(e) => setForm({ ...form, hub: e.target.value })}
                    className="h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                      Managed Autos Capacity
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.autoCount}
                      onChange={(e) => setForm({ ...form, autoCount: e.target.value })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-blue-500" />
                      Managed Bikes Capacity
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.bikeCount}
                      onChange={(e) => setForm({ ...form, bikeCount: e.target.value })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Owner Contact & Portal Credentials */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Manager / Owner Name *</Label>
                    <Input
                      placeholder="e.g. Rajesh Reddy"
                      value={form.manager}
                      onChange={(e) => setForm({ ...form, manager: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Primary Contact Phone *</Label>
                    <Input
                      placeholder="+91 98480 12345"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-9 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Official Login Email (Username) *</Label>
                  <Input
                    type="email"
                    placeholder="rajesh@metrofleet.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-9 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    This email is used by the fleet operator to sign in to the dedicated Vendor Web/App Portal.
                  </p>
                </div>

                {/* Password Generation Box */}
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      Temporary Vendor Password
                    </Label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate New
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="h-9 font-mono text-xs bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    The operator can immediately sign in with this temporary password and attach drivers.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Commercial & Bank Settlement */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Platform Commission Fee (%) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        min="2"
                        max="25"
                        value={form.commissionRate}
                        onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                        className="h-9 font-mono"
                        required
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Go Dest platform fee deducted per completed ride</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Payout Settlement Schedule</Label>
                    <select
                      value={form.payoutFrequency}
                      onChange={(e) => setForm({ ...form, payoutFrequency: e.target.value })}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Daily Automated (Midnight)">Daily Automated (Midnight via Cashfree/Razorpay)</option>
                      <option value="Weekly (Every Monday)">Weekly (Every Monday)</option>
                      <option value="Bi-Weekly (1st & 15th)">Bi-Weekly (1st & 15th)</option>
                    </select>
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-blue-500" />
                    Vendor Settlement Bank Account
                  </h4>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400">Account Holder Name</Label>
                    <Input
                      placeholder="e.g. City Auto Fleet Operators Pvt Ltd"
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 dark:text-slate-400">Bank Account Number</Label>
                      <Input
                        placeholder="e.g. 50200012345678"
                        value={form.accountNumber}
                        onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 dark:text-slate-400">IFSC Code</Label>
                      <Input
                        placeholder="e.g. HDFC0000456"
                        value={form.ifsc}
                        onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                        className="h-8 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400">Settlement UPI ID (Optional)</Label>
                    <Input
                      placeholder="e.g. cityfleet@okaxis"
                      value={form.upiId}
                      onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer Controls */}
            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-200 dark:border-slate-800">
              {activeStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  Back
                </Button>
              )}

              {activeStep < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  Continue to Step {activeStep + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Save & Issue Credentials
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT FLEET OPERATOR */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Edit Fleet Operator Details
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update agency information, manager contacts, commission, and bank details.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Fleet Agency / Company Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Fleet Category</Label>
                  <select
                    value={editForm.fleetType}
                    onChange={(e) => setEditForm({ ...editForm, fleetType: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Auto Rickshaw Fleet">Auto Rickshaws Only</option>
                    <option value="Bike Captains Fleet">Bike Fleet (Two-Wheelers)</option>
                    <option value="City Cabs (Sedan & SUV)">City Cabs (Sedan & SUV)</option>
                    <option value="Mixed Fleet (Auto & Bike)">Mixed Fleet (Auto & Bike)</option>
                    <option value="All Modes (Cab, Auto & Bike)">All Modes (Cab, Auto & Bike)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Primary Operating City *</Label>
                  <Input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operating Corridor / Hub</Label>
                <Input
                  value={editForm.hub}
                  onChange={(e) => setEditForm({ ...editForm, hub: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Manager / Owner Name *</Label>
                  <Input
                    value={editForm.manager}
                    onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Primary Contact Phone *</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="h-9 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Autos Count</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.autoCount}
                    onChange={(e) => setEditForm({ ...editForm, autoCount: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Bikes Count</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.bikeCount}
                    onChange={(e) => setEditForm({ ...editForm, bikeCount: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Commission (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editForm.commissionRate}
                    onChange={(e) => setEditForm({ ...editForm, commissionRate: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Bank Settlement Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-blue-500" />
                  Bank Account & Settlement
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400">Account Holder Name</Label>
                    <Input
                      value={editForm.accountName}
                      onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400">Payout Schedule</Label>
                    <select
                      value={editForm.payoutFrequency}
                      onChange={(e) => setEditForm({ ...editForm, payoutFrequency: e.target.value })}
                      className="w-full h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-2 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Daily Automated (Midnight)">Daily Automated (Midnight)</option>
                      <option value="Weekly (Every Monday)">Weekly (Every Monday)</option>
                      <option value="Bi-Weekly (1st & 15th)">Bi-Weekly (1st & 15th)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400">Account Number</Label>
                    <Input
                      value={editForm.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 dark:text-slate-400">IFSC Code</Label>
                    <Input
                      value={editForm.ifsc}
                      onChange={(e) => setEditForm({ ...editForm, ifsc: e.target.value.toUpperCase() })}
                      className="h-8 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 dark:text-slate-400">UPI ID (Optional)</Label>
                  <Input
                    value={editForm.upiId}
                    onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 3: VIEW OPERATOR DETAILS & ATTACHED DRIVERS ROSTER */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog
        open={!!viewModalOperatorId}
        onOpenChange={(open) => !open && setViewModalOperatorId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          {currentOperator ? (
            <div className="space-y-5">
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-md">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {currentOperator.name}
                      </h2>
                      <Badge
                        className={`text-[10px] border-0 capitalize ${
                          currentOperator.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {currentOperator.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {currentOperator.customId || currentOperator.id} • {currentOperator.city} • {currentOperator.fleetType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setCredentialsModalOperator(currentOperator)}
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Credentials
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setViewModalOperatorId(null);
                      handleOpenEdit(currentOperator);
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setViewActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    viewActiveTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Overview & Commercials
                </button>

                <button
                  type="button"
                  onClick={() => setViewActiveTab('drivers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    viewActiveTab === 'drivers'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Attached Drivers Roster ({currentOperator.drivers?.length || 0})
                </button>
              </div>

              {/* TAB 1: OVERVIEW & COMMERCIALS */}
              {viewActiveTab === 'overview' && (
                <div className="space-y-4">
                  {/* KPI Stats Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">Managed Autos</span>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentOperator.autoCount}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">Managed Bikes</span>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentOperator.bikeCount}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">Active Drivers</span>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {currentOperator.drivers?.length || currentOperator.activeDrivers || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">Commission Rate</span>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {currentOperator.commissionRate}%
                      </div>
                    </div>
                  </div>

                  {/* Manager & Hub Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      Operations Manager Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500">Full Name</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentOperator.manager}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Phone Number</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{currentOperator.phone}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Official Email</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{currentOperator.email}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Operating Corridor / Hub</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentOperator.hub || 'City Central'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  {currentOperator.bankDetails && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                        Settlement & Bank Account
                      </h4>
                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500">Account Holder</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {currentOperator.bankDetails.accountName || currentOperator.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">Payout Schedule</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {currentOperator.bankDetails.payoutFrequency || 'Daily Automated'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">Account Number</span>
                          <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {currentOperator.bankDetails.accountNumber || 'Pending submission'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">IFSC / UPI ID</span>
                          <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {currentOperator.bankDetails.ifsc || currentOperator.bankDetails.upiId || 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ATTACHED DRIVERS ROSTER */}
              {viewActiveTab === 'drivers' && (
                <div className="space-y-4">
                  {/* Assign Driver Bar */}
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="w-full sm:w-auto">
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                        Allocate Driver to this Fleet
                      </h4>
                      <p className="text-[11px] text-blue-700/80 dark:text-blue-300">
                        Select an available independent driver to attach to {currentOperator.name}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={selectedDriverToAssign}
                        onChange={(e) => setSelectedDriverToAssign(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-md px-2 text-slate-800 dark:text-slate-200 min-w-[200px]"
                      >
                        <option value="">-- Choose Driver --</option>
                        {availableDrivers.map((drv) => (
                          <option key={drv._id || drv.id} value={drv._id || drv.id}>
                            {drv.displayName || drv.name} ({drv.id} - {drv.vehicleType})
                          </option>
                        ))}
                      </select>

                      <Button
                        size="sm"
                        disabled={!selectedDriverToAssign || isAssigning}
                        onClick={handleAssignDriver}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3 shrink-0"
                      >
                        {isAssigning ? 'Assigning...' : 'Assign'}
                      </Button>
                    </div>
                  </div>

                  {/* Drivers Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Driver Partner</th>
                          <th className="py-2.5 px-3 font-semibold">Vehicle</th>
                          <th className="py-2.5 px-3 font-semibold">Duty</th>
                          <th className="py-2.5 px-3 font-semibold">KYC</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {!currentOperator.drivers || currentOperator.drivers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              <Users className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                              No drivers currently attached to this fleet operator.
                            </td>
                          </tr>
                        ) : (
                          currentOperator.drivers.map((drv) => (
                            <tr key={drv._id || drv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {drv.displayName || drv.name || 'Driver Partner'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {drv.id || drv.customId} • {drv.primaryPhone}
                                </div>
                              </td>

                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {drv.vehicleType || 'Vehicle'}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {drv.vehicleNumber || '—'}
                                </div>
                              </td>

                              <td className="py-2.5 px-3">
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1.5 py-0 capitalize ${
                                    drv.dutyStatus === 'online'
                                      ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20'
                                      : 'text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {drv.dutyStatus || 'offline'}
                                </Badge>
                              </td>

                              <td className="py-2.5 px-3">
                                <Badge
                                  className={`text-[9px] px-1.5 py-0 capitalize border-0 ${
                                    drv.kycStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : drv.kycStatus === 'rejected'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                  }`}
                                >
                                  {drv.kycStatus || 'pending'}
                                </Badge>
                              </td>

                              <td className="py-2.5 px-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnassignDriver(drv._id || drv.id, drv.displayName || drv.name)}
                                  className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px]"
                                  title="Unassign driver from fleet"
                                >
                                  <UserMinus className="w-3 h-3 mr-1" />
                                  Unassign
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <DialogFooter className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewModalOperatorId(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              Loading operator details...
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 4: CREDENTIALS SUMMARY MODAL (INSTANT COPY / SHARE) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog
        open={!!credentialsModalOperator}
        onOpenChange={(open) => !open && setCredentialsModalOperator(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Vendor Credentials Issued
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Share these login credentials with the fleet operator.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {credentialsModalOperator && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span className="text-xs text-slate-500 font-medium">Fleet Company</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {credentialsModalOperator.name}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span className="text-xs text-slate-500 font-medium">Vendor Portal URL</span>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                    http://localhost:5173/login
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span className="text-xs text-slate-500 font-medium">Username / Email</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {credentialsModalOperator.portalAccess?.username || credentialsModalOperator.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Temporary Password</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    {credentialsModalOperator.portalAccess?.tempPassword || 'MAAT@Fleet#2026'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                <span>The operator can now log in, allocate vehicles, and manage assigned drivers.</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const opId = credentialsModalOperator._id || credentialsModalOperator.id;
                await handleResetPassword(opId);
                // Update credentials modal with latest
                const updated = await fetchOperatorById(opId);
                if (updated) setCredentialsModalOperator(updated);
              }}
              className="text-xs text-slate-600 hover:text-blue-600"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset Key
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 font-semibold"
              onClick={() => handleCopyCredentials(credentialsModalOperator)}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy Login Details
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 5: DELETE OPERATOR CONFIRMATION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog
        open={!!deleteConfirmOperator}
        onOpenChange={(open) => !open && setDeleteConfirmOperator(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-red-600">
                  Delete Fleet Operator?
                </DialogTitle>
                <DialogDescription className="text-xs">
                  This action will suspend the fleet agency and detach any associated drivers.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteConfirmOperator && (
            <div className="py-2 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deleteConfirmOperator.name}</span> ({deleteConfirmOperator.id || deleteConfirmOperator.customId})?
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                All drivers currently assigned to this operator will automatically be converted to <strong>Direct Partners</strong>.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOperator(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
