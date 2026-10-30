import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  UserCheck,
  DollarSign,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Activity,
  Wallet,
  ShieldAlert,
  TrendingUp,
  CreditCard,
  IndianRupee,
  CalendarDays,
  Car,
  Bike,
  Bus,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { THEME_CONFIG } from '../../config/theme';

// Stores
import { useUserStore } from '../../store/userStore';
import { useDriverStore } from '../../store/driverStore';
import { useFleetOperatorStore } from '../../store/fleetOperatorStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useZoneStore } from '../../store/zoneStore';
import { useSupportStore } from '../../store/supportStore';
import { useReportStore } from '../../store/reportStore';

// Formatting utilities matching Solo Hearts
const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatCurrencyFull = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Reusable KPI Card (exact Solo Hearts layout & styling)
function KPICard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection,
  colorClass,
  iconColorClass,
}) {
  if (!Icon) return null;

  return (
    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1.5">
                {trendDirection === 'down' ? (
                  <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    trendDirection === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  )}
                >
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0',
              colorClass
            )}
          >
            <Icon className={cn('h-6 w-6', iconColorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chart datasets per timeframe
const DATASETS = {
  today: {
    revenueTrend: [
      { date: '06:00', revenue: 6200, payouts: 4960, recharges: 3800, subscriptions: 2400 },
      { date: '09:00', revenue: 18400, payouts: 14720, recharges: 11200, subscriptions: 7200 },
      { date: '12:00', revenue: 14200, payouts: 11360, recharges: 8900, subscriptions: 5300 },
      { date: '15:00', revenue: 16800, payouts: 13440, recharges: 10400, subscriptions: 6400 },
      { date: '18:00', revenue: 26500, payouts: 21200, recharges: 16500, subscriptions: 10000 },
      { date: '21:00', revenue: 19800, payouts: 15840, recharges: 12400, subscriptions: 7400 },
    ],
    dailyRides: [
      { date: '06:00', count: 48 },
      { date: '09:00', count: 182 },
      { date: '12:00', count: 124 },
      { date: '15:00', count: 146 },
      { date: '18:00', count: 248 },
      { date: '21:00', count: 164 },
    ],
    revenueSources: [
      { date: '06:00', bike: 2200, auto: 3400, bus: 600 },
      { date: '09:00', bike: 6400, auto: 9800, bus: 2200 },
      { date: '12:00', bike: 4900, auto: 7800, bus: 1500 },
      { date: '15:00', bike: 5800, auto: 9200, bus: 1800 },
      { date: '18:00', bike: 9200, auto: 14500, bus: 2800 },
      { date: '21:00', bike: 6800, auto: 11000, bus: 2000 },
    ],
    fleetDemand: [
      { date: '06:00', autoDemand: 28, autoActive: 35, bikeDemand: 20, bikeActive: 28 },
      { date: '09:00', autoDemand: 105, autoActive: 112, bikeDemand: 77, bikeActive: 85 },
      { date: '12:00', autoDemand: 72, autoActive: 88, bikeDemand: 52, bikeActive: 68 },
      { date: '15:00', autoDemand: 84, autoActive: 94, bikeDemand: 62, bikeActive: 74 },
      { date: '18:00', autoDemand: 138, autoActive: 125, bikeDemand: 110, bikeActive: 102 },
      { date: '21:00', autoDemand: 96, autoActive: 90, bikeDemand: 68, bikeActive: 72 },
    ],
    revenueBreakdownBar: [
      { name: 'Auto Fares', value: 55700 },
      { name: 'Bike Fares', value: 35300 },
      { name: 'Bus Booking', value: 10900 },
    ],
    stats: {
      periodRides: 912,
      periodRevenue: 101900,
      periodPayouts: 81520,
      periodTransactions: 912,
      periodNetProfit: 20380,
    },
  },
  week: {
    revenueTrend: [
      { date: 'Mon', revenue: 42000, payouts: 33600, recharges: 26000, subscriptions: 16000 },
      { date: 'Tue', revenue: 48500, payouts: 38800, recharges: 30000, subscriptions: 18500 },
      { date: 'Wed', revenue: 45200, payouts: 36160, recharges: 28000, subscriptions: 17200 },
      { date: 'Thu', revenue: 56400, payouts: 45120, recharges: 35000, subscriptions: 21400 },
      { date: 'Fri', revenue: 68200, payouts: 54560, recharges: 42000, subscriptions: 26200 },
      { date: 'Sat', revenue: 62800, payouts: 50240, recharges: 39000, subscriptions: 23800 },
      { date: 'Sun', revenue: 51200, payouts: 40960, recharges: 32000, subscriptions: 19200 },
    ],
    dailyRides: [
      { date: 'Mon', count: 385 },
      { date: 'Tue', count: 442 },
      { date: 'Wed', count: 418 },
      { date: 'Thu', count: 536 },
      { date: 'Fri', count: 684 },
      { date: 'Sat', count: 621 },
      { date: 'Sun', count: 495 },
    ],
    revenueSources: [
      { date: 'Mon', bike: 14500, auto: 22800, bus: 4700 },
      { date: 'Tue', bike: 16800, auto: 26200, bus: 5500 },
      { date: 'Wed', bike: 15400, auto: 24800, bus: 5000 },
      { date: 'Thu', bike: 19600, auto: 30200, bus: 6600 },
      { date: 'Fri', bike: 23800, auto: 36400, bus: 8000 },
      { date: 'Sat', bike: 22000, auto: 33400, bus: 7400 },
      { date: 'Sun', bike: 17800, auto: 27600, bus: 5800 },
    ],
    fleetDemand: [
      { date: 'Mon', autoDemand: 228, autoActive: 240, bikeDemand: 157, bikeActive: 170 },
      { date: 'Tue', autoDemand: 262, autoActive: 255, bikeDemand: 180, bikeActive: 185 },
      { date: 'Wed', autoDemand: 248, autoActive: 250, bikeDemand: 170, bikeActive: 178 },
      { date: 'Thu', autoDemand: 302, autoActive: 290, bikeDemand: 234, bikeActive: 225 },
      { date: 'Fri', autoDemand: 364, autoActive: 340, bikeDemand: 320, bikeActive: 300 },
      { date: 'Sat', autoDemand: 334, autoActive: 320, bikeDemand: 287, bikeActive: 275 },
      { date: 'Sun', autoDemand: 276, autoActive: 280, bikeDemand: 219, bikeActive: 230 },
    ],
    revenueBreakdownBar: [
      { name: 'Auto Fares', value: 201400 },
      { name: 'Bike Fares', value: 129900 },
      { name: 'Bus Booking', value: 43000 },
    ],
    stats: {
      periodRides: 3581,
      periodRevenue: 374300,
      periodPayouts: 299440,
      periodTransactions: 3581,
      periodNetProfit: 74860,
    },
  },
  month: {
    revenueTrend: [
      { date: 'Week 1', revenue: 265000, payouts: 212000, recharges: 165000, subscriptions: 100000 },
      { date: 'Week 2', revenue: 312000, payouts: 249600, recharges: 194000, subscriptions: 118000 },
      { date: 'Week 3', revenue: 348000, payouts: 278400, recharges: 216000, subscriptions: 132000 },
      { date: 'Week 4', revenue: 395000, payouts: 316000, recharges: 245000, subscriptions: 150000 },
    ],
    dailyRides: [
      { date: 'Week 1', count: 2480 },
      { date: 'Week 2', count: 2920 },
      { date: 'Week 3', count: 3250 },
      { date: 'Week 4', count: 3710 },
    ],
    revenueSources: [
      { date: 'Week 1', bike: 92000, auto: 144000, bus: 29000 },
      { date: 'Week 2', bike: 108000, auto: 170000, bus: 34000 },
      { date: 'Week 3', bike: 121000, auto: 190000, bus: 37000 },
      { date: 'Week 4', bike: 138000, auto: 215000, bus: 42000 },
    ],
    fleetDemand: [
      { date: 'Week 1', autoDemand: 1440, autoActive: 1500, bikeDemand: 1040, bikeActive: 1100 },
      { date: 'Week 2', autoDemand: 1700, autoActive: 1680, bikeDemand: 1220, bikeActive: 1200 },
      { date: 'Week 3', autoDemand: 1900, autoActive: 1850, bikeDemand: 1350, bikeActive: 1320 },
      { date: 'Week 4', autoDemand: 2150, autoActive: 2100, bikeDemand: 1560, bikeActive: 1500 },
    ],
    revenueBreakdownBar: [
      { name: 'Auto Fares', value: 719000 },
      { name: 'Bike Fares', value: 459000 },
      { name: 'Bus Booking', value: 142000 },
    ],
    stats: {
      periodRides: 12360,
      periodRevenue: 1320000,
      periodPayouts: 1056000,
      periodTransactions: 12360,
      periodNetProfit: 264000,
    },
  },
  year: {
    revenueTrend: [
      { date: 'May', revenue: 980000, payouts: 784000, recharges: 610000, subscriptions: 370000 },
      { date: 'Jun', revenue: 1120000, payouts: 896000, recharges: 700000, subscriptions: 420000 },
      { date: 'Jul', revenue: 1280000, payouts: 1024000, recharges: 800000, subscriptions: 480000 },
      { date: 'Aug', revenue: 1420000, payouts: 1136000, recharges: 890000, subscriptions: 530000 },
      { date: 'Sep', revenue: 1580000, payouts: 1264000, recharges: 990000, subscriptions: 590000 },
      { date: 'Oct', revenue: 1840000, payouts: 1472000, recharges: 1150000, subscriptions: 690000 },
    ],
    dailyRides: [
      { date: 'May', count: 9200 },
      { date: 'Jun', count: 10500 },
      { date: 'Jul', count: 12100 },
      { date: 'Aug', count: 13400 },
      { date: 'Sep', count: 14900 },
      { date: 'Oct', count: 17200 },
    ],
    revenueSources: [
      { date: 'May', bike: 340000, auto: 535000, bus: 105000 },
      { date: 'Jun', bike: 390000, auto: 610000, bus: 120000 },
      { date: 'Jul', bike: 445000, auto: 700000, bus: 135000 },
      { date: 'Aug', bike: 495000, auto: 775000, bus: 150000 },
      { date: 'Sep', bike: 550000, auto: 865000, bus: 165000 },
      { date: 'Oct', bike: 640000, auto: 1005000, bus: 195000 },
    ],
    fleetDemand: [
      { date: 'May', autoDemand: 5350, autoActive: 5400, bikeDemand: 3850, bikeActive: 3900 },
      { date: 'Jun', autoDemand: 6100, autoActive: 6000, bikeDemand: 4400, bikeActive: 4300 },
      { date: 'Jul', autoDemand: 7000, autoActive: 6900, bikeDemand: 5100, bikeActive: 5000 },
      { date: 'Aug', autoDemand: 7750, autoActive: 7700, bikeDemand: 5650, bikeActive: 5600 },
      { date: 'Sep', autoDemand: 8650, autoActive: 8550, bikeDemand: 6250, bikeActive: 6150 },
      { date: 'Oct', autoDemand: 10050, autoActive: 9900, bikeDemand: 7150, bikeActive: 7000 },
    ],
    revenueBreakdownBar: [
      { name: 'Auto Fares', value: 4490000 },
      { name: 'Bike Fares', value: 2860000 },
      { name: 'Bus Booking', value: 870000 },
    ],
    stats: {
      periodRides: 77300,
      periodRevenue: 8220000,
      periodPayouts: 6576000,
      periodTransactions: 77300,
      periodNetProfit: 1644000,
    },
  },
};

const MODAL_DISTRIBUTION = [
  { name: 'Auto Rickshaw', value: 54, color: '#060771' },
  { name: 'Bike Taxi', value: 34, color: '#3b82f6' },
  { name: 'Bus Booking', value: 12, color: '#10b981' },
];

export function Dashboard() {
  const [period, setPeriod] = useState('week'); // 'today' | 'week' | 'month' | 'year'

  // Connect to actual stores for real-time counts
  const { users, stats: userStats, fetchUsers } = useUserStore();
  const { drivers, fetchDrivers } = useDriverStore();
  const { operators, fetchOperators } = useFleetOperatorStore();
  const { vehicles } = useVehicleStore();
  const { zones } = useZoneStore();
  const { tickets } = useSupportStore();
  const { reports } = useReportStore();

  // Fetch live data from backend when dashboard mounts
  useEffect(() => {
    fetchUsers({ limit: 100 });
    fetchDrivers({ limit: 100 });
    fetchOperators({ limit: 100 });
  }, [fetchUsers, fetchDrivers, fetchOperators]);

  // Active dataset according to period
  const currentData = DATASETS[period] || DATASETS.week;

  // Real-time store metrics combined with current period
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'Active').length;
    const totalDrivers = drivers.length;
    const onlineDrivers = drivers.filter((d) => d.dutyStatus === 'online').length;
    const pendingKyc = drivers.filter(
      (d) => d.kycStatus === 'pending' || !d.status
    ).length;
    const openTickets = tickets.filter(
      (t) => t.status === 'Open' || t.status === 'In Progress'
    ).length;
    const pendingReports = reports.filter(
      (r) => r.status === 'Pending' || r.status === 'Under Investigation'
    ).length;

    const displayRevenue = currentData.stats.periodRevenue;
    const displayPayouts = currentData.stats.periodPayouts;
    const netProfit = currentData.stats.periodNetProfit;
    const displayTransactions = currentData.stats.periodTransactions;

    return {
      totalUsers,
      activeUsers,
      totalDrivers,
      onlineDrivers,
      pendingKyc,
      openTickets,
      pendingReports,
      displayRevenue,
      displayPayouts,
      netProfit,
      displayTransactions,
    };
  }, [users, drivers, tickets, reports, currentData]);

  const isFiltered = period !== 'week';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header with Period Filter ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {period === 'today' && "Showing today's real-time metrics and operational trends."}
            {period === 'week' && "Welcome back! Here's what's happening with your Go Dest system."}
            {period === 'month' && 'Showing monthly performance metrics and financial breakdown.'}
            {period === 'year' && 'Showing all-time platform volume and annual growth trends.'}
          </p>
        </div>

        {/* Period Selector Tabs (Solo Hearts style) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'Yearly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                period === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Operational KPI Cards (Solo Hearts 4-card grid) ──────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
        <KPICard
          title={isFiltered ? 'Rides in Period' : 'Total Dispatches'}
          value={currentData.stats.periodRides}
          icon={Car}
          description={
            isFiltered
              ? `All-time total: ${(77300).toLocaleString()}`
              : 'Bike, Auto & Bus rides'
          }
          trend="+14.2%"
          trendDirection="up"
          colorClass="bg-blue-100 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />

        <KPICard
          title="Active Drivers"
          value={metrics.onlineDrivers}
          icon={Users}
          description={`${metrics.totalDrivers} registered drivers`}
          trend={`${metrics.onlineDrivers} online now`}
          trendDirection="up"
          colorClass="bg-cyan-100 dark:bg-cyan-900/20"
          iconColorClass="text-cyan-600 dark:text-cyan-400"
        />

        <KPICard
          title="KYC Pending"
          value={metrics.pendingKyc}
          icon={UserCheck}
          description="Awaiting verification"
          trend={metrics.pendingKyc > 0 ? `${metrics.pendingKyc} review needed` : 'All cleared'}
          trendDirection={metrics.pendingKyc > 0 ? 'down' : 'up'}
          colorClass="bg-indigo-100 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />

        <KPICard
          title="Safety & Reports"
          value={metrics.pendingReports}
          icon={ShieldAlert}
          description="Incident reports queue"
          trend="Control room live"
          trendDirection="up"
          colorClass="bg-rose-100 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* ── 2. Revenue & Payouts Section (Exact Solo Hearts design) ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-green-600" />
          {isFiltered ? 'Revenue & Payouts (Selected Period)' : 'Revenue & Payouts'}
        </h3>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
          <KPICard
            title={isFiltered ? 'Period Revenue' : "Today's Revenue"}
            value={formatCurrency(
              isFiltered ? metrics.displayRevenue : DATASETS.today.stats.periodRevenue
            )}
            icon={TrendingUp}
            description="Gross Fare + Booking charges"
            trend="+18.4%"
            trendDirection="up"
            colorClass="bg-emerald-100 dark:bg-emerald-900/20"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
          />

          <KPICard
            title={isFiltered ? 'Period Payouts' : 'This Month'}
            value={formatCurrency(
              isFiltered ? metrics.displayPayouts : DATASETS.month.stats.periodRevenue
            )}
            icon={isFiltered ? Wallet : CalendarDays}
            description={isFiltered ? 'Driver & Vendor payouts' : 'Monthly gross volume'}
            colorClass="bg-teal-100 dark:bg-teal-900/20"
            iconColorClass="text-teal-600 dark:text-teal-400"
          />

          <KPICard
            title="Total Revenue"
            value={formatCurrency(DATASETS.year.stats.periodRevenue)}
            icon={DollarSign}
            description="All-time platform revenue"
            colorClass="bg-green-100 dark:bg-green-900/20"
            iconColorClass="text-green-600 dark:text-green-400"
          />

          <KPICard
            title="Total Payouts"
            value={formatCurrency(DATASETS.year.stats.periodPayouts)}
            icon={Wallet}
            description="Disbursed to drivers & vendors"
            colorClass="bg-red-100 dark:bg-red-900/20"
            iconColorClass="text-red-600 dark:text-red-400"
          />
        </div>

        {/* Net Profit & Quick Stats 4-Card Bar (Exact Solo Hearts Gradient Cards) */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-green-700 dark:text-green-400">
                    {isFiltered ? 'Period Net Commission' : 'Net Commission'}
                  </p>
                  <p
                    className={cn(
                      'text-lg font-bold mt-0.5',
                      metrics.netProfit >= 0
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    )}
                  >
                    {formatCurrency(metrics.netProfit)}
                  </p>
                </div>
                {metrics.netProfit >= 0 ? (
                  <ArrowUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900">
            <CardContent className="p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400">
                  {isFiltered ? 'Period Dispatches' : 'Total Dispatches'}
                </p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                  {metrics.displayTransactions.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900">
            <CardContent className="p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
                  Pending KYC Verifications
                </p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                  {metrics.pendingKyc}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-900">
            <CardContent className="p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">
                  Open Support Tickets
                </p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                  {metrics.openTickets}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── 3. Charts Row 1: Daily Revenue Trend + Revenue Breakdown ─ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Revenue Trend Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Daily Revenue Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Gross Fare Revenue vs Driver/Vendor Payouts ({period.toUpperCase()})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer minWidth={0} width="100%" height={250}>
              <AreaChart data={currentData.revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#64748b" className="text-xs" />
                <YAxis
                  stroke="#64748b"
                  className="text-xs"
                  tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => {
                    const labels = {
                      revenue: '💰 Gross Revenue',
                      payouts: '💸 Driver Payouts',
                      recharges: '🪙 Auto Fares',
                      subscriptions: '⚡ Bike Fares',
                    };
                    return [formatCurrencyFull(value), labels[name] || name];
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#059669', r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="payouts"
                  name="Driver Payouts"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#payoutGradient)"
                  dot={{ fill: '#dc2626', r: 3 }}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Payout Analysis Bar Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">
              Revenue vs Payout Analysis
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of money flow: Auto Meter Fares, Bike Taxis & Bus Bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Top 4-stat summary row (Solo Hearts exact design) */}
            <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Auto Fares</p>
                <p className="text-sm font-bold text-[#060771] dark:text-[#60a5fa]">
                  {formatCurrency(currentData.revenueBreakdownBar[0]?.value || 0)}
                </p>
                <p className="text-[9px] text-slate-400">54% share</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Bike Fares</p>
                <p className="text-sm font-bold text-violet-700 dark:text-violet-400">
                  {formatCurrency(currentData.revenueBreakdownBar[1]?.value || 0)}
                </p>
                <p className="text-[9px] text-slate-400">34% share</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Bus Booking</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(currentData.revenueBreakdownBar[2]?.value || 0)}
                </p>
                <p className="text-[9px] text-slate-400">API PNRs</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Net Profit</p>
                <p
                  className={cn(
                    'text-sm font-bold',
                    metrics.netProfit >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {formatCurrency(metrics.netProfit)}
                </p>
                <p className="text-[9px] text-slate-400">Commission</p>
              </div>
            </div>

            <ResponsiveContainer minWidth={0} width="100%" height={165}>
              <BarChart data={currentData.revenueBreakdownBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#64748b" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  className="text-xs"
                  tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => [formatCurrencyFull(value), name]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={45}>
                  {currentData.revenueBreakdownBar.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#060771' : index === 1 ? '#7c3aed' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Charts Row 2: Daily Rides + Multi-Modal Sources ──────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Rides Line Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">
              Daily Rides & Dispatches
            </CardTitle>
            <CardDescription className="text-xs">
              Completed on-demand trips and bookings volume ({period.toUpperCase()})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer minWidth={0} width="100%" height={250}>
              <LineChart data={currentData.dailyRides}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#64748b" className="text-xs" />
                <YAxis stroke="#64748b" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Completed Trips"
                  stroke="#060771"
                  strokeWidth={2.5}
                  dot={{ fill: '#060771', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Multi-Modal Revenue Stacked Bar Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <CreditCard className="h-4 w-4 text-violet-600" />
              Revenue by Ride Category (Daily)
            </CardTitle>
            <CardDescription className="text-xs">
              Bike Taxi vs Auto Rickshaw vs Bus Booking breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer minWidth={0} width="100%" height={250}>
              <BarChart data={currentData.revenueSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#64748b" className="text-xs" />
                <YAxis
                  stroke="#64748b"
                  className="text-xs"
                  tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => {
                    const labels = {
                      auto: '🛺 Auto Rickshaw',
                      bike: '🛵 Bike Taxi',
                      bus: '🚌 Bus Booking',
                    };
                    return [formatCurrencyFull(value), labels[name] || name];
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="auto" name="Auto Rickshaw" stackId="rev" fill="#060771" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bike" name="Bike Taxi" stackId="rev" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bus" name="Bus Booking" stackId="rev" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── 5. Modal Distribution & Fleet Demand vs Active Drivers ─── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Modal Share Donut Chart */}
        <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Layers className="h-4 w-4 text-[#060771]" />
              Modal Share Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Trip share by vehicle class
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer minWidth={0} width="100%" height={220}>
              <PieChart>
                <Pie
                  data={MODAL_DISTRIBUTION}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MODAL_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => [`${value}% of total trips`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand vs Active Drivers Multi-Line Chart (Solo Hearts Girls vs Boys style) */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Activity className="h-4 w-4 text-[#060771]" />
              Trip Demand vs Active Drivers (Auto & Bike)
            </CardTitle>
            <CardDescription className="text-xs">
              Daily comparative trend of customer trip demand against active drivers on duty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer minWidth={0} width="100%" height={230}>
              <LineChart data={currentData.fleetDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#64748b" className="text-xs" />
                <YAxis stroke="#64748b" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Line
                  type="monotone"
                  dataKey="autoDemand"
                  name="Auto Demand"
                  stroke="#060771"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="autoActive"
                  name="Autos Online"
                  stroke="#1e40af"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="bikeDemand"
                  name="Bike Demand"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="bikeActive"
                  name="Bikes Online"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
