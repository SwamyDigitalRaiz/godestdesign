import { useState, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { usePaymentSettingsStore } from '../../store/paymentSettingsStore';
import { useToast } from '../../components/ui/toaster';
import {
  Plus,
  Trash2,
  CreditCard,
  Building2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Globe,
  Upload,
  SlidersHorizontal,
  KeyRound,
  RefreshCw,
  Search,
  Zap,
} from 'lucide-react';

const PROVIDERS = [
  { value: 'Cashfree', label: 'Cashfree Payments', defaultLogo: 'https://images.seeklogo.com/logo-png/43/1/cashfree-payments-logo-png_seeklogo-434057.png' },
  { value: 'Razorpay', label: 'Razorpay Payments', defaultLogo: 'https://cdn.iconscout.com/icon/free/png-256/free-razorpay-logo-icon-download-in-svg-png-gif-file-formats--payment-gateway-brand-logos-pack-icons-5228801.png' },
];

export function PaymentSettingsPage() {
  const {
    paymentOptions,
    addPaymentOption,
    updatePaymentOption,
    deletePaymentOption,
    togglePaymentOptionStatus,
    movePriority,
    resetToDefaults,
  } = usePaymentSettingsStore();

  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'payin' | 'payout'
  const [imgErrors, setImgErrors] = useState({});

  // Dialog State
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [modalTab, setModalTab] = useState('basic'); // 'basic' | 'payin' | 'payout'
  const [showSecrets, setShowSecrets] = useState({
    payInSandbox: false,
    payInProd: false,
    payOutSandbox: false,
    payOutProd: false,
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State for Add / Edit
  const defaultFormData = {
    name: '',
    description: '',
    provider: 'Cashfree',
    status: 'Active',
    imageUrl: '',
    environment: 'sandbox',
    // Pay-In
    payInEnabled: true,
    payInSandboxAppId: '',
    payInSandboxSecret: '',
    payInProdAppId: '',
    payInProdSecret: '',
    // Pay-Out
    payOutEnabled: false,
    payOutSandboxClientId: '',
    payOutSandboxSecret: '',
    payOutProdClientId: '',
    payOutProdSecret: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingOption(null);
    setFormData({
      ...defaultFormData,
      imageUrl: PROVIDERS.find((p) => p.value === 'Cashfree')?.defaultLogo || '',
    });
    setModalTab('basic');
    setShowSecrets({
      payInSandbox: false,
      payInProd: false,
      payOutSandbox: false,
      payOutProd: false,
    });
    setShowModal(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (option) => {
    setEditingOption(option);
    setFormData({
      name: option.name || '',
      description: option.description || '',
      provider: option.provider || 'Other',
      status: option.status || 'Active',
      imageUrl: option.imageUrl || '',
      environment: option.environment || 'sandbox',
      // Pay-In
      payInEnabled: option.payInEnabled ?? true,
      payInSandboxAppId: option.payInSandboxAppId || '',
      payInSandboxSecret: option.payInSandboxSecret || '',
      payInProdAppId: option.payInProdAppId || '',
      payInProdSecret: option.payInProdSecret || '',
      // Pay-Out
      payOutEnabled: option.payOutEnabled ?? false,
      payOutSandboxClientId: option.payOutSandboxClientId || '',
      payOutSandboxSecret: option.payOutSandboxSecret || '',
      payOutProdClientId: option.payOutProdClientId || '',
      payOutProdSecret: option.payOutProdSecret || '',
    });
    setModalTab('basic');
    setShowSecrets({
      payInSandbox: false,
      payInProd: false,
      payOutSandbox: false,
      payOutProd: false,
    });
    setShowModal(true);
  };

  // Handle Provider Change in Form
  const handleProviderChange = (newProvider) => {
    const provMeta = PROVIDERS.find((p) => p.value === newProvider);
    setFormData((prev) => ({
      ...prev,
      provider: newProvider,
      imageUrl: provMeta?.defaultLogo || prev.imageUrl,
    }));
  };

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Modal
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a payment method name.',
        variant: 'destructive',
      });
      return;
    }

    if (editingOption) {
      updatePaymentOption(editingOption.id, formData);
      toast({
        title: 'Payment Method Updated',
        description: `Successfully updated ${formData.name} configuration and keys.`,
      });
    } else {
      addPaymentOption(formData);
      toast({
        title: 'Payment Method Added',
        description: `Successfully added ${formData.name} to the active payment methods list.`,
      });
    }
    setShowModal(false);
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deletePaymentOption(deleteTarget.id);
      toast({
        title: 'Payment Method Removed',
        description: `${deleteTarget.name} has been removed.`,
      });
      setDeleteTarget(null);
    }
  };

  // Filtered & Sorted List
  const sortedOptions = [...paymentOptions].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  const filteredOptions = sortedOptions.filter((opt) => {
    const matchSearch =
      opt.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && opt.status === 'Active') ||
      (statusFilter === 'inactive' && opt.status === 'Inactive') ||
      (statusFilter === 'payin' && opt.payInEnabled) ||
      (statusFilter === 'payout' && opt.payOutEnabled);

    return matchSearch && matchStatus;
  });

  // Metrics
  const totalCount = paymentOptions.length;
  const activeCount = paymentOptions.filter((o) => o.status === 'Active').length;
  const payInCount = paymentOptions.filter((o) => o.payInEnabled && o.status === 'Active').length;
  const payOutCount = paymentOptions.filter((o) => o.payOutEnabled && o.status === 'Active').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Settings</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Payment Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
            Payment Methods & Gateway Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage all checkout options, Pay-In gateway keys, and driver settlement Pay-Out credentials directly per method.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs text-slate-600 dark:text-slate-300"
            title="Reset to default seeded payment methods"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* ── Metrics Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Methods</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Checkouts</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pay-In Ready</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{payInCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Driver Pay-Outs</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{payOutCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search Bar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by payment name or provider..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Methods' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'payin', label: 'Pay-In Enabled' },
            { id: 'payout', label: 'Pay-Out Enabled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vertical List of Payment Methods ──────────────────────────── */}
      <div className="space-y-3">
        {filteredOptions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <SlidersHorizontal className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Payment Methods Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No payment methods match your filter. Click below to add a new payment gateway or method.
            </p>
            <Button onClick={handleOpenAdd} className="mt-4 bg-primary text-slate-950 font-semibold" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          filteredOptions.map((option, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === filteredOptions.length - 1;
            const env = option.environment || 'sandbox';

            // Pay-In Status
            const activePayInKey =
              env === 'production' ? option.payInProdAppId : option.payInSandboxAppId;
            const payInConfigured = option.payInEnabled && Boolean(activePayInKey);

            // Pay-Out Status
            const activePayOutKey =
              env === 'production' ? option.payOutProdClientId : option.payOutSandboxClientId;
            const payOutConfigured = option.payOutEnabled && Boolean(activePayOutKey);

            return (
              <Card
                key={option.id}
                className={`border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
                  option.status === 'Active'
                    ? 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Priority handles & Brand Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Reorder Up / Down Controls */}
                    <div className="flex flex-col items-center justify-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                      <button
                        onClick={() => movePriority(option.id, 'up')}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 disabled:hover:text-slate-500 transition-colors"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 px-1">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => movePriority(option.id, 'down')}
                        disabled={isLast}
                        title="Move Down"
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 disabled:hover:text-slate-500 transition-colors"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Image / Logo */}
                    <div className="w-12 h-12 min-w-[48px] max-w-[48px] min-h-[48px] max-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center p-1 shrink-0 shadow-xs overflow-hidden">
                      {option.provider === 'Cashfree' ? (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#4834D4] flex flex-col items-center justify-center text-white shadow-xs">
                          <span className="font-extrabold text-sm tracking-tight leading-none">CF</span>
                          <span className="text-[8px] font-medium opacity-80 scale-90">PAY</span>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#0C2340] to-[#0284C7] flex flex-col items-center justify-center text-white shadow-xs">
                          <Zap className="h-4 w-4 text-[#FACC15] fill-[#FACC15]" />
                          <span className="text-[8px] font-bold tracking-tight opacity-90 scale-90">RZP</span>
                        </div>
                      )}
                    </div>

                    {/* Method Titles & Badges */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                          {option.name}
                        </h4>

                        {option.provider && (
                          <Badge variant="outline" className="text-[11px] font-medium border-slate-300 dark:border-slate-700">
                            {option.provider}
                          </Badge>
                        )}

                        {/* Environment Badge */}
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            env === 'production'
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40'
                          }`}
                        >
                          {env}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {option.description || 'Customer payment method enabled on checkout'}
                      </p>

                      {/* Pay-In & Pay-Out Key Status Pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Pay-In Key Indicator */}
                        <div
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                            payInConfigured
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>
                            Pay-In:{' '}
                            {payInConfigured ? (
                              <span className="font-mono">{activePayInKey.slice(0, 10)}...</span>
                            ) : (
                              'Off / Not Set'
                            )}
                          </span>
                        </div>

                        {/* Pay-Out Key Indicator */}
                        <div
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                            payOutConfigured
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <Building2 className="h-3 w-3" />
                          <span>
                            Pay-Out:{' '}
                            {payOutConfigured ? (
                              <span className="font-mono">{activePayOutKey.slice(0, 10)}...</span>
                            ) : (
                              'Off / Disabled'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Toggle Switch & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={option.status === 'Active'}
                        onCheckedChange={() => togglePaymentOptionStatus(option.id)}
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {option.status === 'Active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(option)}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-primary" />
                      Configure & Keys
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(option)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 h-8 w-8"
                      title="Delete payment option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Add / Edit Payment Method Dialog with Keys ────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              {editingOption ? `Configure: ${editingOption.name}` : 'Add New Payment Method'}
            </DialogTitle>
            <DialogDescription>
              Set up checkout details, active transaction environment, and Pay-In / Pay-Out API keys.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mt-2">
            <button
              type="button"
              onClick={() => setModalTab('basic')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                modalTab === 'basic'
                  ? 'border-primary text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              1. Method Details
            </button>

            <button
              type="button"
              onClick={() => setModalTab('payin')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                modalTab === 'payin'
                  ? 'border-primary text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              2. Pay-In Gateway Keys
              {formData.payInEnabled && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setModalTab('payout')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                modalTab === 'payout'
                  ? 'border-primary text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              3. Pay-Out Settlement Keys
              {formData.payOutEnabled && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          </div>

          {/* ── TAB 1: BASIC DETAILS ────────────────────────────────────── */}
          {modalTab === 'basic' && (
            <div className="space-y-4 py-3">
              {/* Provider Preset Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Provider / Engine</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PROVIDERS.map((prov) => {
                    const isSelected = formData.provider === prov.value;
                    return (
                      <button
                        key={prov.value}
                        type="button"
                        onClick={() => handleProviderChange(prov.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs font-semibold text-slate-900 dark:text-white'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                          {prov.value === 'Cashfree' ? (
                            <div className="w-full h-full bg-gradient-to-br from-[#6C5CE7] to-[#4834D4] flex items-center justify-center text-white font-bold text-[11px]">
                              CF
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#0C2340] to-[#0284C7] flex items-center justify-center text-white font-bold text-[11px]">
                              <Zap className="h-3.5 w-3.5 text-[#FACC15] fill-[#FACC15]" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs truncate">{prov.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Cashfree Payments, Razorpay, In-App Wallet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description / Passenger Subtitle</Label>
                <Input
                  placeholder="e.g. Instant zero-fee UPI and cards checkout"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              {/* Environment Toggle */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Active Gateway Environment
                  </Label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose whether this payment method operates in live test Sandbox or Production
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, environment: 'sandbox' })}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      formData.environment === 'sandbox'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, environment: 'production' })}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      formData.environment === 'production'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Production
                  </button>
                </div>
              </div>

              {/* Custom Logo URL / Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Branding Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 min-w-[48px] max-w-[48px] min-h-[48px] max-h-[48px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="preview" className="w-full h-full max-h-8 max-w-8 object-contain" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <Input
                    placeholder="Paste logo image URL or upload file"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="h-9 text-xs flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 text-xs"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Active at Checkout</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enable or disable this payment option on passenger ride bookings
                  </p>
                </div>
                <Switch
                  checked={formData.status === 'Active'}
                  onCheckedChange={(c) => setFormData({ ...formData, status: c ? 'Active' : 'Inactive' })}
                />
              </div>
            </div>
          )}

          {/* ── TAB 2: PAY-IN GATEWAY KEYS ──────────────────────────────── */}
          {modalTab === 'payin' && (
            <div className="space-y-4 py-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Enable Pay-In Passenger Collections
                  </h4>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                    Collect ride fares, wallet top-ups, and booking payments from passengers
                  </p>
                </div>
                <Switch
                  checked={formData.payInEnabled}
                  onCheckedChange={(c) => setFormData({ ...formData, payInEnabled: c })}
                />
              </div>

              {/* Sandbox Pay-In Keys */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">🧪 Sandbox Gateway Keys</span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 border-amber-300">
                      LIVE TEST
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">App ID / Client Key</Label>
                  <Input
                    placeholder="e.g. TEST1029384756abcdef..."
                    value={formData.payInSandboxAppId}
                    onChange={(e) => setFormData({ ...formData, payInSandboxAppId: e.target.value })}
                    className="font-mono text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secret Key</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.payInSandbox ? 'text' : 'password'}
                      placeholder="e.g. cfsk_ma_test_..."
                      value={formData.payInSandboxSecret}
                      onChange={(e) => setFormData({ ...formData, payInSandboxSecret: e.target.value })}
                      className="font-mono text-xs h-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((prev) => ({ ...prev, payInSandbox: !prev.payInSandbox }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets.payInSandbox ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Production Pay-In Keys */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">🚀 Production Gateway Keys</span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 border-emerald-300">
                      LIVE MONEY
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Production App ID</Label>
                  <Input
                    placeholder="Enter production gateway App ID"
                    value={formData.payInProdAppId}
                    onChange={(e) => setFormData({ ...formData, payInProdAppId: e.target.value })}
                    className="font-mono text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Production Secret Key</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.payInProd ? 'text' : 'password'}
                      placeholder="Enter production gateway Secret Key"
                      value={formData.payInProdSecret}
                      onChange={(e) => setFormData({ ...formData, payInProdSecret: e.target.value })}
                      className="font-mono text-xs h-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((prev) => ({ ...prev, payInProd: !prev.payInProd }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets.payInProd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: PAY-OUT SETTLEMENT KEYS ──────────────────────────── */}
          {modalTab === 'payout' && (
            <div className="space-y-4 py-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Enable Pay-Out Settlements (Driver Earnings)
                  </h4>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-400 mt-0.5">
                    Automated IMPS, NEFT, and UPI settlements for driver wallet withdrawals
                  </p>
                </div>
                <Switch
                  checked={formData.payOutEnabled}
                  onCheckedChange={(c) => setFormData({ ...formData, payOutEnabled: c })}
                />
              </div>

              {/* Sandbox Payout Keys */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">🧪 Sandbox Payout Client</span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 border-amber-300">
                      LIVE TEST
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payout Client ID</Label>
                  <Input
                    placeholder="e.g. PO_TEST_998877665544..."
                    value={formData.payOutSandboxClientId}
                    onChange={(e) => setFormData({ ...formData, payOutSandboxClientId: e.target.value })}
                    className="font-mono text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payout Client Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.payOutSandbox ? 'text' : 'password'}
                      placeholder="e.g. cfsk_payout_test_..."
                      value={formData.payOutSandboxSecret}
                      onChange={(e) => setFormData({ ...formData, payOutSandboxSecret: e.target.value })}
                      className="font-mono text-xs h-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((prev) => ({ ...prev, payOutSandbox: !prev.payOutSandbox }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets.payOutSandbox ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Production Payout Keys */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">🚀 Production Payout Client</span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 border-emerald-300">
                      LIVE MONEY
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Production Payout Client ID</Label>
                  <Input
                    placeholder="Enter production payout client ID"
                    value={formData.payOutProdClientId}
                    onChange={(e) => setFormData({ ...formData, payOutProdClientId: e.target.value })}
                    className="font-mono text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Production Payout Client Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.payOutProd ? 'text' : 'password'}
                      placeholder="Enter production payout client secret"
                      value={formData.payOutProdSecret}
                      onChange={(e) => setFormData({ ...formData, payOutProdSecret: e.target.value })}
                      className="font-mono text-xs h-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((prev) => ({ ...prev, payOutProd: !prev.payOutProd }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets.payOutProd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-slate-200 dark:border-slate-800 pt-3">
            <Button variant="outline" onClick={() => setShowModal(false)} size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold"
              size="sm"
            >
              {editingOption ? 'Update Method & Keys' : 'Save Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Remove Payment Method
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? Passengers will no longer see this payment method at checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} size="sm">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              size="sm"
            >
              Delete Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
