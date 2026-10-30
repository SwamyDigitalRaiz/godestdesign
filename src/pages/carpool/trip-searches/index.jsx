import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Car
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const MOCK_SEARCHES = [
  {
    id: 'SRCH-101',
    user: { name: 'Sai Teja', phone: '+91 98490 11223' },
    origin: 'Hitech City, Hyderabad',
    destination: 'Benz Circle, Vijayawada',
    date: 'Today, Evening',
    seats: 2,
    preferences: ['AC Cabin', 'Instant Book', 'Max ₹400/seat'],
    matchedRide: 'Matched: CP-8096 (NH 65 Expressway)',
    status: 'Booked (CP-8096)',
    timeAgo: '4 mins ago',
  },
  {
    id: 'SRCH-102',
    user: { name: 'Pooja Rani', phone: '+91 97012 33445' },
    origin: 'Kukatpally, Hyderabad',
    destination: 'Hanamkonda, Warangal',
    date: 'Tomorrow, Morning',
    seats: 1,
    preferences: ['Ladies Only', 'AC Cabin', 'Max 2 in Rear'],
    matchedRide: 'Matched: CP-8095 (NH 163)',
    status: 'Comparing Offers',
    timeAgo: '12 mins ago',
  },
  {
    id: 'SRCH-103',
    user: { name: 'Raghav Rao', phone: '+91 99890 55667' },
    origin: 'Suryapet Bypass (Stopover)',
    destination: 'Benz Circle, Vijayawada',
    date: 'Today, 06:45 PM',
    seats: 1,
    preferences: ['Intermediate Stopover Pick', 'Cash / UPI'],
    matchedRide: 'Matched: CP-8096 (Stopover 2)',
    status: 'Boarding at Stopover',
    timeAgo: '18 mins ago',
  },
  {
    id: 'SRCH-104',
    user: { name: 'Anil Reddy', phone: '+91 99890 55667' },
    origin: 'Secunderabad Station',
    destination: 'Nizamabad Old Bus Stand',
    date: 'Today, 06:00 PM',
    seats: 3,
    preferences: ['3 Seats Required', 'Any Car'],
    matchedRide: 'No Host Available on NH 44',
    status: 'No Direct Host (Unmet Demand)',
    timeAgo: '28 mins ago',
  },
  {
    id: 'SRCH-105',
    user: { name: 'Arjun Das', phone: '+91 91212 77889' },
    origin: 'Gachibowli, Hyderabad',
    destination: 'Silk Board, Bengaluru',
    date: 'Friday, 08:00 PM',
    seats: 1,
    preferences: ['Night Departure', 'AC Cabin', 'Large Luggage'],
    matchedRide: 'Under Negotiation',
    status: 'Negotiating Fare (Offered ₹750)',
    timeAgo: '45 mins ago',
  },
];

export function CarpoolTripSearchesPage() {
  const [searches] = useState(MOCK_SEARCHES);
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = searches.filter((s) => {
    const q = filterQuery.toLowerCase();
    return (
      s.user.name.toLowerCase().includes(q) ||
      s.user.phone.includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Car Pool</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Trip Searches & Demand</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="h-7 w-7 text-primary" />
            Carpool Route Searches & Demand Stream
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time feed of passengers searching for intercity carpool routes, seat requirements, and unmet route demand.
          </p>
        </div>

        <Link to="/carpool/bookings">
          <Button variant="outline" size="sm">
            View Live Bookings
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 shadow-sm border-l-4 border-l-primary">
          <p className="text-xs font-semibold text-slate-500 uppercase">Searches Today</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142 Inquiries</h3>
          <p className="text-xs text-primary font-medium mt-0.5">Top: Hyderabad → Vijayawada</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Conversion to Booked</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">48.6%</h3>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">69 seats confirmed today</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Unmet Route Demand</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">24 Searches</h3>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Notify verified hosts to publish</p>
        </Card>
      </div>

      {/* Searches List */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search passenger, phone, corridor..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 uppercase font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Corridor Searched</th>
                <th className="py-3 px-4">Travel Date</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Status & Inquiry</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{s.user.name}</div>
                    <div className="text-[11px] text-slate-500">{s.user.phone}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-slate-100">
                      <span>{s.origin}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{s.destination}</span>
                    </div>
                    {s.preferences && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.preferences.map((p, pIdx) => (
                          <span key={pIdx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {s.date}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {s.seats} {s.seats === 1 ? 'Seat' : 'Seats'}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status.includes('Booked') || s.status.includes('Boarding')
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status.includes('Unmet')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.status}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{s.matchedRide}</div>
                  </td>

                  <td className="py-3 px-4 text-right text-slate-500">
                    {s.timeAgo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

