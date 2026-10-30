import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Bus,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Server,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';

const mockBusBookings = [
  {
    id: 'BUS-8910',
    pnr: 'BITLA-HYD-99182',
    apiProvider: 'Bitla API',
    operator: 'Orange Tours & Travels',
    busType: 'Scania Multi-Axle AC Sleeper (2+1)',
    route: 'Hyderabad → Bangalore',
    boarding: 'Ameerpet (21:30)',
    drop: 'Majestic Anand Rao Circle (06:00)',
    seats: ['U3', 'U4'],
    passenger: { name: 'Sai Teja', phone: '+91 98490 12345' },
    totalFare: '₹2,350',
    platformCommission: '₹210',
    status: 'confirmed',
    bookingTime: 'Today, 14:20',
  },
  {
    id: 'BUS-8911',
    pnr: 'ABHI-VJA-44120',
    apiProvider: 'AbhiBus API',
    operator: 'Morning Star Travels',
    busType: 'Volvo 9600 A/C Semi-Sleeper (2+2)',
    route: 'Hyderabad → Vijayawada',
    boarding: 'LB Nagar (22:15)',
    drop: 'Benz Circle (03:45)',
    seats: ['L12'],
    passenger: { name: 'Kavitha Devi', phone: '+91 97000 88991' },
    totalFare: '₹890',
    platformCommission: '₹80',
    status: 'confirmed',
    bookingTime: 'Today, 11:05',
  },
  {
    id: 'BUS-8912',
    pnr: 'REDBUS-VIZ-11094',
    apiProvider: 'RedBus API',
    operator: 'Kaveri Travels',
    busType: 'BharatBenz AC Sleeper (2+1)',
    route: 'Hyderabad → Visakhapatnam',
    boarding: 'Miyapur (19:45)',
    drop: 'Gurudwara Junction (07:30)',
    seats: ['U8', 'U9'],
    passenger: { name: 'Praveen Chary', phone: '+91 99123 44556' },
    totalFare: '₹2,900',
    platformCommission: '₹260',
    status: 'confirmed',
    bookingTime: 'Yesterday, 19:10',
  },
  {
    id: 'BUS-8913',
    pnr: 'BITLA-TIR-66701',
    apiProvider: 'Bitla API',
    operator: 'SRS Travels',
    busType: 'Non-AC Seater / Sleeper',
    route: 'Hyderabad → Tirupati',
    boarding: 'Kacheguda (20:00)',
    drop: 'Alipiri Road (06:30)',
    seats: ['L5'],
    passenger: { name: 'V. Ramanujam', phone: '+91 94401 22334' },
    totalFare: '₹750',
    platformCommission: '₹65',
    status: 'cancelled',
    bookingTime: '13 Oct, 16:40',
  },
];

export function BusBookingsPage() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBus, setSelectedBus] = useState(null);

  const filtered = mockBusBookings.filter((b) => {
    const matchSearch =
      b.pnr.toLowerCase().includes(search.toLowerCase()) ||
      b.operator.toLowerCase().includes(search.toLowerCase()) ||
      b.route.toLowerCase().includes(search.toLowerCase()) ||
      b.passenger.name.toLowerCase().includes(search.toLowerCase());

    const matchProvider = providerFilter === 'all' || b.apiProvider.toLowerCase().includes(providerFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchSearch && matchProvider && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold">
              <Bus className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Private Bus Bookings (3rd-Party APIs)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated private bus ticket inventory integrated via Bitla, AbhiBus, and RedBus APIs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Sync API Bookings
          </Button>
        </div>
      </div>

      {/* API Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Bitla Direct Connect</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">Live • Latency 140ms</span>
                </div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">RedBus Aggregator</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">Live • Latency 190ms</span>
                </div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">AbhiBus B2B Gateway</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">Live • Latency 115ms</span>
                </div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search PNR, Bus Operator, route, passenger..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All API Providers</option>
                <option value="bitla">Bitla API</option>
                <option value="redbus">RedBus API</option>
                <option value="abhibus">AbhiBus API</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking & PNR</th>
                <th className="py-3 px-4 font-semibold">API Provider</th>
                <th className="py-3 px-4 font-semibold">Bus Operator & Type</th>
                <th className="py-3 px-4 font-semibold">Route & Timing</th>
                <th className="py-3 px-4 font-semibold">Seats</th>
                <th className="py-3 px-4 font-semibold">Passenger</th>
                <th className="py-3 px-4 font-semibold">Fare (Commission)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-bold text-xs text-blue-600 dark:text-blue-400">{b.pnr}</p>
                    <p className="text-[11px] text-slate-400">{b.id}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {b.apiProvider}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{b.operator}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{b.busType}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{b.route}</p>
                      <p className="text-[11px] text-slate-400">{b.boarding}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex gap-1">
                      {b.seats.map((st, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {st}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs">
                      <p className="font-medium text-slate-900 dark:text-white">{b.passenger.name}</p>
                      <p className="text-[11px] text-slate-500">{b.passenger.phone}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{b.totalFare}</p>
                      <p className="text-[11px] text-emerald-600 font-medium">+{b.platformCommission}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={b.status === 'confirmed' ? 'success' : 'destructive'} className="capitalize">
                      {b.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedBus(b)}
                      title="View Bus Ticket Details"
                    >
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bus Details Modal */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border-slate-200 dark:border-slate-800 animate-scale-in">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">PNR: {selectedBus.pnr}</h3>
                    <p className="text-xs text-slate-500">{selectedBus.operator} • Via {selectedBus.apiProvider}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-400">Route</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedBus.route}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-400">Seats</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedBus.seats.join(', ')}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-400">Boarding Point</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedBus.boarding}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-400">Dropping Point</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedBus.drop}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  <span className="text-slate-400">Total Ticket Fare: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedBus.totalFare}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedBus(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
