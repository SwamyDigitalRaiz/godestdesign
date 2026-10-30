import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../components/ui/toaster';
import {
  Car,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Navigation,
  Phone,
  ArrowRight,
  RotateCw,
  ShieldCheck,
  UserCheck,
  Users,
  AlertCircle,
  Radio,
  X,
  Wind,
  Luggage,
  Shield,
  Layers
} from 'lucide-react';

const MOCK_CARPOOL_RIDES = [
  {
    id: 'CP-8096',
    vehicleType: 'Sedan Carpool',
    vehicleModel: 'Honda City (White)',
    vehicleNo: 'TS 09 EA 4421',
    host: { name: 'Vikram Reddy', phone: '+91 98480 22341', rating: '4.9 ★', trips: 48 },
    pickup: 'Miyapur Metro Station, Hyderabad',
    drop: 'Benz Circle, Vijayawada',
    routeName: 'NH 65 / Main Expressway',
    pickupCoords: [17.4968, 78.3553],
    dropCoords: [16.5062, 80.6480],
    driverCoords: [17.1500, 79.6200], // Currently near Suryapet
    distance: '275 km',
    duration: '4 hrs 30 mins',
    departureDate: 'Today, 28 Oct',
    departureTime: '04:30 PM',
    seatsCapacity: 4,
    seatsBooked: 3,
    pricePerSeat: 350,
    minPrice: 280,
    maxPrice: 450,
    stopovers: [
      { city: 'Choutuppal Toll', km: '55 km', time: '05:30 PM', coords: [17.2470, 78.9056] },
      { city: 'Suryapet Bypass', km: '135 km', time: '06:45 PM', coords: [17.1439, 79.6239] },
      { city: 'Kodad Junction', km: '180 km', time: '07:30 PM', coords: [16.9959, 79.9674] },
      { city: 'Nandigama Toll', km: '225 km', time: '08:15 PM', coords: [16.7680, 80.2925] }
    ],
    amenities: {
      ac: true,
      maxTwoRear: true,
      instantBook: true,
      ladiesOnly: false,
      luggageSize: 'Medium',
      smoking: false
    },
    passengers: [
      { name: 'Kiran Kumar', phone: '+91 98765 43210', seats: 1, fare: 350, otp: '4821', boardingPoint: 'Miyapur Metro', droppingPoint: 'Benz Circle, Vijayawada', status: 'On Board', verifiedOtp: true },
      { name: 'Sravani P', phone: '+91 99887 76655', seats: 1, fare: 250, otp: '1942', boardingPoint: 'Miyapur Metro', droppingPoint: 'Suryapet Bypass', status: 'On Board', verifiedOtp: true },
      { name: 'Ramesh V', phone: '+91 98481 12233', seats: 1, fare: 200, otp: '7729', boardingPoint: 'Suryapet Bypass', droppingPoint: 'Benz Circle, Vijayawada', status: 'Booked', verifiedOtp: false },
    ],
    fare: '₹800',
    fareDetails: '3 seats booked (1 seat left)',
    status: 'passengers_on_board', // 'requested', 'accepted', 'host_started', 'passengers_on_board', 'completed', 'cancelled'
    timeAgo: 'Just now',
  },
  {
    id: 'CP-8095',
    vehicleType: 'SUV Carpool',
    vehicleModel: 'Hyundai Creta (Silver)',
    vehicleNo: 'TS 07 HK 9081',
    host: { name: 'Ananya Sharma', phone: '+91 97001 55667', rating: '4.95 ★', trips: 62 },
    pickup: 'Gachibowli Bio-Diversity, Hyderabad',
    drop: 'Hanamkonda Bus Stand, Warangal',
    routeName: 'NH 163 (via Jangaon & Aler)',
    pickupCoords: [17.4435, 78.3772],
    dropCoords: [17.9689, 79.5941],
    driverCoords: [17.5500, 78.6800],
    distance: '150 km',
    duration: '2 hrs 45 mins',
    departureDate: 'Tomorrow, 29 Oct',
    departureTime: '07:00 AM',
    seatsCapacity: 4,
    seatsBooked: 2,
    pricePerSeat: 275,
    minPrice: 220,
    maxPrice: 350,
    stopovers: [
      { city: 'Bhongir Fort Road', km: '48 km', time: '07:50 AM', coords: [17.5113, 78.8889] },
      { city: 'Jangaon Bypass', km: '85 km', time: '08:30 AM', coords: [17.7231, 79.1557] }
    ],
    amenities: {
      ac: true,
      maxTwoRear: true,
      instantBook: true,
      ladiesOnly: true,
      luggageSize: 'Large',
      smoking: false
    },
    passengers: [
      { name: 'Rohit Verma', phone: '+91 91234 56789', seats: 2, fare: 550, otp: '6610', boardingPoint: 'Gachibowli', droppingPoint: 'Hanamkonda', status: 'Accepted', verifiedOtp: false },
    ],
    fare: '₹550',
    fareDetails: '2 seats booked (2 seats left)',
    status: 'accepted',
    timeAgo: '12 mins ago',
  },
  {
    id: 'CP-8094',
    vehicleType: 'Sedan Carpool',
    vehicleModel: 'Maruti Dzire (Grey)',
    vehicleNo: 'AP 16 CK 1245',
    host: { name: 'Rajesh Naidu', phone: '+91 96521 88990', rating: '4.8 ★', trips: 29 },
    pickup: 'LB Nagar Ring Road, Hyderabad',
    drop: 'Khammam New Bus Stand',
    routeName: 'via Suryapet & Kusumanchi',
    pickupCoords: [17.3457, 78.5522],
    dropCoords: [17.2473, 80.1514],
    driverCoords: [17.3457, 78.5522],
    distance: '198 km',
    duration: '3 hrs 20 mins',
    departureDate: 'Today, 28 Oct',
    departureTime: '02:00 PM',
    seatsCapacity: 4,
    seatsBooked: 1,
    pricePerSeat: 350,
    minPrice: 280,
    maxPrice: 420,
    stopovers: [
      { city: 'Suryapet Cross', km: '120 km', time: '03:45 PM', coords: [17.1439, 79.6239] }
    ],
    amenities: {
      ac: true,
      maxTwoRear: false,
      instantBook: false,
      ladiesOnly: false,
      luggageSize: 'Medium',
      smoking: false
    },
    passengers: [
      { name: 'Harish Rao', phone: '+91 98877 11223', seats: 1, fare: 350, otp: '5512', boardingPoint: 'LB Nagar', droppingPoint: 'Khammam', status: 'Host Started', verifiedOtp: false },
    ],
    fare: '₹350',
    fareDetails: '1 seat booked (3 seats left)',
    status: 'host_started',
    timeAgo: '24 mins ago',
  },
  {
    id: 'CP-8093',
    vehicleType: 'Hatchback Carpool',
    vehicleModel: 'Tata Altroz (Gold)',
    vehicleNo: 'TS 08 EF 7761',
    host: { name: 'Sunil Verma', phone: '+91 99123 44556', rating: '4.7 ★', trips: 18 },
    pickup: 'Kukatpally Housing Board, Hyderabad',
    drop: 'Nizamabad Central Station',
    routeName: 'NH 44 (via Medchal & Kamareddy)',
    pickupCoords: [17.4933, 78.4011],
    dropCoords: [18.6725, 78.0941],
    driverCoords: [18.6725, 78.0941],
    distance: '175 km',
    duration: '3 hrs 10 mins',
    departureDate: 'Yesterday, 27 Oct',
    departureTime: '09:30 AM',
    seatsCapacity: 3,
    seatsBooked: 3,
    pricePerSeat: 300,
    minPrice: 250,
    maxPrice: 380,
    stopovers: [
      { city: 'Kamareddy Bypass', km: '115 km', time: '11:15 AM', coords: [18.3228, 78.3392] }
    ],
    amenities: {
      ac: true,
      maxTwoRear: true,
      instantBook: true,
      ladiesOnly: false,
      luggageSize: 'Small',
      smoking: false
    },
    passengers: [
      { name: 'Deepak G', phone: '+91 90001 23456', seats: 2, fare: 600, otp: '1092', boardingPoint: 'Kukatpally', droppingPoint: 'Nizamabad', status: 'Completed', verifiedOtp: true },
      { name: 'Suman A', phone: '+91 98888 22211', seats: 1, fare: 300, otp: '7721', boardingPoint: 'Kukatpally', droppingPoint: 'Kamareddy Bypass', status: 'Completed', verifiedOtp: true },
    ],
    fare: '₹900',
    fareDetails: '3 seats filled (Trip Completed)',
    status: 'completed',
    timeAgo: 'Yesterday',
  },
  {
    id: 'CP-8092',
    vehicleType: 'Sedan Carpool',
    vehicleModel: 'Hyundai Verna (Black)',
    vehicleNo: 'TS 10 AB 9988',
    host: { name: 'Praveen K', phone: '+91 97777 33322', rating: '4.6 ★', trips: 14 },
    pickup: 'Secunderabad Railway Station',
    drop: 'Karimnagar Bus Depot',
    routeName: 'SH 1 / Rajiv Rahadari',
    pickupCoords: [17.4399, 78.4983],
    dropCoords: [18.4386, 79.1288],
    driverCoords: null,
    distance: '162 km',
    duration: '3 hrs',
    departureDate: 'Today, 28 Oct',
    departureTime: '11:00 AM',
    seatsCapacity: 4,
    seatsBooked: 0,
    pricePerSeat: 320,
    minPrice: 250,
    maxPrice: 400,
    stopovers: [
      { city: 'Siddipet Bypass', km: '100 km', time: '12:45 PM', coords: [18.1018, 78.8520] }
    ],
    amenities: {
      ac: false,
      maxTwoRear: true,
      instantBook: false,
      ladiesOnly: false,
      luggageSize: 'Medium',
      smoking: false
    },
    passengers: [],
    fare: '₹0',
    fareDetails: '0 bookings before departure',
    status: 'cancelled',
    timeAgo: '2 hrs ago',
  },
];

export function CarpoolBookingsPage() {
  const { toast } = useToast();
  const [rides, setRides] = useState(MOCK_CARPOOL_RIDES);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [trackingRide, setTrackingRide] = useState(null);

  // Map refs for Route tracking modal
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Status counts
  const counts = {
    all: rides.length,
    requested: rides.filter((r) => r.status === 'requested').length,
    ongoing: rides.filter((r) => ['accepted', 'host_started', 'passengers_on_board'].includes(r.status)).length,
    completed: rides.filter((r) => r.status === 'completed').length,
    cancelled: rides.filter((r) => r.status === 'cancelled').length,
  };

  const filtered = rides.filter((ride) => {
    const q = search.toLowerCase();
    const matchSearch =
      ride.id.toLowerCase().includes(q) ||
      ride.host.name.toLowerCase().includes(q) ||
      ride.pickup.toLowerCase().includes(q) ||
      ride.drop.toLowerCase().includes(q) ||
      ride.routeName.toLowerCase().includes(q) ||
      ride.stopovers.some((s) => s.city.toLowerCase().includes(q)) ||
      ride.passengers.some((p) => p.name.toLowerCase().includes(q));

    let matchStatus = true;
    if (statusFilter === 'requested') matchStatus = ride.status === 'requested';
    if (statusFilter === 'ongoing') matchStatus = ['accepted', 'host_started', 'passengers_on_board'].includes(ride.status);
    if (statusFilter === 'completed') matchStatus = ride.status === 'completed';
    if (statusFilter === 'cancelled') matchStatus = ride.status === 'cancelled';

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Requested</span>;
      case 'accepted':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">Host Accepted</span>;
      case 'host_started':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">Host Started</span>;
      case 'passengers_on_board':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">On Board (En Route)</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Map effect for Live Route + Stopovers tracking
  useEffect(() => {
    if (!trackingRide || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: trackingRide.pickupCoords,
      zoom: 8,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // 1. Pickup Marker
    L.marker(trackingRide.pickupCoords, {
      icon: L.divIcon({
        className: 'pickup-marker',
        html: `<div style="background-color: #16A34A; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 13px;">P</div>`,
        iconSize: [28, 28],
      }),
    }).addTo(map).bindPopup(`<b>Pickup:</b> ${trackingRide.pickup}<br/><small>Departure: ${trackingRide.departureTime}</small>`);

    // 2. Stopover Waypoint Markers
    const waypoints = [trackingRide.pickupCoords];
    trackingRide.stopovers.forEach((stop, idx) => {
      waypoints.push(stop.coords);
      L.marker(stop.coords, {
        icon: L.divIcon({
          className: 'stopover-marker',
          html: `<div style="background-color: #F59E0B; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 11px;">S${idx+1}</div>`,
          iconSize: [24, 24],
        }),
      }).addTo(map).bindPopup(`<b>Stopover ${idx+1}:</b> ${stop.city}<br/><small>Distance: ${stop.km} • ETA: ${stop.time}</small>`);
    });
    waypoints.push(trackingRide.dropCoords);

    // 3. Dropoff Marker
    L.marker(trackingRide.dropCoords, {
      icon: L.divIcon({
        className: 'drop-marker',
        html: `<div style="background-color: #DC2626; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 13px;">D</div>`,
        iconSize: [28, 28],
      }),
    }).addTo(map).bindPopup(`<b>Dropoff:</b> ${trackingRide.drop}<br/><small>Total: ${trackingRide.distance}</small>`);

    // 4. Live Host Vehicle Location
    if (trackingRide.driverCoords) {
      L.marker(trackingRide.driverCoords, {
        icon: L.divIcon({
          className: 'driver-car-marker',
          html: `<div style="background-color: #1D4ED8; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); font-size: 16px;">🚗</div>`,
          iconSize: [32, 32],
        }),
      }).addTo(map).bindPopup(`<b>Live Host:</b> ${trackingRide.host.name} (${trackingRide.vehicleNo})<br/><small>En route with co-passengers</small>`);
    }

    // 5. Polyline connecting route
    const line = L.polyline(waypoints, {
      color: '#1D4ED8',
      weight: 4,
      dashArray: '6, 6',
    }).addTo(map);

    map.fitBounds(line.getBounds(), { padding: [50, 50] });
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trackingRide]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Car Pool</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Carpool Bookings & Trips</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="h-7 w-7 text-primary" />
            Car Pool Bookings, Routes & Live Manifest
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time intercity carpool tracking, chosen highway routes, stopover waypoints, boarding OTPs, and co-passenger manifests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/carpool/amenities">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Amenities
            </Button>
          </Link>
          <Link to="/carpool/pricing">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              Price Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'requested' ? 'all' : 'requested')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'requested'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Requested
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.requested}</p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'ongoing' ? 'all' : 'ongoing')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ongoing'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Ongoing Rides
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.ongoing}</p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Completed Rides
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.completed}</p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'cancelled'
              ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5" />
              Cancelled Rides
            </span>
            <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{counts.cancelled}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search ride ID, route, stopover, host, passenger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'All Rides', count: counts.all },
              { key: 'requested', label: 'Requests', count: counts.requested },
              { key: 'ongoing', label: 'Ongoing', count: counts.ongoing },
              { key: 'completed', label: 'Completed', count: counts.completed },
              { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  statusFilter === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      statusFilter === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Ride ID</th>
                <th className="py-3 px-4">Highway Route & Stopovers</th>
                <th className="py-3 px-4">Host & Vehicle</th>
                <th className="py-3 px-4">Seats & Cabin Rules</th>
                <th className="py-3 px-4">Co-Passengers</th>
                <th className="py-3 px-4">Rate & Pool Collected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((ride) => (
                <tr key={ride.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {ride.id}
                    <div className="text-[10px] text-slate-400 font-sans font-normal">{ride.timeAgo}</div>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="truncate">{ride.pickup}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="truncate">{ride.drop}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {ride.routeName}
                      </span>
                      {ride.stopovers.length > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          +{ride.stopovers.length} Stopovers
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ride.distance} • {ride.duration} • {ride.departureDate}, {ride.departureTime}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      {ride.host.name}
                      <span className="text-[10px] px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {ride.host.rating}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{ride.host.phone}</div>
                    <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {ride.vehicleModel}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{ride.vehicleNo}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {ride.seatsBooked} / {ride.seatsCapacity} Seats
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          ride.seatsCapacity - ride.seatsBooked === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {ride.seatsCapacity - ride.seatsBooked === 0
                          ? 'Full'
                          : `${ride.seatsCapacity - ride.seatsBooked} Left`}
                      </span>
                    </div>

                    <div className="w-24 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${(ride.seatsBooked / ride.seatsCapacity) * 100}%` }}
                      />
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ride.amenities.ac && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">AC</span>
                      )}
                      {ride.amenities.maxTwoRear && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">Max 2 Back</span>
                      )}
                      {ride.amenities.ladiesOnly && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">Ladies Only</span>
                      )}
                      {ride.amenities.instantBook && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Instant</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {ride.passengers.length === 0 ? (
                      <span className="text-slate-400 text-xs italic">No co-passengers</span>
                    ) : (
                      <div className="space-y-1">
                        {ride.passengers.map((p, pIdx) => (
                          <div key={pIdx} className="text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                            <span className="text-[10px] text-slate-500 ml-1">({p.seats} seat • ₹{p.fare})</span>
                            <div className="text-[10px] font-mono text-primary font-bold">
                              OTP: {p.otp} {p.verifiedOtp ? '✓' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {ride.fare}
                    </div>
                    <div className="text-[11px] text-slate-500">₹{ride.pricePerSeat}/seat base</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      Host Net: ₹{Math.round(parseInt(ride.fare.replace('₹', '') || 0) * 0.9)} (10% comm)
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {getStatusBadge(ride.status)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTrackingRide(ride)}
                        className="h-8 px-2 text-xs flex items-center gap-1 text-primary border-primary/30 hover:bg-primary/5"
                        title="Live Route & Stopovers Map"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Map
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRide(ride)}
                        className="h-8 px-2 text-xs flex items-center gap-1 text-slate-500 hover:text-primary"
                        title="Manifest Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Route & Live GPS Tracking Modal */}
      {trackingRide && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  Live Route & Stopovers Tracking: {trackingRide.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route: <b className="text-slate-700 dark:text-slate-300">{trackingRide.routeName}</b> ({trackingRide.distance} • {trackingRide.duration}) • Host: {trackingRide.host.name} ({trackingRide.vehicleNo})
                </p>
              </div>
              <button
                onClick={() => setTrackingRide(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[420px] w-full relative" ref={mapContainerRef} />

            <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-3 w-3 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">P</span>
                  Pickup ({trackingRide.pickup.split(',')[0]})
                </span>
                {trackingRide.stopovers.map((s, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                    <span className="h-3 w-3 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">S{idx+1}</span>
                    {s.city} ({s.km})
                  </span>
                ))}
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-3 w-3 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">D</span>
                  Drop ({trackingRide.drop.split(',')[0]})
                </span>
              </div>
              <Button size="sm" onClick={() => setTrackingRide(null)}>
                Close Tracking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manifest & Passenger Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Carpool Manifest & Route Itinerary: {selectedRide.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRide.pickup} → {selectedRide.drop}
                </p>
              </div>
              {getStatusBadge(selectedRide.status)}
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Host Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">Host (Driver) Profile</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                    {selectedRide.host.name}
                    <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">
                      {selectedRide.host.rating}
                    </span>
                    <span className="text-xs text-slate-400">({selectedRide.host.trips} verified trips)</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Vehicle: <b>{selectedRide.vehicleModel}</b> • Plate: <span className="font-mono">{selectedRide.vehicleNo}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {selectedRide.host.phone}
                  </div>
                </div>

                <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-xs text-slate-500">Pool Earnings Summary</div>
                  <div className="text-lg font-bold text-primary mt-0.5">{selectedRide.fare}</div>
                  <div className="text-xs text-slate-500 mt-0.5">₹{selectedRide.pricePerSeat} / seat</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    Platform Commission: 10%
                  </div>
                </div>
              </div>

              {/* Route & Stopovers Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  Route & Stopovers Itinerary ({selectedRide.routeName})
                </h4>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border space-y-3">
                  {/* Origin */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {selectedRide.pickup}
                      </div>
                      <div className="text-[11px] text-slate-500">Departure Point • {selectedRide.departureDate}, {selectedRide.departureTime}</div>
                    </div>
                  </div>

                  {/* Stopovers */}
                  {selectedRide.stopovers.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-3 pl-0.5">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-white shadow-sm shrink-0 ml-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {s.city} (Stopover {idx+1})
                        </div>
                        <div className="text-[11px] text-slate-500">Distance from Origin: {s.km} • Estimated Passage: {s.time}</div>
                      </div>
                    </div>
                  ))}

                  {/* Destination */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {selectedRide.drop}
                      </div>
                      <div className="text-[11px] text-slate-500">Final Destination • Total Journey: {selectedRide.distance} ({selectedRide.duration})</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cabin Amenities & Rules */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Cabin Preferences & Amenities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                    <div className="text-[10px] text-slate-400">Air Conditioning</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedRide.amenities.ac ? 'AC Active' : 'No AC'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                    <div className="text-[10px] text-slate-400">Rear Seating</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedRide.amenities.maxTwoRear ? 'Max 2 in Rear' : 'Standard 3'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                    <div className="text-[10px] text-slate-400">Luggage Allowed</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedRide.amenities.luggageSize} Trunk
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                    <div className="text-[10px] text-slate-400">Gender Policy</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedRide.amenities.ladiesOnly ? 'Ladies Only' : 'All Welcome'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passengers on board */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Co-Passengers on Board ({selectedRide.passengers.length} Booked • {selectedRide.seatsCapacity - selectedRide.seatsBooked} Remaining)
                </h4>

                {selectedRide.passengers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
                    No co-passengers registered for this carpool yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRide.passengers.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            {p.name}
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-bold">
                              {p.seats} {p.seats === 1 ? 'Seat' : 'Seats'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded font-bold">
                              {p.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{p.phone}</div>
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                            Boarding: <b>{p.boardingPoint}</b> → Dropping: <b>{p.droppingPoint}</b>
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">Fare Paid: ₹{p.fare}</div>
                          <div className="text-[11px] font-mono text-primary font-bold mt-0.5">
                            Boarding OTP: {p.otp} {p.verifiedOtp ? '✓ (Verified)' : '(Pending)'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedRide(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
