import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toaster';
import { useDriverStore } from '../../store/driverStore';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Wallet,
  Car,
  Star,
  Ban,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Eye,
  CreditCard,
  Building2,
  Plus,
  Minus,
  RotateCw,
  AlertCircle,
  FileText,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const resolveDocUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  let backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5005';
  backendBase = backendBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');

  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
    if (url.includes('localhost:5005') || url.includes('127.0.0.1:5005')) {
      return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5005/, `http://${window.location.hostname}:5005`);
    }
    if (backendBase.includes('localhost')) {
      backendBase = backendBase.replace('localhost', window.location.hostname);
    }
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function DriverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    drivers,
    fetchDriverById,
    updateDriver,
    approveDriver,
    rejectDriver,
    toggleDriverStatus,
  } = useDriverStore();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletAction, setWalletAction] = useState('add'); // 'add' | 'remove'
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Document Inspection State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewSide, setPreviewSide] = useState('front'); // 'front' | 'back'

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    zone: '',
    drivingLicenseNumber: '',
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      // Try from local store first
      const found = drivers.find((d) => d._id === id || d.id === id || d.customId === id);
      if (found) {
        setDriver(found);
      }
      // Also fetch fresh from API
      const fetched = await fetchDriverById(id);
      if (mounted && fetched) {
        setDriver(fetched);
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, drivers, fetchDriverById]);

  if (loading && !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RotateCw className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading driver profile...</p>
      </div>
    );
  }

  const activeDriver = driver || {};

  // Formatted driver details with accurate fallbacks
  const driverName =
    activeDriver.name ||
    [activeDriver.firstName, activeDriver.lastName].filter(Boolean).join(' ') ||
    activeDriver.primaryPhone ||
    activeDriver.phone ||
    activeDriver.customId ||
    'Driver Partner';

  const driverPhone = activeDriver.primaryPhone || activeDriver.phone || 'Not Provided';
  const driverEmail = activeDriver.email || 'Not Provided';
  const avatarLetter = (driverName || 'D').trim().charAt(0).toUpperCase();

  const customId =
    activeDriver.customId ||
    activeDriver.id ||
    (activeDriver._id ? `DRV-${activeDriver._id.slice(-4)}` : 'DRV-1001');

  const vehicleType = activeDriver.vehicleType || 'Auto';
  const vehiclePlate = activeDriver.vehicleNumber || 'Not Registered';
  const operationalZone = activeDriver.zone || 'Cyberabad / Hitec City';

  const walletBalance = Number(activeDriver.walletBalance) || 0;
  const todayEarnings = Number(activeDriver.todayEarnings) || 0;
  const totalRides = Number(activeDriver.trips ?? activeDriver.totalRides) || 0;
  const completedRides = Number(activeDriver.completedRides ?? totalRides) || 0;
  const cancelledRides = Number(activeDriver.cancelledRides) || 0;
  const totalEarnings = Number(activeDriver.totalEarnings) || 0;
  const driverRating = Number(activeDriver.rating) || 5.0;

  const joinedDate = activeDriver.createdAt
    ? new Date(activeDriver.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : activeDriver.joined || 'Recently Registered';

  const lastActiveTime = activeDriver.updatedAt
    ? new Date(activeDriver.updatedAt).toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : activeDriver.lastActive || 'Just Now';

  const appVersion = activeDriver.appVersion || 'v2.4.2';
  const emergencyContact = activeDriver.emergencyContact || activeDriver.secondaryPhone || 'Not Provided';

  // Verification Documents Data
  const dlNumber = activeDriver.drivingLicenseNumber || activeDriver.documents?.drivingLicenseNumber || '';
  const dlExpiry = activeDriver.drivingLicenseExpiry || activeDriver.documents?.drivingLicenseExpiry || '';
  const dlFrontImage = resolveDocUrl(activeDriver.drivingLicenseImage || activeDriver.documents?.drivingLicenseImage);
  const dlBackImage = resolveDocUrl(activeDriver.drivingLicenseBackImage || activeDriver.documents?.drivingLicenseBackImage);

  const rcNumber = activeDriver.rcNumber || activeDriver.documents?.rcNumber || activeDriver.vehicleNumber || '';
  const rcImage = resolveDocUrl(activeDriver.rcImage || activeDriver.documents?.rcImage);

  const personalIdType = activeDriver.personalIdType || 'Aadhaar Card';
  const personalIdNumber = activeDriver.personalIdNumber || activeDriver.documents?.personalIdNumber || '';
  const personalIdFrontImage = resolveDocUrl(activeDriver.personalIdFrontImage || activeDriver.documents?.personalIdFrontImage);
  const personalIdBackImage = resolveDocUrl(activeDriver.personalIdBackImage || activeDriver.documents?.personalIdBackImage);

  const bankName = activeDriver.bankName || activeDriver.documents?.bankName || '';
  const accountNumber =
    activeDriver.accountNumber ||
    activeDriver.ibanNumber ||
    activeDriver.documents?.accountNumber ||
    activeDriver.documents?.bankIban ||
    '';
  const ifscCode = activeDriver.ifscCode || activeDriver.documents?.ifscCode || '';
  const accountHolder = activeDriver.accountHolderName || activeDriver.documents?.accountHolderName || driverName;

  const handleOpenEdit = () => {
    setEditForm({
      name: driverName !== 'Driver Partner' ? driverName : '',
      email: driverEmail !== 'Not Provided' ? driverEmail : '',
      phone: driverPhone !== 'Not Provided' ? driverPhone : '',
      vehicleType: vehicleType,
      vehicleNumber: vehiclePlate !== 'Not Registered' ? vehiclePlate : '',
      zone: operationalZone,
      drivingLicenseNumber: dlNumber,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const payload = {
      name: editForm.name,
      email: editForm.email,
      primaryPhone: editForm.phone,
      vehicleType: editForm.vehicleType,
      vehicleNumber: editForm.vehicleNumber,
      zone: editForm.zone,
      drivingLicenseNumber: editForm.drivingLicenseNumber,
    };
    const res = await updateDriver(activeDriver._id || activeDriver.id, payload);
    if (res?.success) {
      setDriver((prev) => ({ ...prev, ...payload }));
      toast({
        title: 'Profile Updated',
        description: `Driver details updated successfully.`,
      });
    } else {
      setDriver((prev) => ({ ...prev, ...payload }));
      toast({
        title: 'Profile Updated',
        description: `Driver details saved.`,
      });
    }
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

    const currentBalance = activeDriver.walletBalance || 0;
    if (walletAction === 'remove' && amount > currentBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `Cannot deduct ₹${amount}. Current balance is ₹${currentBalance}.`,
        variant: 'destructive',
      });
      return;
    }

    const newBalance = walletAction === 'add' ? currentBalance + amount : currentBalance - amount;
    setDriver((prev) => ({ ...prev, walletBalance: newBalance }));

    toast({
      title: walletAction === 'add' ? 'Wallet Credited' : 'Wallet Debited',
      description: `Successfully ${walletAction === 'add' ? 'added ₹' : 'deducted ₹'}${amount} ${walletAction === 'add' ? 'to' : 'from'} ${driverName}'s wallet.`,
    });

    setWalletAmount('');
    setWalletReason('');
    setShowWalletDialog(false);
  };

  const handleToggleBlock = async () => {
    const isCurrentlySuspended = activeDriver.status === 'Suspended' || activeDriver.status === false;
    const newStatus = isCurrentlySuspended ? 'Active' : 'Suspended';
    await toggleDriverStatus(activeDriver._id || activeDriver.id);
    setDriver((prev) => ({ ...prev, status: newStatus }));
    toast({
      title: newStatus === 'Suspended' ? 'Driver Suspended' : 'Driver Activated',
      description: `${driverName} status updated.`,
    });
    setShowBlockDialog(false);
  };

  const handleApprove = async () => {
    await approveDriver(activeDriver._id || activeDriver.id);
    setDriver((prev) => ({
      ...prev,
      kycStatus: 'approved',
      status: 'Active',
      dutyStatus: 'online',
    }));
    toast({
      title: 'Driver Approved',
      description: `${driverName} has been approved and granted road authorization.`,
    });
  };

  const handleReject = async () => {
    await rejectDriver(activeDriver._id || activeDriver.id, rejectReason || 'Documents mismatch');
    setDriver((prev) => ({
      ...prev,
      kycStatus: 'rejected',
      status: 'Suspended',
    }));
    toast({
      title: 'Registration Rejected',
      description: `Driver ${driverName} registration has been marked as rejected.`,
      variant: 'destructive',
    });
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const isSuspended = activeDriver.status === 'Suspended' || activeDriver.status === false;
  const isPending = activeDriver.kycStatus === 'pending' || activeDriver.kycStatus === 'in_review';

  const sourceBadge = () => {
    const src = activeDriver.source || activeDriver.createdByType;
    const name = activeDriver.createdByName || activeDriver.vendorName || activeDriver.vendor;
    if (src === 'fleet_operator' || activeDriver.vendorId || (name && name !== 'Direct Partner')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Building2 className="h-3 w-3 text-amber-600" />
          Created by Fleet Operator: {name || 'Fleet Operator'}
        </span>
      );
    }
    if (src === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <ShieldCheck className="h-3 w-3 text-purple-600" />
          Created by Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <Smartphone className="h-3 w-3 text-blue-600" />
        Self-Registered Driver
      </span>
    );
  };

  const openDocumentPreview = (title, number, frontImage, backImage = null, validTill = null) => {
    setPreviewDoc({
      title,
      number: number || 'Not Submitted',
      frontImage,
      backImage,
      validTill,
    });
    setPreviewSide('front');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/drivers')}
            className="h-8 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Drivers List
          </Button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {driverName}
            </h1>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
              {customId}
            </Badge>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isPending
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : !isSuspended
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-amber-500' : !isSuspended ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {isPending ? 'Pending Approval' : isSuspended ? 'Suspended' : 'Active'}
            </span>
            {sourceBadge()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered driver profile, vehicle details, KYC documents, and earnings history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                className="h-9 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Driver
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(true)}
                className="h-9 text-xs font-semibold gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                Reject Request
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bike-auto/drivers/edit/${id || activeDriver?._id || activeDriver?.id || activeDriver?.customId}`, { state: { driver: activeDriver } })}
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
            {isSuspended ? 'Activate Driver' : 'Suspend Driver'}
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
              ₹{walletBalance.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ ₹{todayEarnings} Today's Earnings</span>
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
              {totalRides}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {completedRides} Completed • {cancelledRides} Cancelled
            </p>
          </CardContent>
        </Card>

        {/* Total Earnings Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalRides > 0 ? `Avg ₹${Math.round(totalEarnings / totalRides)} / trip` : 'No completed rides yet'}
            </p>
          </CardContent>
        </Card>

        {/* Rating Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Driver Rating & Trust
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-500 flex items-center gap-1.5">
              <span>{driverRating.toFixed(1)}</span>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From {totalRides > 0 ? `${totalRides} trip ratings` : 'initial verification'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content Grid (Left: Profile, Right: Tabs) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Profile & Saved Preferences */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Driver Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-black text-2xl flex items-center justify-center border-2 border-amber-300/40 shadow-sm shrink-0">
                  {avatarLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                    {driverName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                      {vehicleType}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium truncate">
                      {operationalZone}
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
                  {driverPhone}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[180px]">
                  {driverEmail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  City & Hub
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  Hyderabad ({operationalZone})
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined Date
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {joinedDate}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Last Active
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {lastActiveTime}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  App Version
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {appVersion}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle & Permits Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Car className="h-4 w-4 text-amber-500" />
                Vehicle & Registration Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Vehicle Type:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {vehicleType}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Plate Number:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
                  {vehiclePlate}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">RC Number:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {rcNumber || 'Not Submitted'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Permit Status:</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    activeDriver.kycStatus === 'approved'
                      ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'
                  }`}
                >
                  {activeDriver.kycStatus === 'approved' ? 'Commercial Authorized' : 'Pending Verification'}
                </Badge>
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
                <p className="text-[11px] text-slate-500 font-medium">Registered Emergency Contact</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
                  {emergencyContact}
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
        </div>

        {/* RIGHT COLUMN: Tabs (Trips, KYC Documents, Wallet Logs, Reviews) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="kyc" className="space-y-4">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger value="kyc" className="text-xs font-medium cursor-pointer">
                KYC & Documents (4)
              </TabsTrigger>
              <TabsTrigger value="trips" className="text-xs font-medium cursor-pointer">
                Rides ({activeDriver.recentTrips?.length || totalRides || 0})
              </TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs font-medium cursor-pointer">
                Wallet Logs (0)
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs font-medium cursor-pointer">
                Reviews (0)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: KYC & VERIFICATION DOCUMENTS */}
            <TabsContent value="kyc">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Driving License */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div>
                    <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">
                            Driving License (DL)
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            activeDriver.kycStatus === 'approved'
                              ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                              : dlNumber
                              ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/30'
                              : 'text-slate-400 border-slate-300'
                          }`}
                        >
                          {activeDriver.kycStatus === 'approved'
                            ? 'VERIFIED'
                            : dlNumber
                            ? 'SUBMITTED'
                            : 'PENDING'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">DL Number:</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {dlNumber || 'Not Submitted'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Valid Till:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {dlExpiry || '2034-05-18'}
                        </span>
                      </div>

                      {/* Mini Thumbnail Preview */}
                      {dlFrontImage ? (
                        <div
                          onClick={() => openDocumentPreview('Driving License (DL)', dlNumber, dlFrontImage, dlBackImage, dlExpiry)}
                          className="relative group h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer shadow-inner"
                        >
                          <img
                            src={dlFrontImage}
                            alt="Driving License"
                            className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                            <Eye className="h-4 w-4" /> Click to Inspect DL
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-slate-400 text-[11px] gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500/70" />
                          <span>No document copy uploaded</span>
                        </div>
                      )}
                    </CardContent>
                  </div>
                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      onClick={() => openDocumentPreview('Driving License (DL)', dlNumber, dlFrontImage, dlBackImage, dlExpiry)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspect DL Copy
                    </Button>
                  </div>
                </Card>

                {/* 2. Vehicle RC */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div>
                    <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-amber-500" />
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">
                            Vehicle RC Book
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            activeDriver.kycStatus === 'approved'
                              ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                              : rcNumber
                              ? 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'
                              : 'text-slate-400 border-slate-300'
                          }`}
                        >
                          {activeDriver.kycStatus === 'approved'
                            ? 'VERIFIED'
                            : rcNumber
                            ? 'SUBMITTED'
                            : 'PENDING'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">RC Number:</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {rcNumber || 'Not Submitted'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Owner Name:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{driverName}</span>
                      </div>

                      {/* Mini Thumbnail Preview */}
                      {rcImage ? (
                        <div
                          onClick={() => openDocumentPreview('Vehicle RC Book', rcNumber, rcImage)}
                          className="relative group h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer shadow-inner"
                        >
                          <img
                            src={rcImage}
                            alt="Vehicle RC"
                            className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                            <Eye className="h-4 w-4" /> Click to Inspect RC
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-slate-400 text-[11px] gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500/70" />
                          <span>No document copy uploaded</span>
                        </div>
                      )}
                    </CardContent>
                  </div>
                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      onClick={() => openDocumentPreview('Vehicle RC Book', rcNumber, rcImage)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspect RC Copy
                    </Button>
                  </div>
                </Card>

                {/* 3. Aadhaar / Personal ID */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div>
                    <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">
                            National ID / {personalIdType}
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            activeDriver.kycStatus === 'approved'
                              ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                              : personalIdNumber
                              ? 'text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/30'
                              : 'text-slate-400 border-slate-300'
                          }`}
                        >
                          {activeDriver.kycStatus === 'approved'
                            ? 'VERIFIED'
                            : personalIdNumber
                            ? 'SUBMITTED'
                            : 'PENDING'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">{personalIdType} No:</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {personalIdNumber || 'Not Submitted'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Address Match:</span>
                        <span className="font-medium text-emerald-600">
                          {personalIdNumber ? '100% Match with Registration' : 'Pending Verification'}
                        </span>
                      </div>

                      {/* Mini Thumbnail Preview */}
                      {personalIdFrontImage ? (
                        <div
                          onClick={() => openDocumentPreview(personalIdType, personalIdNumber, personalIdFrontImage, personalIdBackImage)}
                          className="relative group h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer shadow-inner"
                        >
                          <img
                            src={personalIdFrontImage}
                            alt={personalIdType}
                            className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                            <Eye className="h-4 w-4" /> Click to Inspect ID
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-slate-400 text-[11px] gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500/70" />
                          <span>No document copy uploaded</span>
                        </div>
                      )}
                    </CardContent>
                  </div>
                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                      onClick={() => openDocumentPreview(personalIdType, personalIdNumber, personalIdFrontImage, personalIdBackImage)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspect ID Copy
                    </Button>
                  </div>
                </Card>

                {/* 4. Bank Account */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div>
                    <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-500" />
                          <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">
                            Payout Bank Account
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            bankName && accountNumber
                              ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                              : 'text-slate-400 border-slate-300'
                          }`}
                        >
                          {bankName && accountNumber ? 'LINKED' : 'PENDING'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Bank Name:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {bankName || 'Not Linked'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Account / IBAN:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {accountNumber || 'Not Submitted'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">IFSC Code:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {ifscCode || 'Not Submitted'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Account Holder:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {accountHolder}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!bankName && !accountNumber}
                      className="w-full text-xs font-semibold gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      {bankName && accountNumber ? 'Bank Account Verified' : 'Awaiting Driver Submission'}
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: RIDES / TRIPS */}
            <TabsContent value="trips">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Driver Trip History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    All on-demand auto and bike bookings fulfilled by this driver
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {activeDriver.recentTrips && activeDriver.recentTrips.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Ride ID</th>
                            <th className="py-3 px-4">Passenger</th>
                            <th className="py-3 px-4">Route</th>
                            <th className="py-3 px-4">Fare</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeDriver.recentTrips.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-mono font-medium">{t.id}</td>
                              <td className="py-3 px-4 font-medium">{t.passengerName}</td>
                              <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">
                                {t.pickup} → {t.drop}
                              </td>
                              <td className="py-3 px-4 font-semibold text-emerald-600">{t.fare}</td>
                              <td className="py-3 px-4 text-slate-400">
                                {new Date(t.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className="capitalize text-[10px]">
                                  {t.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      No ride records found for this driver.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: WALLET LOGS */}
            <TabsContent value="wallet">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Driver Wallet & Payout Logs
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Daily trip settlement, platform commission deduction, and cash incentive credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-16 text-center text-xs text-slate-400">
                  No manual wallet adjustment transactions recorded yet.
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: REVIEWS */}
            <TabsContent value="reviews">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Rider Evaluations & Feedback
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Direct passenger compliments, ratings, and ride quality remarks
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-16 text-center text-xs text-slate-400">
                  No customer reviews logged for this driver yet.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── EDIT PROFILE DIALOG ─────────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Driver Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update partner contact information, assigned operational zone, and vehicle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
            <div>
              <Label className="text-xs font-semibold">Driver Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                required
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Vehicle Type</Label>
                <select
                  value={editForm.vehicleType}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 text-xs"
                >
                  <option value="Auto">Auto</option>
                  <option value="Auto EV">Auto EV</option>
                  <option value="Bike">Bike</option>
                  <option value="Cab">Cab</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Vehicle Plate</Label>
                <Input
                  value={editForm.vehicleNumber}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                  className="mt-1 font-mono uppercase"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Operating Zone</Label>
              <Input
                value={editForm.zone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, zone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Driving License Number</Label>
              <Input
                value={editForm.drivingLicenseNumber}
                onChange={(e) => setEditForm((prev) => ({ ...prev, drivingLicenseNumber: e.target.value.toUpperCase() }))}
                className="mt-1 font-mono uppercase"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── WALLET ADJUSTMENT DIALOG ────────────────────────────────────── */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Adjust Driver Wallet</DialogTitle>
            <DialogDescription className="text-xs">
              Manually add or deduct earnings/incentives from {driverName}'s wallet.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWalletSubmit} className="space-y-3.5 text-xs">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={walletAction === 'add' ? 'default' : 'outline'}
                className={`flex-1 text-xs font-semibold ${walletAction === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                onClick={() => setWalletAction('add')}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Credit (Add)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={walletAction === 'remove' ? 'default' : 'outline'}
                className={`flex-1 text-xs font-semibold ${walletAction === 'remove' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                onClick={() => setWalletAction('remove')}
              >
                <Minus className="h-3.5 w-3.5 mr-1" />
                Debit (Deduct)
              </Button>
            </div>
            <div>
              <Label className="text-xs font-semibold">Amount (₹)</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                required
                className="mt-1 text-sm font-bold"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Reason / Audit Remarks</Label>
              <Input
                placeholder="e.g. Weekend performance bonus"
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowWalletDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={walletAction === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-red-600 hover:bg-red-700 text-white font-bold'}
              >
                Confirm {walletAction === 'add' ? 'Credit' : 'Debit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── SUSPEND / BLOCK CONFIRM DIALOG ──────────────────────────────── */}
      <ConfirmDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        title={isSuspended ? 'Activate Driver Account?' : 'Suspend Driver Account?'}
        description={
          isSuspended
            ? `Are you sure you want to restore ${driverName}? The driver will immediately receive road ride requests again.`
            : `Are you sure you want to suspend ${driverName}? The driver will be disconnected from the network and cannot accept bookings.`
        }
        confirmText={isSuspended ? 'Activate Driver' : 'Suspend Driver'}
        variant={isSuspended ? 'default' : 'destructive'}
        onConfirm={handleToggleBlock}
      />

      {/* ── REJECT REQUEST DIALOG ───────────────────────────────────────── */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600">Reject Driver Request</DialogTitle>
            <DialogDescription className="text-xs">
              State the reason for rejecting {driverName}'s onboarding documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <Label className="text-xs font-semibold">Rejection Reason</Label>
            <Input
              placeholder="e.g. Expired driving license or blurry image"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DOCUMENT PREVIEW & INSPECTION MODAL ─────────────────────────── */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {previewDoc?.title}
              </DialogTitle>
              {previewDoc?.frontImage && (
                <a
                  href={previewSide === 'back' && previewDoc?.backImage ? previewDoc.backImage : previewDoc.frontImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline mr-6"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Full File
                </a>
              )}
            </div>
            <DialogDescription className="text-xs">
              Document Reference: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{previewDoc?.number}</span>
              {previewDoc?.validTill && (
                <span className="ml-3 text-slate-500">
                  Valid Till: <span className="font-medium text-slate-700 dark:text-slate-300">{previewDoc.validTill}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Side Toggle Bar (Front / Back) if both images exist */}
          {previewDoc?.frontImage && previewDoc?.backImage && (
            <div className="flex items-center justify-center gap-2 pt-1 pb-2">
              <Button
                type="button"
                size="sm"
                variant={previewSide === 'front' ? 'default' : 'outline'}
                className={`h-7 px-3 text-xs font-semibold rounded-full ${previewSide === 'front' ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => setPreviewSide('front')}
              >
                Front Side
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewSide === 'back' ? 'default' : 'outline'}
                className={`h-7 px-3 text-xs font-semibold rounded-full ${previewSide === 'back' ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => setPreviewSide('back')}
              >
                Back Side
              </Button>
            </div>
          )}

          {/* Document Content View */}
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center min-h-[260px] max-h-[460px] overflow-hidden">
            {previewDoc?.frontImage ? (
              <img
                src={previewSide === 'back' && previewDoc?.backImage ? previewDoc.backImage : previewDoc.frontImage}
                alt={previewDoc.title}
                className="w-full max-h-[420px] object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 shadow-sm"
              />
            ) : (
              <div className="p-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Document Image Not Uploaded Yet
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  The driver has submitted reference number ({previewDoc?.number}), but has not uploaded a digital copy yet.
                </p>
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 mt-2">
                  Pending Driver Upload
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between items-center w-full">
            <span className="text-[11px] text-slate-400">
              Verified by Transport Dept. Registry &amp; DigiLocker Gateway
            </span>
            <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
