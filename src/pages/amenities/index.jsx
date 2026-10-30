import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Sparkles,
  Filter,
  X,
  Check,
  Shield,
  Wifi,
  Package,
  Star,
  Accessibility,
  AlertCircle,
} from 'lucide-react';
import { useAmenityStore } from '../../store/amenityStore';
import { useToast } from '../../components/ui/toaster';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const CATEGORY_CONFIG = {
  comfort: { label: 'Comfort', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Star },
  safety: { label: 'Safety', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: Shield },
  connectivity: { label: 'Connectivity', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20', icon: Wifi },
  accessibility: { label: 'Accessibility', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Accessibility },
  other: { label: 'Other', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: Package },
};

const EMPTY_FORM = { name: '', icon: '✨', description: '', category: 'comfort', status: true, sortOrder: 0 };

const DEFAULT_ICONS = ['✨', '🛡️', '📶', '🔌', '🎵', '🧳', '🌂', '🪖', '🧭', '❄️', '🔊', '🚫🐾', '🌬️', '💺', '🎒'];

export function AmenitiesPage() {
  const { amenities, loading, fetchAmenities, createAmenity, updateAmenity, toggleAmenityStatus, deleteAmenity } =
    useAmenityStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const filtered = amenities.filter((a) => {
    const matchSearch =
      !search.trim() ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && a.status) ||
      (statusFilter === 'inactive' && !a.status);
    return matchSearch && matchCategory && matchStatus;
  });

  const openCreate = () => {
    setEditingAmenity(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (amenity) => {
    setEditingAmenity(amenity);
    setForm({
      name: amenity.name,
      icon: amenity.icon || '✨',
      description: amenity.description || '',
      category: amenity.category || 'comfort',
      status: amenity.status !== false,
      sortOrder: amenity.sortOrder || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Amenity name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingAmenity) {
        await updateAmenity(editingAmenity._id, form);
        toast({ title: 'Amenity updated!', variant: 'success' });
      } else {
        await createAmenity(form);
        toast({ title: 'Amenity created!', description: `"${form.name}" is now available in driver registration.`, variant: 'success' });
      }
      setShowModal(false);
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (amenity) => {
    try {
      await toggleAmenityStatus(amenity._id);
      toast({ title: `${amenity.name} ${amenity.status ? 'deactivated' : 'activated'}`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (amenity) => {
    if (!confirm(`Delete "${amenity.name}"? This cannot be undone.`)) return;
    setDeletingId(amenity._id);
    try {
      await deleteAmenity(amenity._id);
      toast({ title: 'Amenity deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = amenities.filter((a) => a.status).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Bike Auto</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Amenities</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vehicle Comfort & Safety Amenities
            </h1>
            {activeCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                {activeCount} Active
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage amenity options available in driver registration, user app, and driver app.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm"
          size="sm"
          id="create-amenity-btn"
        >
          <Plus className="h-4 w-4" />
          Add Amenity
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Amenities', value: amenities.length, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-50 dark:bg-slate-800' },
          { label: 'Active', value: activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Inactive', value: amenities.length - activeCount, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
          { label: 'Categories', value: [...new Set(amenities.map((a) => a.category))].length, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map((kpi) => (
          <Card key={kpi.label} className={`${kpi.bg} border-0 shadow-none`}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search amenities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            id="amenity-search"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300"
          id="amenity-category-filter"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300"
          id="amenity-status-filter"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Amenities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {search || categoryFilter !== 'all' || statusFilter !== 'all' ? 'No amenities match your filters' : 'No amenities yet'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {!search && categoryFilter === 'all' && statusFilter === 'all' && 'Create your first amenity to get started'}
          </p>
          {!search && categoryFilter === 'all' && statusFilter === 'all' && (
            <Button onClick={openCreate} size="sm" className="mt-4 bg-primary text-slate-950 hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Add First Amenity
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((amenity) => {
            const cat = CATEGORY_CONFIG[amenity.category] || CATEGORY_CONFIG.other;
            const CatIcon = cat.icon;
            return (
              <Card
                key={amenity._id}
                className={`border transition-all duration-200 hover:shadow-md ${
                  amenity.status ? 'border-slate-200 dark:border-slate-800' : 'border-dashed border-slate-200 dark:border-slate-700 opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                        {amenity.icon || '✨'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{amenity.name}</p>
                        {amenity.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{amenity.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cat.color}`}>
                            <CatIcon className="h-2.5 w-2.5" />
                            {cat.label}
                          </span>
                          {!amenity.status && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(amenity)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={amenity.status ? 'Deactivate' : 'Activate'}
                        id={`toggle-amenity-${amenity._id}`}
                      >
                        {amenity.status ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(amenity)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit"
                        id={`edit-amenity-${amenity._id}`}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(amenity)}
                        disabled={deletingId === amenity._id}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
                        title="Delete"
                        id={`delete-amenity-${amenity._id}`}
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Will appear in driver registration, user app & driver app
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Icon + Name row */}
            <div className="flex gap-3">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Icon</label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="h-10 w-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl flex items-center justify-center hover:border-primary transition-colors"
                  id="icon-picker-btn"
                >
                  {form.icon}
                </button>
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 grid grid-cols-5 gap-1 w-44">
                    {DEFAULT_ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => { setForm((f) => ({ ...f, icon: ic })); setShowIconPicker(false); }}
                        className={`h-8 w-8 rounded-lg text-base flex items-center justify-center hover:bg-primary/10 transition-colors ${form.icon === ic ? 'bg-primary/20' : ''}`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Amenity Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="amenity-name-input"
                  placeholder="e.g. Wi-Fi connectivity"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Description (optional)</label>
              <Input
                id="amenity-description-input"
                placeholder="Brief description shown to passengers"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Category + Sort Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Category</label>
                <select
                  id="amenity-category-select"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sort Order</label>
                <Input
                  id="amenity-sort-input"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show in driver registration & apps</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: !f.status }))}
                id="amenity-status-toggle"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.status ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-slate-950 hover:bg-primary/90 font-semibold"
                id="save-amenity-btn"
              >
                {saving ? 'Saving...' : editingAmenity ? 'Update Amenity' : 'Create Amenity'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
