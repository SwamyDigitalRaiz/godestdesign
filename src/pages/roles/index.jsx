import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import {
  useRoleStore,
  PERMISSION_CATEGORIES,
  PERMISSION_LABELS,
  getAvailableActions,
  ROLE_PRESETS,
} from '../../store/roleStore';
import { useStaffStore } from '../../store/staffStore';
import { useToast } from '../../components/ui/toaster';
import {
  Shield,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  Sparkles,
  ChevronRight,
  Globe2,
  Eye,
  Check,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';

export function RolesPage() {
  const { roles, loading, fetchRoles, addRole, updateRole, deleteRole } = useRoleStore();
  const { staff, fetchStaff } = useStaffStore();
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [activeTab, setActiveTab] = useState(Object.keys(PERMISSION_CATEGORIES)[0]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {},
  });

  // Fetch roles and staff from backend on mount
  useEffect(() => {
    fetchRoles();
    fetchStaff();
  }, [fetchRoles, fetchStaff]);

  // Calculate assigned staff count per role
  const getStaffCountForRole = (role) => {
    if (role?.usersCount !== undefined && role.usersCount > 0) return role.usersCount;
    const roleId = role?._id || role?.id;
    return staff.filter((s) => (s.role?._id || s.roleId) === roleId || (s.role?.name || s.roleName) === role?.name).length;
  };

  const handleCreateNew = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {},
    });
    setPermissionSearch('');
    setShowDialog(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: JSON.parse(JSON.stringify(role.permissions || {})),
    });
    setPermissionSearch('');
    setShowDialog(true);
  };

  const handleView = (role) => {
    setViewingRole(role);
    setShowViewDialog(true);
  };

  const confirmDeleteRole = async () => {
    if (!deleteTarget) return;
    const roleId = deleteTarget._id || deleteTarget.id;
    try {
      await deleteRole(roleId);
      toast({
        title: 'Role Deleted',
        description: `Role "${deleteTarget.name}" has been removed.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: 'Cannot Delete Role',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const applyPreset = (preset) => {
    const generatedPerms = preset.apply();
    setFormData((prev) => ({
      ...prev,
      name: prev.name ? prev.name : preset.name,
      description: prev.description ? prev.description : preset.description,
      permissions: generatedPerms,
    }));
    toast({
      title: 'Template Applied',
      description: `Loaded permissions template for "${preset.name}"`,
    });
  };

  const togglePermission = (permission, action) => {
    setFormData((prev) => {
      const current = prev.permissions[permission] || {};
      const updated = {
        ...current,
        [action]: !current[action],
      };
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: updated,
        },
      };
    });
  };

  const toggleCategoryAll = (category, enable) => {
    const permissions = PERMISSION_CATEGORIES[category] || [];
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };
      permissions.forEach((permission) => {
        const availableActions = getAvailableActions(permission);
        newPermissions[permission] = {};
        availableActions.forEach((action) => {
          newPermissions[permission][action] = enable;
        });
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const toggleAllPermissionsGlobal = (enable) => {
    setFormData((prev) => {
      const newPermissions = {};
      if (enable) newPermissions.all = true;
      Object.keys(PERMISSION_LABELS).forEach((permKey) => {
        newPermissions[permKey] = {};
        getAvailableActions(permKey).forEach((action) => {
          newPermissions[permKey][action] = enable;
        });
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const isCategoryAllSelected = (category) => {
    const permissions = PERMISSION_CATEGORIES[category] || [];
    if (permissions.length === 0) return false;
    return permissions.every((permission) => {
      const actions = getAvailableActions(permission);
      return actions.every((action) => formData.permissions[permission]?.[action] === true);
    });
  };

  const countActiveModules = (rolePermissions = {}) => {
    if (rolePermissions.all === true) return Object.keys(PERMISSION_LABELS).length;
    let count = 0;
    Object.keys(PERMISSION_LABELS).forEach((key) => {
      const actions = rolePermissions[key];
      if (actions && Object.values(actions).some((v) => v === true)) {
        count++;
      }
    });
    return count;
  };

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!permissionSearch.trim()) return PERMISSION_CATEGORIES;
    const query = permissionSearch.toLowerCase();
    const result = {};
    Object.entries(PERMISSION_CATEGORIES).forEach(([category, perms]) => {
      const matched = perms.filter((p) => {
        const label = PERMISSION_LABELS[p] || p;
        return label.toLowerCase().includes(query) || p.toLowerCase().includes(query);
      });
      if (matched.length > 0) {
        result[category] = matched;
      }
    });
    return result;
  }, [permissionSearch]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please specify a name for this role',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingRole) {
        const roleId = editingRole._id || editingRole.id;
        const res = await updateRole(roleId, formData);
        if (res.success) {
          toast({
            title: 'Role Updated',
            description: `Role "${formData.name}" privileges updated successfully.`,
          });
        }
      } else {
        const res = await addRole(formData);
        if (res.success) {
          toast({
            title: 'Role Created',
            description: `New staff role "${formData.name}" created successfully.`,
          });
        }
      }

      setShowDialog(false);
      setEditingRole(null);
    } catch (err) {
      toast({
        title: 'Error Saving Role',
        description: err.message || 'Failed to save role',
        variant: 'destructive',
      });
    }
  };

  const totalModulesCount = Object.keys(PERMISSION_LABELS).length;

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
            <span className="text-slate-900 dark:text-white font-medium">Roles & Permissions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Roles & Permissions
            <Badge variant="outline" className="text-xs font-normal border-primary/40 text-primary">
              {roles.length} Roles
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Define admin staff roles with granular, module-by-module permission controls for mobility dispatch, fleet ops, and finance.
          </p>
        </div>

        <Button
          onClick={handleCreateNew}
          className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Roles</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{roles.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned Staff</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {staff.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">System Roles</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {roles.filter((r) => r.isSystem).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Permission Modules</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {totalModulesCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Configured Roles Table Card ─────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Configured Roles
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Assign these roles to staff members in Staff Management to dictate what pages and actions they can perform.
              </CardDescription>
            </div>
            <Link to="/staff">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                View Staff Members
              </Button>
            </Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Role Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Access Scope</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roles.map((role, idx) => {
                const roleId = role._id || role.id;
                const staffCount = getStaffCountForRole(role);
                const activeCount = countActiveModules(role.permissions);
                const isFull = role.permissions?.all === true || activeCount === totalModulesCount;

                return (
                  <tr
                    key={roleId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            role.isSystem
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                            {role.name}
                            {role.isSystem && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40">
                                System
                              </Badge>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{role.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {role.description || 'No description provided'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          isFull
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : activeCount > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isFull ? 'Full Access (All Modules)' : `${activeCount} of ${totalModulesCount} Modules`}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">{staffCount}</span>
                        <span>members</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(role)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="View Permissions Scope"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(role)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(role)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Role Create / Edit Dialog ────────────────────────────────────── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Staff Role'}
            </DialogTitle>
            <DialogDescription>
              Define the role identity, choose a quick preset, and configure exact read/write privileges.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 pt-1">
            {/* Quick Templates Bar */}
            {!editingRole && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Quick Mobility Presets & Templates
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {ROLE_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="text-xs h-7 gap-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    >
                      <Plus className="h-3 w-3" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Operations Lead, Dispatch Supervisor"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role-desc">Description</Label>
                <Input
                  id="role-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of responsibilities and access boundaries"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Module Permissions Matrix
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Toggle individual access rights for each operational section
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      className="h-8 pl-8 text-xs w-44"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllPermissionsGlobal(true)}
                    className="h-8 text-xs gap-1"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllPermissionsGlobal(false)}
                    className="h-8 text-xs gap-1"
                  >
                    <Square className="h-3.5 w-3.5 text-slate-400" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Tabs by Category */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-3.5">
                <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                  {Object.keys(filteredCategories).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="text-xs py-1.5 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm font-medium"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(filteredCategories).map(([category, perms]) => {
                  const allCatSelected = isCategoryAllSelected(category);

                  return (
                    <TabsContent key={category} value={category} className="space-y-3 mt-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-slate-500">
                          {perms.length} modules in {category}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryAll(category, !allCatSelected)}
                          className="text-xs h-7 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                          {allCatSelected ? 'Deselect Category' : 'Select All in Category'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map((permission) => {
                          const label = PERMISSION_LABELS[permission] || permission;
                          const availableActions = getAvailableActions(permission);
                          const currentPerms = formData.permissions[permission] || {};

                          return (
                            <div
                              key={permission}
                              className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/40 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                                  {label}
                                </span>
                                <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-700">
                                  {permission}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {availableActions.map((action) => {
                                  const isChecked = currentPerms[action] === true;

                                  return (
                                    <button
                                      key={action}
                                      type="button"
                                      onClick={() => togglePermission(permission, action)}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border capitalize transition-all flex items-center gap-1 ${
                                        isChecked
                                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      {isChecked && <Check className="h-3 w-3" />}
                                      {action}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold">
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── View Permissions Modal ──────────────────────────────────────── */}
      {viewingRole && (
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {viewingRole.name} Permissions
              </DialogTitle>
              <DialogDescription>{viewingRole.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {viewingRole.permissions?.all ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-emerald-600" />
                  Full Unrestricted System Super Admin Access (All modules and actions granted)
                </div>
              ) : (
                Object.entries(PERMISSION_CATEGORIES).map(([cat, perms]) => {
                  const activeInCat = perms.filter((p) => {
                    const acts = viewingRole.permissions?.[p];
                    return acts && Object.values(acts).some((v) => v === true);
                  });

                  if (activeInCat.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {cat}
                      </h4>
                      <div className="space-y-1.5">
                        {activeInCat.map((p) => {
                          const label = PERMISSION_LABELS[p] || p;
                          const acts = viewingRole.permissions?.[p] || {};
                          const grantedActs = Object.entries(acts)
                            .filter(([, v]) => v === true)
                            .map(([k]) => k);

                          return (
                            <div
                              key={p}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                            >
                              <span className="font-medium text-slate-900 dark:text-white">
                                {label}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap">
                                {grantedActs.map((act) => (
                                  <Badge key={act} variant="secondary" className="capitalize text-[10px] py-0">
                                    {act}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowViewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Confirm Delete Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDeleteRole}
        title={`Delete Role: ${deleteTarget?.name}`}
        description="Are you sure you want to delete this role? Any staff members currently assigned to this role will lose their custom permissions."
        confirmText="Delete Role"
        variant="danger"
      />
    </div>
  );
}
