import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDriverStore } from '../../../store/driverStore';
import { useToast } from '../../../components/ui/toaster';
import {
  Search,
  Filter,
  Eye,
  Plus,
  Bike,
  Car,
  Star,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  Smartphone,
  Trash2,
  X,
  Edit,
} from 'lucide-react';

export function BikeAutoDriverListPage() {
  const { drivers, loading, fetchDrivers, toggleDriverStatus, deleteDriver } = useDriverStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchDrivers({ limit: 100 });
  }, [fetchDrivers]);

  const filtered = drivers.filter((drv) => {
    const matchSearch =
      (drv.name || `${drv.firstName || ''} ${drv.lastName || ''}`).toLowerCase().includes(search.toLowerCase()) ||
      (drv.phone || drv.primaryPhone || '').includes(search) ||
      (drv.vehicleNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (drv.id || drv.customId || '').toLowerCase().includes(search.toLowerCase());

    const isBike = (drv.vehicleType || '').toLowerCase().includes('bike') || (drv.vehicleType || '').toLowerCase().includes('scooter');
    const isAuto = (drv.vehicleType || '').toLowerCase().includes('auto');

    const matchVehicle =
      vehicleFilter === 'all' ||
      (vehicleFilter === 'bike' && isBike) ||
      (vehicleFilter === 'auto' && isAuto);

    const isDriverActive = drv.status === true || drv.status === 'active';
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isDriverActive) ||
      (statusFilter === 'inactive' && !isDriverActive);

    const drvSource = drv.createdByType || drv.source || 'self_registered';
    const isFleet = drvSource === 'fleet_operator' || drvSource === 'vendor' || Boolean(drv.vendorId);
    const isAdmin = drvSource === 'admin';
    const isSelf = !isAdmin && !isFleet;

    const matchSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'admin' && isAdmin) ||
      (sourceFilter === 'fleet_operator' && isFleet) ||
      (sourceFilter === 'self_registered' && isSelf);

    return matchSearch && matchVehicle && matchStatus && matchSource;
  });

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to remove driver ${name}?`)) {
      await deleteDriver(id);
      toast({
        title: 'Driver Removed',
        description: `${name} has been removed from the fleet.`,
      });
      if (selectedDriver?.id === id || selectedDriver?._id === id) {
        setSelectedDriver(null);
      }
    }
  };

  const totalDrivers = drivers.length;
  const bikeDrivers = drivers.filter((d) => (d.vehicleType || '').toLowerCase().includes('bike') || (d.vehicleType || '').toLowerCase().includes('scooter')).length;
  const autoDrivers = drivers.filter((d) => (d.vehicleType || '').toLowerCase().includes('auto')).length;
  const activeDrivers = drivers.filter((d) => d.status === true || d.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Bike Auto</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Drivers</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Bike & Auto Drivers
            <Badge variant="outline" className="text-xs font-normal border-primary/40 text-primary">
              {totalDrivers} Total
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage registered bike riders and auto drivers, track KYC approvals, and verify duty status.
          </p>
        </div>

        <Link to="/bike-auto/drivers/add">
          <Button size="sm" className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Driver
          </Button>
        </Link>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Drivers</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalDrivers}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Bike Riders</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{bikeDrivers}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bike className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Auto Pilots</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{autoDrivers}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Accounts</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeDrivers}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search driver name, phone, plate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
              >
                <option value="all">All Vehicles</option>
                <option value="bike">Bikes Only</option>
                <option value="auto">Autos Only</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
              >
                <option value="all">All Sources</option>
                <option value="admin">Created by Admin</option>
                <option value="fleet_operator">Fleet Operator</option>
                <option value="self_registered">Self-Registered</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver List Table / Cards */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Driver</th>
                <th className="py-3 px-4 font-semibold">Vehicle</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Contact & Zone</th>
                <th className="py-3 px-4 font-semibold">Rating / Trips</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No drivers found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((drv) => {
                  const isAuto = (drv.vehicleType || '').toLowerCase().includes('auto');
                  return (
                    <tr key={drv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Driver Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={drv.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={drv.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {drv.name || `${drv.firstName} ${drv.lastName}`}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{drv.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isAuto ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'}`}>
                            {isAuto ? <Car className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{drv.vehicleType}</p>
                            <p className="font-mono text-[11px] text-slate-500">{drv.vehicleNumber}</p>
                          </div>
                        </div>
                      </td>

                      {/* Registration Source */}
                      <td className="py-3.5 px-4">
                        {drv.source === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            Created by Admin
                          </span>
                        ) : (drv.source === 'fleet_operator' || drv.source === 'vendor' || drv.vendorId) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            Fleet Operator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Smartphone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Self-Registered
                          </span>
                        )}
                      </td>

                      {/* Contact & Zone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {drv.primaryCountryCode || '+91'} {drv.primaryPhone || drv.phone}
                          </p>
                          <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {drv.zone || 'Hyderabad Central'}
                          </p>
                        </div>
                      </td>

                      {/* Rating & Trips */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {drv.rating || 5.0}
                          </div>
                          <p className="text-slate-400 text-[11px]">{drv.trips || 0} rides completed</p>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleDriverStatus(drv._id || drv.id);
                            toast({
                              title: `Driver Status Changed`,
                              description: `${drv.name || drv.firstName} is now ${!(drv.status === true || drv.status === 'active') ? 'Active' : 'Inactive'}.`,
                            });
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                            (drv.status === true || drv.status === 'active')
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${(drv.status === true || drv.status === 'active') ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {(drv.status === true || drv.status === 'active') ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedDriver(drv)}
                            title="View Driver Profile"
                            className="h-8 w-8 text-slate-500 hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Link to={`/bike-auto/drivers/edit/${drv._id || drv.id || drv.customId}`} state={{ driver: drv }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Driver Profile"
                              className="h-8 w-8 text-slate-500 hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(drv._id || drv.id, drv.name || drv.firstName)}
                            title="Delete Driver"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Driver Detail Modal / Drawer */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <img
                src={selectedDriver.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                alt={selectedDriver.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary/30"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedDriver.name || `${selectedDriver.firstName} ${selectedDriver.lastName}`}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{selectedDriver.id} • {selectedDriver.nationality || 'Indian'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {selectedDriver.vehicleType}
                  </Badge>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedDriver.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedDriver.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-slate-400 font-medium">Phone</p>
                  <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedDriver.primaryCountryCode || '+91'} {selectedDriver.primaryPhone || selectedDriver.phone}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-slate-400 font-medium">Email</p>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {selectedDriver.email || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-400 font-medium">Vehicle Registration & Details</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedDriver.vehicleNumber} ({selectedDriver.vehicleColor || 'Standard'})
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedDriver.vehiclePreferences) && selectedDriver.vehiclePreferences.length > 0) ? (
                    selectedDriver.vehiclePreferences.map((p) => (
                      <span key={p} className="inline-block bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px]">
                      {selectedDriver.vehiclePreference || 'Standard Amenities'}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-400 font-medium">Bank Account & Settlement</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {selectedDriver.bankName || 'Bank details saved'}
                </p>
                <p className="font-mono text-slate-500 mt-0.5">
                  IBAN/A/C: {selectedDriver.ibanNumber || 'N/A'} • VAT/IFSC: {selectedDriver.vatId || 'N/A'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-400 font-medium">Operating Zone & Address</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {selectedDriver.zone || 'All Zones'}
                </p>
                <p className="text-slate-500 mt-0.5">
                  {selectedDriver.address || 'Address registered on file'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-400 font-medium">Registration Source</p>
                <div className="mt-1">
                  {selectedDriver.source === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Created by Admin
                    </span>
                  ) : (selectedDriver.source === 'fleet_operator' || selectedDriver.source === 'vendor' || selectedDriver.vendorId) ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      <Building2 className="h-3.5 w-3.5" />
                      Fleet Operator ({selectedDriver.vendor || 'Partner'})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <Smartphone className="h-3.5 w-3.5" />
                      Self-Registered (Mobile App)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedDriver(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
