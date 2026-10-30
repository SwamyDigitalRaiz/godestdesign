import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { usePaymentSettingsStore } from '../../store/paymentSettingsStore';
import { useToast } from '../../components/ui/toaster';
import {
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Smartphone,
  CheckCircle,
  XCircle,
  Upload,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const PROVIDER_OPTIONS = [
  'Cashfree',
  'UPI',
  'Razorpay',
  'Stripe',
  'Wallet',
  'Cash',
];

export function PaymentOptions() {
  const {
    paymentOptions,
    addPaymentOption,
    updatePaymentOption,
    deletePaymentOption,
    togglePaymentOptionStatus,
    movePriority,
  } = usePaymentSettingsStore();

  const [showDialog, setShowDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'Cashfree',
    status: 'Active',
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setEditingOption(null);
    setFormData({
      name: '',
      description: '',
      provider: 'Cashfree',
      status: 'Active',
      imageUrl: '',
    });
    setImagePreview(null);
  };

  const handleEdit = (option) => {
    setEditingOption(option);
    setFormData({
      name: option.name || '',
      description: option.description || '',
      provider: option.provider || 'Cashfree',
      status: option.status || 'Active',
      imageUrl: option.imageUrl || '',
    });
    setImagePreview(option.imageUrl || null);
    setShowDialog(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Payment method display name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingOption) {
      updatePaymentOption(editingOption.id, formData);
      toast({
        title: 'Payment Method Updated',
        description: `"${formData.name}" has been updated successfully.`,
      });
    } else {
      addPaymentOption(formData);
      toast({
        title: 'Payment Method Added',
        description: `"${formData.name}" has been added to passenger payment options.`,
      });
    }

    setShowDialog(false);
    resetForm();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePaymentOption(deleteTarget.id);
    toast({
      title: 'Payment Method Deleted',
      description: `"${deleteTarget.name}" has been removed.`,
    });
    setDeleteTarget(null);
  };

  const sortedOptions = [...paymentOptions].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Dynamic Payment Methods
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage checkout payment gateways and methods presented to users during ride booking and wallet recharge.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold text-xs h-9 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedOptions.map((option, index) => (
          <Card
            key={option.id}
            className="overflow-hidden group hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className="relative h-32 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center p-4">
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt={option.name}
                  className="max-h-20 max-w-[160px] object-contain drop-shadow-sm"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                  <CreditCard size={40} />
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0.5 font-semibold ${
                    option.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800'
                  }`}
                >
                  {option.status}
                </Badge>
              </div>
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-mono text-slate-400 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  #{index + 1}
                </span>
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {option.name}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                {option.provider} Provider
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                {option.description || 'No description provided for this payment method.'}
              </p>

              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => handleEdit(option)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 h-8"
                  disabled={index === 0}
                  onClick={() => movePriority(option.id, 'up')}
                  title="Move Up in Checkout Priority"
                >
                  <ChevronUp size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 h-8"
                  disabled={index === sortedOptions.length - 1}
                  onClick={() => movePriority(option.id, 'down')}
                  title="Move Down in Checkout Priority"
                >
                  <ChevronDown size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`px-2 h-8 ${
                    option.status === 'Active'
                      ? 'text-amber-600 hover:text-amber-700'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                  onClick={() => togglePaymentOptionStatus(option.id)}
                  title={option.status === 'Active' ? 'Deactivate' : 'Activate'}
                >
                  {option.status === 'Active' ? <XCircle size={15} /> : <CheckCircle size={15} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(option)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedOptions.length === 0 && (
          <div className="col-span-full py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
            <Smartphone size={40} className="mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No payment methods configured
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Click the button above to add your first payment option.
            </p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Payment Option Modal ─────────────────────────────── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {editingOption ? 'Update Payment Method' : 'Create Payment Method'}
            </DialogTitle>
            <DialogDescription>
              Configure the display title, provider integration, and visibility for passenger checkout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="method-name">Display Title *</Label>
              <Input
                id="method-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cashfree PG, Google Pay, UPI"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="method-desc">Short Description</Label>
              <Input
                id="method-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Instant UPI and card checkout"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="method-provider">Provider Type</Label>
              <select
                id="method-provider"
                className="w-full h-9 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-slate-700 dark:text-slate-200"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo / Icon Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Method Logo / Icon</Label>
              <div
                className="group relative h-28 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain p-3"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button type="button" variant="secondary" size="sm" className="text-xs h-7">
                        Change Photo
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <Upload size={24} />
                    <span className="text-xs">Click to upload icon / logo</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Availability Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Method Availability</Label>
                <p className="text-[11px] text-slate-500">Enable or disable this option for passengers</p>
              </div>
              <Switch
                checked={formData.status === 'Active'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'Active' : 'Inactive' })
                }
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold text-xs"
              >
                {editingOption ? 'Update Method' : 'Save Method'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete Payment Method: ${deleteTarget?.name}`}
        description="Are you sure you want to delete this payment method? It will immediately stop appearing at checkout."
        confirmText="Delete Method"
        variant="danger"
      />
    </div>
  );
}
