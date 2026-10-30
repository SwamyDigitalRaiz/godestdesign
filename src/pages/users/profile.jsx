import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useUserStore } from '../../store/userStore';
import { useToast } from '../../components/ui/toaster';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Wallet,
  Car,
  Bike,
  Star,
  Users,
  AlertTriangle,
  Ban,
  UserX,
  Edit,
  Save,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Eye,
  CreditCard,
  Building2,
  Navigation,
  ArrowRight,
  Plus,
  Minus,
  RotateCw,
  Home,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUserById, updateUser, adjustWalletBalance, toggleBlockUser, deleteUser } = useUserStore();

  const user = getUserById(id);

  // Dialog States
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletAction, setWalletAction] = useState('add'); // 'add' | 'remove'
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    homeHub: '',
    emergencyContact: '',
    tier: '',
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <User className="h-7 w-7" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Not Found</h3>
          <p className="text-sm text-slate-500 mt-1">The requested user profile does not exist or has been removed.</p>
        </div>
        <Button onClick={() => navigate('/users')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to User List
        </Button>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      homeHub: user.homeHub || '',
      emergencyContact: user.emergencyContact || '',
      tier: user.tier || 'Regular Rider',
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateUser(user.id, editForm);
    toast({
      title: 'Profile Updated',
      description: `User details for ${editForm.name} updated successfully.`,
    });
    setShowEditDialog(false);
  };

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    const amount = Number(walletAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please specify a valid monetary amount.',
        variant: 'destructive',
      });
      return;
    }

    if (walletAction === 'remove' && amount > (user.walletBalance || 0)) {
      toast({
        title: 'Insufficient Balance',
        description: `Cannot deduct ₹${amount}. Current wallet balance is ₹${user.walletBalance}.`,
        variant: 'destructive',
      });
      return;
    }

    adjustWalletBalance(user.id, {
      amount,
      action: walletAction,
      reason: walletReason || (walletAction === 'add' ? 'Manual admin wallet recharge' : 'Manual admin wallet deduction'),
    });

    toast({
      title: walletAction === 'add' ? 'Wallet Credited' : 'Wallet Debited',
      description: `Successfully ${walletAction === 'add' ? 'added ₹' : 'deducted ₹'}${amount} ${walletAction === 'add' ? 'to' : 'from'} ${user.name}'s wallet.`,
    });

    setWalletAmount('');
    setWalletReason('');
    setShowWalletDialog(false);
  };

  const handleToggleBlock = () => {
    const newStatus = toggleBlockUser(user.id);
    toast({
      title: newStatus === 'Suspended' ? 'User Suspended' : 'User Activated',
      description: `${user.name} has been ${newStatus === 'Suspended' ? 'suspended from ride booking' : 'restored to active status'}.`,
    });
    setShowBlockDialog(false);
  };

  const handleDeleteUser = () => {
    deleteUser(user.id);
    toast({
      title: 'User Deleted',
      description: `User ${user.name} has been removed.`,
    });
    navigate('/users');
  };

  const isSuspended = user.status === 'Suspended';

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/users')}
            className="h-8 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users List
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {user.name}
            </h1>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
              {user.id}
            </Badge>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                user.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {user.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered passenger profile, active mobility bookings, and transaction history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEdit}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500" />
            Edit Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setWalletAction('add');
              setShowWalletDialog(true);
            }}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            Adjust Wallet
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBlockDialog(true)}
            className={`h-9 text-xs font-semibold gap-1.5 cursor-pointer transition-colors ${
              isSuspended
                ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400'
                : 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30'
            }`}
          >
            <Ban className="h-3.5 w-3.5" />
            {isSuspended ? 'Unblock User' : 'Suspend Account'}
          </Button>
        </div>
      </div>

      {/* ── 4 Overview KPI Metric Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{user.walletBalance?.toLocaleString('en-IN') || 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ ₹{user.promoBalance || 0} Promo Cash</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Rides
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.totalRides || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user.completedRides || 0} Completed • {user.cancelledRides || 0} Cancelled
            </p>
          </CardContent>
        </Card>

        {/* Total Spent Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{user.totalSpent?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Avg ₹{Math.round((user.totalSpent || 0) / (user.totalRides || 1))} / ride
            </p>
          </CardContent>
        </Card>

        {/* Rider Rating Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Rider Rating & Trust
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-500 flex items-center gap-1.5">
              <span>{user.rating || '5.0'}</span>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From driver trip evaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content Grid (Left: Profile, Right: Tabs) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Profile & Saved Preferences */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main User Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-primary/40 shadow-sm shrink-0">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                      {user.tier || 'Regular Rider'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      {user.city}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  Phone Number
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                  {user.phone}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[180px]">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  City & Hub
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {user.city} ({user.homeHub || 'Central'})
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined Date
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {user.joined}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Last Active
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {user.lastActive || 'Recently'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  App Version
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {user.appVersion || 'v2.4.2'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact & Safety */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Emergency Contact & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
                <p className="text-[11px] text-slate-500 font-medium">Registered Guardian Contact</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {user.emergencyContact || 'No emergency contact registered'}
                </p>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                <span>SOS Alert Status:</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                  Clean (0 Triggers)
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Saved Places */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Saved Places & Geofences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <Home className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Home Address</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{user.savedPlaces?.home || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <Briefcase className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Work / Office</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{user.savedPlaces?.work || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Tabs (Ride History, Transactions, Tickets, Reviews) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="rides" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-11 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <TabsTrigger value="rides" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Rides ({user.rideHistory?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Wallet Logs ({user.transactions?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="tickets" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Support ({user.supportTickets?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Reviews ({user.reviews?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: RIDE HISTORY */}
            <TabsContent value="rides" className="mt-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                      Rider Trip History
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      All on-demand auto and bike bookings made by this user
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {user.rideHistory?.length || 0} Records
                  </Badge>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 font-semibold">
                        <th className="py-3 px-4">Ride ID</th>
                        <th className="py-3 px-4">Vehicle</th>
                        <th className="py-3 px-4">Driver & Vehicle</th>
                        <th className="py-3 px-4">Route (Pickup → Drop)</th>
                        <th className="py-3 px-4">Fare</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {!user.rideHistory || user.rideHistory.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-slate-400">
                            No ride records found for this passenger.
                          </td>
                        </tr>
                      ) : (
                        user.rideHistory.map((ride) => (
                          <tr key={ride.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {ride.id}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900/50">
                                {ride.vehicleType === 'Auto' ? <Car className="h-3 w-3" /> : <Bike className="h-3 w-3" />}
                                {ride.vehicleType}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900 dark:text-white">{ride.driverName}</p>
                              <p className="font-mono text-[10px] text-slate-400">{ride.vehicleNo}</p>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span className="truncate text-slate-700 dark:text-slate-300">{ride.pickup}</span>
                                </div>
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                  <span className="truncate text-slate-700 dark:text-slate-300">{ride.drop}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 dark:text-white">{ride.fare}</span>
                              <p className="text-[10px] text-slate-400">{ride.paymentMethod}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {ride.date}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  ride.status === 'ongoing'
                                    ? 'warning'
                                    : ride.status === 'completed'
                                    ? 'success'
                                    : 'destructive'
                                }
                                className="capitalize text-[10px]"
                              >
                                {ride.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: WALLET TRANSACTIONS */}
            <TabsContent value="transactions" className="mt-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                      Wallet Top-ups & Deductions
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Real-time credit and debit transactions for this rider's digital wallet
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setWalletAction('add');
                      setShowWalletDialog(true);
                    }}
                    className="h-8 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Funds
                  </Button>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 font-semibold">
                        <th className="py-3 px-4">Txn ID</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Method / Reason</th>
                        <th className="py-3 px-4">Balance After</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {!user.transactions || user.transactions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-slate-400">
                            No wallet transactions recorded.
                          </td>
                        </tr>
                      ) : (
                        user.transactions.map((txn) => {
                          const isCredit = txn.amount.startsWith('+');
                          return (
                            <tr key={txn.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {txn.id}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                {txn.type}
                              </td>
                              <td className="py-3 px-4 font-bold text-sm">
                                <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}>
                                  {txn.amount}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                {txn.method}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {txn.balanceAfter}
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {txn.date}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="success" className="text-[10px]">
                                  {txn.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 3: SUPPORT TICKETS */}
            <TabsContent value="tickets" className="mt-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Support Tickets & Incident Inquiries
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Complaints, dispute resolutions, and safety inquiries filed by this user
                  </CardDescription>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 font-semibold">
                        <th className="py-3 px-4">Ticket ID</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Filed Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {!user.supportTickets || user.supportTickets.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-10 text-center text-slate-400">
                            No customer support tickets filed by this user.
                          </td>
                        </tr>
                      ) : (
                        user.supportTickets.map((tck) => (
                          <tr key={tck.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {tck.id}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              {tck.category}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {tck.subject}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={tck.priority === 'High' ? 'destructive' : tck.priority === 'Medium' ? 'warning' : 'secondary'}
                                className="text-[10px]"
                              >
                                {tck.priority}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {tck.date}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={tck.status === 'Resolved' ? 'success' : 'default'} className="text-[10px]">
                                {tck.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 4: REVIEWS GIVEN */}
            <TabsContent value="reviews" className="mt-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Driver Ratings & Feedback Given
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Ratings and post-ride reviews submitted by this rider for auto & bike partners
                  </CardDescription>
                </CardHeader>
                <div className="p-4 space-y-3">
                  {!user.reviews || user.reviews.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">
                      No reviews submitted yet.
                    </p>
                  ) : (
                    user.reviews.map((rev, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 dark:text-white">{rev.driverName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{rev.vehicleNo}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <span>{rev.rating}</span>
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">"{rev.comment}"</p>
                        <p className="text-[10px] text-slate-400">{rev.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Dialog 1: Edit Profile ────────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Passenger Profile
            </DialogTitle>
            <DialogDescription>
              Update personal identity, phone, email, and preferred mobility tier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name *</Label>
              <Input
                id="user-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="user-phone">Phone Number *</Label>
                <Input
                  id="user-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-city">City *</Label>
                <Input
                  id="user-city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-hub">Home Mobility Hub</Label>
              <Input
                id="user-hub"
                value={editForm.homeHub}
                onChange={(e) => setEditForm({ ...editForm, homeHub: e.target.value })}
                placeholder="e.g. Hitec City & Madhapur"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-emergency">Emergency Guardian Contact</Label>
              <Input
                id="user-emergency"
                value={editForm.emergencyContact}
                onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                placeholder="e.g. Contact Name • Phone Number"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-tier">Rider Membership Tier</Label>
              <select
                id="user-tier"
                value={editForm.tier}
                onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                className="w-full h-9 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-slate-100"
              >
                <option value="Regular Rider">Regular Rider</option>
                <option value="Silver Rider">Silver Rider</option>
                <option value="VIP Gold Rider">VIP Gold Rider</option>
                <option value="VIP Platinum Rider">VIP Platinum Rider</option>
              </select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 2: Adjust Wallet ───────────────────────────────────────── */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Adjust Passenger Wallet Balance
            </DialogTitle>
            <DialogDescription>
              Directly credit or debit balance for {user.name}. Current Balance: <strong className="text-slate-900 dark:text-white">₹{user.walletBalance}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWalletSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setWalletAction('add')}
                className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  walletAction === 'add'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Credit
              </button>
              <button
                type="button"
                onClick={() => setWalletAction('remove')}
                className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  walletAction === 'remove'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Minus className="h-3.5 w-3.5" />
                Debit Balance
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wallet-amount">Amount (INR ₹) *</Label>
              <Input
                id="wallet-amount"
                type="number"
                min="1"
                placeholder="e.g. 200"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                required
                className="h-9 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wallet-reason">Adjustment Reason *</Label>
              <Input
                id="wallet-reason"
                placeholder="e.g. Promotional courtesy credit, compensation for delayed driver"
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowWalletDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={`font-semibold text-white ${
                  walletAction === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {walletAction === 'add' ? 'Credit Wallet' : 'Debit Wallet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 3: Block / Unblock ─────────────────────────────────────── */}
      <ConfirmDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        onConfirm={handleToggleBlock}
        title={isSuspended ? `Unblock User: ${user.name}` : `Suspend Account: ${user.name}`}
        description={
          isSuspended
            ? 'Are you sure you want to restore this user account? They will be able to book rides immediately.'
            : 'Are you sure you want to suspend this user? They will not be able to book auto or bike rides while suspended.'
        }
        confirmText={isSuspended ? 'Unblock User' : 'Suspend User'}
        variant={isSuspended ? 'info' : 'danger'}
      />
    </div>
  );
}
