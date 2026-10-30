import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useVehicleStore } from '../../../store/vehicleStore';
import { useToast } from '../../../components/ui/toaster';
import {
  Car,
  Bike,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit2,
  X,
  MapPin,
  Users,
  DollarSign,
  CloudRain,
  Sliders,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  const envApi = import.meta.env.VITE_API_URL;
  let backendBase = envApi ? envApi.replace(/\/api\/?$/, '') : '';
  if (!backendBase && typeof window !== 'undefined') {
    backendBase = `http://${window.location.hostname}:5005`;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    if (backendBase.includes('localhost') && window.location.hostname !== 'localhost') {
      backendBase = backendBase.replace('localhost', window.location.hostname);
    }
  }
  return `${backendBase}${img.startsWith('/') ? '' : '/'}${img}`;
};

export function VehicleListPage() {
  const navigate = useNavigate();
  const { vehicles, loading, fetchVehicles, deleteVehicle, toggleField } = useVehicleStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [biddingFilter, setBiddingFilter] = useState('all');
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(search.toLowerCase()));

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && v.status) ||
      (statusFilter === 'inactive' && !v.status);

    const matchBidding =
      biddingFilter === 'all' ||
      (biddingFilter === 'enabled' && v.biddingEnabled) ||
      (biddingFilter === 'disabled' && !v.biddingEnabled);

    return matchSearch && matchStatus && matchBidding;
  });

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    await deleteVehicle(vehicleToDelete._id || vehicleToDelete.id);
    toast({
      title: 'Vehicle Removed',
      description: `"${vehicleToDelete.name}" has been permanently deleted from categories.`,
    });
    setVehicleToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Bike Auto</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Vehicles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Vehicle List
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your registered Bike & Auto categories, rate cards, live pricing, and visibility.
          </p>
        </div>

        <Link to="/bike-auto/vehicles/add">
          <Button variant="maat" className="flex items-center gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                Total Categories
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {vehicles.length}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Active on Home
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {vehicles.filter((v) => v.homeVisible && v.status).length}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-sm">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Bidding Enabled
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {vehicles.filter((v) => v.biddingEnabled).length}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Sliders className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Rain Surge Active
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {vehicles.filter((v) => v.weatherBad).length}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CloudRain className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search vehicle category name or description..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <select
                value={biddingFilter}
                onChange={(e) => setBiddingFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Pricing Models</option>
                <option value="enabled">Bidding / InDrive Enabled</option>
                <option value="disabled">Fixed Price Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table / Grid */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Vehicle Category</th>
                <th className="py-3 px-4 font-semibold">Capacity</th>
                <th className="py-3 px-4 font-semibold">Rate Card (Base / Km)</th>
                <th className="py-3 px-4 font-semibold">Commission</th>
                <th className="py-3 px-4 font-semibold">Pricing Model</th>
                <th className="py-3 px-4 font-semibold text-center">Weather Bad</th>
                <th className="py-3 px-4 font-semibold text-center">Home Screen</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No vehicle categories found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Vehicle Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          {v.image ? (
                            <img src={resolveImageUrl(v.image)} alt={v.name} className="h-10 w-full object-contain" />
                          ) : (
                            <Bike className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{v.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                            {v.description || 'No description provided'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {v.captainAcceptSeconds ?? 15}s accept · {v.searchTimeoutSeconds ?? 90}s search · {v.freeWaitingMinutes ?? 5} min wait · ₹{v.waitingChargePerMinute ?? 2}/min
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Capacity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {v.capacity} {v.capacity === 1 ? 'Rider' : 'Seats'}
                      </div>
                    </td>

                    {/* Rate Card */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{v.minKmPrice}
                        </span>
                        <span className="text-slate-500"> (first {v.minKmDistance} km)</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          + ₹{v.afterKmPrice}/km • +₹{v.extraCharge} fee
                        </p>
                      </div>
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                        {v.commissionType === '%' ? `${v.commissionRate}%` : `₹${v.commissionRate} FIX`}
                      </span>
                    </td>

                    {/* Pricing Model / Bidding */}
                    <td className="py-3.5 px-4">
                      {v.biddingEnabled ? (
                        <div>
                          <Badge variant="success" className="text-[10px]">
                            Bidding (inDrive)
                          </Badge>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            ₹{v.minFare} – ₹{v.maxFare}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Fixed Algorithm
                        </Badge>
                      )}
                    </td>

                    {/* Weather Bad Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          onClick={() => toggleField(v._id || v.id, 'weatherBad')}
                          title={`Click to ${v.weatherBad ? 'Turn Off' : 'Turn On'} Bad Weather Surge`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs ${v.weatherBad
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                        >
                          <CloudRain className="h-3.5 w-3.5" />
                          <span>{v.weatherBad ? 'Active' : 'Off'}</span>
                        </button>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                          {v.weatherSurgeType === 'multiplier' ? `${v.weatherSurgeValue || 1.25}x` : `+₹${v.weatherSurgeValue || 15}`}
                        </span>
                      </div>
                    </td>

                    {/* Home Visible Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleField(v._id || v.id, 'homeVisible')}
                        title="Toggle Home Carousel Visibility"
                        className={`inline-flex items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-colors ${v.homeVisible
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-800'
                          }`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleField(v._id || v.id, 'status')}
                        title="Toggle Category Active Status"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${v.status
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${v.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {v.status ? 'Active' : 'Draft'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs inline-flex items-center gap-1.5 font-medium border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors rounded-lg shadow-xs"
                          onClick={() =>
                            navigate(`/bike-auto/vehicles/edit/${v._id || v.id || v.customId}`, {
                              state: { vehicle: v },
                            })
                          }
                          title="Edit Vehicle"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-primary" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs inline-flex items-center gap-1.5 font-medium border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors rounded-lg shadow-xs"
                          onClick={() => setVehicleToDelete(v)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          <span>Delete</span>
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

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 animate-scale-in">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Delete Vehicle Permanently
                  </h3>
                  <p className="text-xs text-rose-500 font-medium mt-0.5">
                    Permanent action — cannot be undone
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                <div className="h-10 w-12 rounded-lg bg-white dark:bg-slate-900 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                  {vehicleToDelete.image ? (
                    <img src={resolveImageUrl(vehicleToDelete.image)} alt={vehicleToDelete.name} className="h-8 w-full object-contain" />
                  ) : (
                    <Bike className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{vehicleToDelete.name}</p>
                  <p className="text-xs text-slate-500">
                    ₹{vehicleToDelete.minKmPrice} base • {vehicleToDelete.capacity} seats • {vehicleToDelete.biddingEnabled ? 'Bidding' : 'Fixed'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-900 dark:text-white">"{vehicleToDelete.name}"</span>? This will permanently erase this vehicle category from the system and database.
              </p>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVehicleToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="font-medium bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
                  onClick={confirmDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
