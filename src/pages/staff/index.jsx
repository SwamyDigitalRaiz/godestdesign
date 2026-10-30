import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useStaffStore } from '../../store/staffStore';
import { useRoleStore } from '../../store/roleStore';
import { useToast } from '../../components/ui/toaster';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronRight,
  Globe2,
  Shield,
  Phone,
  Mail,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const DEPARTMENTS = [
  'Fleet Operations',
  'Finance & Accounts',
  'Customer Success',
  'Safety & Regulatory',
  'Dispatch & Routing',
  'Executive Administration',
];

export function StaffPage() {
  const { staff, loading, fetchStaff, addStaff, updateStaff, deleteStaff, toggleStaffStatus } = useStaffStore();
  const { roles, fetchRoles } = useRoleStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: DEPARTMENTS[0],
    roleId: '',
    password: '',
    isActive: true,
  });

  // Fetch staff and roles from backend on mount
  useEffect(() => {
    fetchStaff().catch((err) => {
      console.error('Failed to fetch staff:', err);
    });
    fetchRoles().catch((err) => {
      console.error('Failed to fetch roles:', err);
    });
  }, [fetchStaff, fetchRoles]);

  const handleCreateNew = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: DEPARTMENTS[0],
      roleId: roles[0]?._id || roles[0]?.id || '',
      password: '',
      isActive: true,
    });
    setShowPassword(false);
    setShowDialog(true);
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    const assignedRoleId = member.role?._id || member.role || member.roleId || '';
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      department: member.department || DEPARTMENTS[0],
      roleId: assignedRoleId,
      password: '',
      isActive: member.isActive !== false,
    });
    setShowPassword(false);
    setShowDialog(true);
  };

  const handleToggleStatus = async (member) => {
    const id = member._id || member.id;
    try {
      setTogglingId(id);
      await toggleStaffStatus(id);
      toast({
        title: 'Status Updated',
        description: `Staff member ${!member.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle staff status',
        variant: 'destructive',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    try {
      setDeleting(true);
      await deleteStaff(id);
      toast({
        title: 'Staff Member Removed',
        description: `${deleteTarget.name} has been removed from staff accounts.`,
      });
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete staff member',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.roleId) {
      toast({
        title: 'Validation Error',
        description: 'Name, email, and assigned role are required',
        variant: 'destructive',
      });
      return;
    }

    if (!editingStaff && !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Password is required when creating a new staff account',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      roleId: formData.roleId,
      isActive: formData.isActive,
    };

    if (formData.password && formData.password.trim().length > 0) {
      payload.password = formData.password.trim();
    }

    setSaving(true);
    try {
      if (editingStaff) {
        const id = editingStaff._id || editingStaff.id;
        await updateStaff(id, payload);
        toast({
          title: 'Staff Member Updated',
          description: `Details for ${formData.name} updated successfully.`,
        });
      } else {
        await addStaff(payload);
        toast({
          title: 'Staff Member Created',
          description: `${formData.name} has been added to admin staff.`,
        });
      }

      setShowDialog(false);
      setEditingStaff(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save staff member',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const memberName = member.name || '';
    const memberEmail = member.email || '';
    const memberPhone = member.phone || '';
    const memberDept = member.department || '';

    const matchSearch =
      memberName.toLowerCase().includes(search.toLowerCase()) ||
      memberEmail.toLowerCase().includes(search.toLowerCase()) ||
      memberPhone.includes(search) ||
      memberDept.toLowerCase().includes(search.toLowerCase());

    const memberRoleId = member.role?._id || member.role || member.roleId;
    const matchRole = roleFilter === 'all' || memberRoleId === roleFilter;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.isActive) ||
      (statusFilter === 'inactive' && !member.isActive);

    return matchSearch && matchRole && matchStatus;
  });

  const activeStaffCount = staff.filter((s) => s.isActive).length;
  const inactiveStaffCount = staff.filter((s) => !s.isActive).length;
  const uniqueRolesCount = new Set(
    staff.map((s) => s.role?.name || s.roleName || 'Staff')
  ).size;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header & Breadcrumbs ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Staff Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Staff Management
            <Badge variant="outline" className="text-xs font-normal border-primary/40 text-primary">
              {staff.length} Members
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create, manage and audit administrative staff accounts, assign roles, and monitor login activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStaff()}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateNew}
            className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Staff</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{staff.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Staff</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeStaffCount}
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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Deactivated Staff</p>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 mt-1">
                {inactiveStaffCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned Roles</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {uniqueRolesCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search ────────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Roles</option>
                {roles.map((r) => {
                  const roleId = r._id || r.id;
                  return (
                    <option key={roleId} value={roleId}>
                      {r.name}
                    </option>
                  );
                })}
              </select>

              {/* Status filter tabs */}
              <div className="flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                {['all', 'active', 'inactive'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <Link to="/roles">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Manage Roles
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Staff Table ─────────────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && staff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Loading staff members from server...
                    </p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      No staff members found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your filters or click "+ Add Staff Member".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member, idx) => {
                  const memberId = member._id || member.id;
                  const roleName = member.role?.name || member.roleName || 'Custom Staff';
                  const isToggling = togglingId === memberId;

                  return (
                    <tr
                      key={memberId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {member.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-slate-400" />
                                {member.email}
                              </span>
                              {member.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {member.department || 'Operations'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {roleName}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={member.isActive}
                            disabled={isToggling}
                            onCheckedChange={() => handleToggleStatus(member)}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              member.isActive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {member.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add / Edit Staff Modal ────────────────────────────────────────── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {editingStaff ? `Edit: ${editingStaff.name}` : 'Add Staff Member'}
            </DialogTitle>
            <DialogDescription>
              Provide staff member identity details and select their administrative role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Full Name *</Label>
              <Input
                id="staff-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Chandra"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Work Email *</Label>
              <Input
                id="staff-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@maat.in"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staff-phone">Contact Phone</Label>
                <Input
                  id="staff-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-dept">Department</Label>
                <select
                  id="staff-dept"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-9 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-slate-700 dark:text-slate-200"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Assigned Role & Permissions *</Label>
              <select
                id="staff-role"
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full h-9 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-blue-600 dark:text-blue-400"
                required
              >
                <option value="">Select a Role</option>
                {roles.map((r) => {
                  const roleId = r._id || r.id;
                  return (
                    <option key={roleId} value={roleId}>
                      {r.name} {r.isSystem ? '(Super Admin)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-password">
                {editingStaff ? 'Update Password (leave blank to keep current)' : 'Account Password *'}
              </Label>
              <div className="relative">
                <Input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStaff ? '••••••••' : 'Enter login password'}
                  className="h-9 text-xs pr-9"
                  required={!editingStaff}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Active Account</p>
                <p className="text-[11px] text-slate-500">Allow staff to sign in to the platform</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold">
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </span>
                ) : editingStaff ? (
                  'Update Staff Member'
                ) : (
                  'Save Staff Member'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDeleteStaff}
        title={`Remove Staff Member: ${deleteTarget?.name}`}
        description="Are you sure you want to remove this staff member? Their platform access will be revoked immediately."
        confirmText={deleting ? 'Removing...' : 'Remove Staff'}
        variant="danger"
      />
    </div>
  );
}
