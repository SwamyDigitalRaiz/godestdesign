import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toaster';
import tripInquiryService from '../../services/tripInquiryService';
import getAdminSocket from '../../services/socketService';
import {
  Search,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Zap,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  Phone,
  Trash2,
  Car,
  Bike,
  Sparkles,
} from 'lucide-react';

export function TripSearchesPage() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalToday: 0,
    bookedToday: 0,
    choosingNow: 0,
    conversionRate: '0.0%',
  });

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tripInquiryService.getInquiries({
        status: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery.trim() || undefined,
      });

      if (res.success && res.data) {
        setInquiries(res.data.inquiries || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch trip inquiries:', err);
      toast({
        title: 'Fetch Error',
        description: err.response?.data?.message || 'Could not load trip searches.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, toast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Real-time socket listener for incoming trip inquiries
  useEffect(() => {
    const socket = getAdminSocket();

    const handleNewInquiry = (newInquiry) => {
      setInquiries((prev) => {
        // Prevent duplicate entries
        const exists = prev.some(
          (item) => item.id === newInquiry.id || item._id === newInquiry._id
        );
        if (exists) return prev;
        return [newInquiry, ...prev];
      });

      setStats((prev) => ({
        ...prev,
        totalToday: prev.totalToday + 1,
        choosingNow: prev.choosingNow + 1,
      }));

      toast({
        title: 'New Trip Search',
        description: `${newInquiry.userName || 'A user'} is choosing a ride to ${newInquiry.dropAddress?.slice(0, 30)}...`,
      });
    };

    const handleUpdatedInquiry = (updated) => {
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === updated.id || item._id === updated._id
            ? { ...item, ...updated }
            : item
        )
      );

      if (updated.status === 'booked') {
        setStats((prev) => ({
          ...prev,
          bookedToday: prev.bookedToday + 1,
          choosingNow: Math.max(0, prev.choosingNow - 1),
        }));
      }
    };

    socket.on('admin:trip-inquiry:new', handleNewInquiry);
    socket.on('admin:trip-inquiry:updated', handleUpdatedInquiry);

    return () => {
      socket.off('admin:trip-inquiry:new', handleNewInquiry);
      socket.off('admin:trip-inquiry:updated', handleUpdatedInquiry);
    };
  }, [toast]);

  const handleDelete = async (id) => {
    try {
      await tripInquiryService.deleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i.id !== id && i._id !== id));
      toast({
        title: 'Inquiry Removed',
        description: 'Trip search record deleted successfully.',
      });
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || 'Could not delete record.',
        variant: 'destructive',
      });
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (inq.userName && inq.userName.toLowerCase().includes(q)) ||
        (inq.userPhone && inq.userPhone.includes(q)) ||
        (inq.pickupAddress && inq.pickupAddress.toLowerCase().includes(q)) ||
        (inq.dropAddress && inq.dropAddress.toLowerCase().includes(q))
      );
    });
  }, [inquiries, searchQuery]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Trip Searches & Inquiries
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of users searching destinations and selecting vehicles before ride confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInquiries}
            disabled={loading}
            className="gap-2"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Searches Today
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalToday}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Destination searches initiated
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600">
              <Compass className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Choosing Ride Now
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {stats.choosingNow}
              </h3>
              <p className="text-xs text-amber-700 font-medium mt-1">
                Active in ride picker screen
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Converted to Booked
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {stats.bookedToday}
              </h3>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Rides requested from searches
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600">
              <Zap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Conversion Rate
              </p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                {stats.conversionRate}
              </h3>
              <p className="text-xs text-indigo-700 font-medium mt-1">
                Search to booking ratio
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredInquiries.length} Recent Inquiries
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user, phone or place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </div>

      {/* ── Searches Table Card ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Pickup Location</th>
                <th className="py-3 px-4">Destination Searched</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Searched Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RotateCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading real-time searches...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Compass className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No destination searches found for this filter.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id || inq._id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* User */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs uppercase">
                          {(inq.userName || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {inq.userName || 'App Customer'}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {inq.userPhone || 'No Phone'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Pickup */}
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="flex items-start gap-1.5 text-xs text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <span className="truncate" title={inq.pickupAddress}>
                          {inq.pickupAddress}
                        </span>
                      </div>
                    </td>

                    {/* Drop */}
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="flex items-start gap-1.5 text-xs font-medium text-slate-900">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="truncate" title={inq.dropAddress}>
                          {inq.dropAddress}
                        </span>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <span className="font-semibold text-slate-900 text-sm">
                        {inq.distanceKm || 5.0} km
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      {formatTimeAgo(inq.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inq.id || inq._id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete inquiry record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default TripSearchesPage;
