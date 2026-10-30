import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation, useSearchParams } from 'react-router-dom';

const resolveUploadUrl = (url) => {
  if (!url) return '';
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

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useDriverStore } from '../../../store/driverStore';
import { useZoneStore } from '../../../store/zoneStore';
import { useVehicleStore } from '../../../store/vehicleStore';
import { useAmenityStore } from '../../../store/amenityStore';
import { useFleetOperatorStore } from '../../../store/fleetOperatorStore';
import { useToast } from '../../../components/ui/toaster';
import {
  User,
  Car,
  Bike,
  CreditCard,
  Upload,
  ChevronRight,
  ArrowLeft,
  X,
  Phone,
  Mail,
  Lock,
  Globe,
  Calendar,
  MapPin,
  Building2,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  FileText,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN (+91)' },
  { code: '+1', country: 'US (+1)' },
  { code: '+44', country: 'UK (+44)' },
  { code: '+971', country: 'UAE (+971)' },
  { code: '+65', country: 'SG (+65)' },
  { code: '+61', country: 'AU (+61)' },
];

const PRESET_LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 'Urdu', 'Marathi'];

const FALLBACK_AMENITIES = [
  'Large luggage capacity',
  'Wi-Fi connectivity',
  'Soundproof',
  'USB charging ports',
  'No Pets',
  'GPS Supported',
  'Rain Curtains / Weather Shield',
  'Extra Helmet Provided',
];

const PERSONAL_ID_TYPES = ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport', 'National ID'];

const STEPS = [
  { id: 1, title: 'Personal Info', subtitle: 'Identity & Contact', icon: User },
  { id: 2, title: 'Vehicle Details', subtitle: 'Category & Plate', icon: Car },
  { id: 3, title: 'Driving License', subtitle: 'License & RC', icon: FileCheck },
  { id: 4, title: 'Personal ID', subtitle: 'Aadhaar / National ID', icon: ShieldCheck },
  { id: 5, title: 'Bank Details', subtitle: 'Payout Settlements', icon: CreditCard },
];

export function AddBikeAutoDriverPage() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editId = paramId || searchParams.get('id') || searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const { addDriver, updateDriver, fetchDriverById } = useDriverStore();
  const { zones, fetchZones } = useZoneStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { amenities: amenityList, fetchAmenities } = useAmenityStore();
  const { operators, fetchOperators } = useFleetOperatorStore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDriver, setLoadingDriver] = useState(isEditMode);
  const [existingDriver, setExistingDriver] = useState(location.state?.driver || null);

  // Previews
  const [profilePreview, setProfilePreview] = useState(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState(null);
  const [licenseFrontPreview, setLicenseFrontPreview] = useState(null);
  const [licenseBackPreview, setLicenseBackPreview] = useState(null);
  const [rcImagePreview, setRcImagePreview] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);

  // Preference multi-select dropdown
  const [preferenceDropdownOpen, setPreferenceDropdownOpen] = useState(false);
  const preferenceDropdownRef = useRef(null);

  // Master Form State matching Mobile Driver Onboarding 1:1
  const [form, setForm] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    profileImage: '',
    primaryCountryCode: '+91',
    primaryPhone: '',
    secondaryCountryCode: '+91',
    secondaryPhone: '',
    email: '',
    password: '',
    nationality: 'Indian',
    dob: '',
    address: '',
    zone: '',
    languages: ['Telugu', 'Hindi'],
    status: true,
    source: 'admin',
    vendorId: '',
    vendor: 'Direct Partner',

    // Step 2: Vehicle Details
    vehicleType: '',
    vehicleImage: '',
    vehicleNumber: '',
    vehicleColor: 'Matte Black',
    passengerCapacity: 1,
    vehiclePreferences: ['Soundproof', 'No Pets'],
    vehiclePreference: 'Soundproof, No Pets',

    // Step 3: Driving License & RC
    drivingLicenseNumber: '',
    drivingLicenseExpiry: '',
    drivingLicenseImage: '',
    drivingLicenseBackImage: '',
    rcNumber: '',
    rcImage: '',

    // Step 4: Personal ID (Aadhaar / National ID)
    personalIdType: 'Aadhaar Card',
    personalIdNumber: '',
    personalIdFrontImage: '',
    personalIdBackImage: '',

    // Step 5: Bank Details
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    ibanNumber: '',
    vatId: '',
    upiId: '',
  });

  const populateFromDriver = (drv) => {
    if (!drv) return;
    setExistingDriver(drv);

    const fullName = drv.name || '';
    const fName = drv.firstName || (fullName ? fullName.split(' ')[0] : '');
    const lName = drv.lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : '');

    // Format phone
    let rawPhone = drv.primaryPhone || drv.phone || '';
    if (rawPhone.startsWith('+91')) {
      rawPhone = rawPhone.substring(3).trim();
    }
    let rawSecPhone = drv.secondaryPhone || '';
    if (rawSecPhone.startsWith('+91')) {
      rawSecPhone = rawSecPhone.substring(3).trim();
    }

    setForm({
      firstName: fName || '',
      lastName: lName || '',
      profileImage: drv.profileImage || '',
      primaryCountryCode: drv.primaryCountryCode || '+91',
      primaryPhone: rawPhone || '',
      secondaryCountryCode: drv.secondaryCountryCode || '+91',
      secondaryPhone: rawSecPhone || '',
      email: drv.email && drv.email !== 'Not Provided' ? drv.email : '',
      password: '',
      nationality: drv.nationality || 'Indian',
      dob: drv.dob || '',
      address: drv.address || '',
      zone: drv.zone || '',
      languages: Array.isArray(drv.languages) && drv.languages.length > 0 ? drv.languages : ['Telugu', 'Hindi'],
      status: drv.status !== false && drv.status !== 'Suspended',

      vehicleType: drv.vehicleType || '',
      vehicleImage: drv.vehicleImage || '',
      vehicleNumber: drv.vehicleNumber || drv.vehicleRegistrationNumber || '',
      vehicleColor: drv.vehicleColor || 'Yellow & Black',
      passengerCapacity: drv.passengerCapacity || 1,
      vehiclePreferences: Array.isArray(drv.vehiclePreferences) && drv.vehiclePreferences.length > 0
        ? drv.vehiclePreferences
        : ['Soundproof', 'No Pets'],
      vehiclePreference: drv.vehiclePreference || (drv.vehiclePreferences ? drv.vehiclePreferences.join(', ') : ''),

      drivingLicenseNumber: drv.drivingLicenseNumber || '',
      drivingLicenseExpiry: drv.drivingLicenseExpiry || '',
      drivingLicenseImage: drv.drivingLicenseImage || '',
      drivingLicenseBackImage: drv.drivingLicenseBackImage || '',
      rcNumber: drv.rcNumber || '',
      rcImage: drv.rcImage || '',

      personalIdType: drv.personalIdType || 'Aadhaar Card',
      personalIdNumber: drv.personalIdNumber || '',
      personalIdFrontImage: drv.personalIdFrontImage || '',
      personalIdBackImage: drv.personalIdBackImage || '',

      bankName: drv.bankName || '',
      accountNumber: drv.accountNumber || '',
      accountHolderName: drv.accountHolderName || `${fName} ${lName}`.trim(),
      ifscCode: drv.ifscCode || '',
      ibanNumber: drv.ibanNumber || '',
      vatId: drv.vatId || '',
      upiId: drv.upiId || '',
      source: drv.source === 'fleet_operator' || drv.vendorId ? 'fleet_operator' : 'admin',
      vendorId: drv.vendorId?._id || drv.vendorId || '',
      vendor: drv.vendor || (drv.vendorId?.name || 'Direct Partner'),
    });

    if (drv.profileImage) setProfilePreview(resolveUploadUrl(drv.profileImage));
    if (drv.vehicleImage) setVehicleImagePreview(resolveUploadUrl(drv.vehicleImage));
    if (drv.drivingLicenseImage) setLicenseFrontPreview(resolveUploadUrl(drv.drivingLicenseImage));
    if (drv.drivingLicenseBackImage) setLicenseBackPreview(resolveUploadUrl(drv.drivingLicenseBackImage));
    if (drv.rcImage) setRcImagePreview(resolveUploadUrl(drv.rcImage));
    if (drv.personalIdFrontImage) setIdFrontPreview(resolveUploadUrl(drv.personalIdFrontImage));
    if (drv.personalIdBackImage) setIdBackPreview(resolveUploadUrl(drv.personalIdBackImage));
  };

  // Populate driver if editing
  useEffect(() => {
    if (!isEditMode) return;
    if (location.state?.driver) {
      populateFromDriver(location.state.driver);
      setLoadingDriver(false);
    }
    fetchDriverById(editId).then((fetched) => {
      if (fetched) {
        populateFromDriver(fetched);
      }
      setLoadingDriver(false);
    }).catch(() => {
      setLoadingDriver(false);
    });
  }, [editId, isEditMode]);

  // Fetch dynamic vehicles, zones, amenities, and fleet operators from database
  useEffect(() => {
    fetchVehicles();
    fetchZones();
    fetchAmenities({ status: 'active' });
    fetchOperators({ all: true });
  }, [fetchVehicles, fetchZones, fetchAmenities, fetchOperators]);

  useEffect(() => {
    if (!isEditMode && vehicles.length > 0 && !form.vehicleType) {
      const first = vehicles[0];
      const firstImg = first.image || first.mapImage || '';
      setForm((prev) => ({
        ...prev,
        vehicleType: first.name,
        passengerCapacity: first.capacity || 1,
        vehicleImage: prev.vehicleImage || firstImg,
      }));
      if (!vehicleImagePreview && firstImg) {
        setVehicleImagePreview(firstImg);
      }
    }
  }, [vehicles, isEditMode]);

  useEffect(() => {
    if (!isEditMode && zones.length > 0 && !form.zone) {
      setForm((prev) => ({
        ...prev,
        zone: zones[0].name,
      }));
    }
  }, [zones, isEditMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (preferenceDropdownRef.current && !preferenceDropdownRef.current.contains(event.target)) {
        setPreferenceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleTypeChange = (vehicleName) => {
    const selected = vehicles.find((v) => v.name === vehicleName || v._id === vehicleName);
    const vehicleImg = selected ? selected.image || selected.mapImage || '' : '';
    setForm((prev) => ({
      ...prev,
      vehicleType: selected ? selected.name : vehicleName,
      passengerCapacity: selected ? selected.capacity || 1 : 1,
      vehicleImage: prev.vehicleImage || vehicleImg,
    }));
    if (vehicleImg) {
      setVehicleImagePreview(vehicleImg);
    }
  };

  const toggleLanguage = (lang) => {
    setForm((prev) => {
      const exists = prev.languages.includes(lang);
      const updated = exists ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang];
      return { ...prev, languages: updated };
    });
  };

  const togglePreference = (pref) => {
    setForm((prev) => {
      const current = prev.vehiclePreferences || [];
      const exists = current.includes(pref);
      const updated = exists ? current.filter((p) => p !== pref) : [...current, pref];
      return {
        ...prev,
        vehiclePreferences: updated,
        vehiclePreference: updated.join(', '),
      };
    });
  };

  const removePreference = (pref, e) => {
    e?.stopPropagation();
    setForm((prev) => {
      const updated = (prev.vehiclePreferences || []).filter((p) => p !== pref);
      return {
        ...prev,
        vehiclePreferences: updated,
        vehiclePreference: updated.join(', '),
      };
    });
  };

  const handleGenericFileChange = (e, fieldKey, setPreview) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setForm((prev) => ({ ...prev, [fieldKey]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Validation before progressing
  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!form.firstName.trim()) {
        toast({ title: 'First Name Required', description: 'Please enter driver’s first name.', variant: 'destructive' });
        return false;
      }
      const pPhone = form.primaryPhone?.trim() || '';
      if (!pPhone) {
        toast({ title: 'Primary Mobile Required', description: 'Please enter driver’s primary 10-digit mobile number.', variant: 'destructive' });
        return false;
      }
      if (!/^\d{10}$/.test(pPhone)) {
        toast({ title: 'Invalid Primary Phone', description: 'Primary phone must be exactly 10 digits (numbers only).', variant: 'destructive' });
        return false;
      }
      if (form.primaryCountryCode === '+91' && !/^[6-9]\d{9}$/.test(pPhone)) {
        toast({ title: 'Invalid Mobile Number', description: 'Indian mobile numbers must start with 6, 7, 8, or 9 and have 10 digits.', variant: 'destructive' });
        return false;
      }

      const sPhone = form.secondaryPhone?.trim() || '';
      if (sPhone) {
        if (!/^\d{10}$/.test(sPhone)) {
          toast({ title: 'Invalid Secondary Phone', description: 'Secondary emergency phone must be exactly 10 digits (numbers only).', variant: 'destructive' });
          return false;
        }
        if (form.secondaryCountryCode === '+91' && !/^[6-9]\d{9}$/.test(sPhone)) {
          toast({ title: 'Invalid Secondary Mobile', description: 'Secondary mobile numbers must start with 6, 7, 8, or 9 and have 10 digits.', variant: 'destructive' });
          return false;
        }
        if (sPhone === pPhone) {
          toast({ title: 'Duplicate Phone Numbers', description: 'Secondary emergency phone must be different from primary phone.', variant: 'destructive' });
          return false;
        }
      }
      return true;
    }

    if (stepNumber === 2) {
      if (!form.vehicleType) {
        toast({ title: 'Vehicle Category Required', description: 'Please select a vehicle category from the available options.', variant: 'destructive' });
        return false;
      }
      if (!form.vehicleNumber.trim()) {
        toast({ title: 'Vehicle Plate Number Required', description: 'Please enter the vehicle registration plate number.', variant: 'destructive' });
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      if (!form.drivingLicenseNumber.trim()) {
        toast({ title: 'Driving License Number Required', description: 'Please enter the driver’s official license number.', variant: 'destructive' });
        return false;
      }
      return true;
    }

    if (stepNumber === 4) {
      if (!form.personalIdNumber.trim()) {
        toast({ title: 'Personal ID Number Required', description: `Please enter the ${form.personalIdType} number.`, variant: 'destructive' });
        return false;
      }
      return true;
    }

    if (stepNumber === 5) {
      if (!form.bankName?.trim()) {
        toast({ title: 'Bank Name Required', description: 'Please enter the bank name for payout settlements.', variant: 'destructive' });
        return false;
      }
      if (!form.accountHolderName?.trim()) {
        toast({ title: 'Account Holder Name Required', description: 'Please enter the registered bank account holder name.', variant: 'destructive' });
        return false;
      }
      if (!form.accountNumber?.trim() && !form.ibanNumber?.trim()) {
        toast({ title: 'Account Number Required', description: 'Please enter the bank account number or IBAN.', variant: 'destructive' });
        return false;
      }
      if (!form.ifscCode?.trim() && !form.vatId?.trim()) {
        toast({ title: 'IFSC Code Required', description: 'Please enter the bank IFSC code for settlement transfers.', variant: 'destructive' });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submitting from intermediate steps (e.g., if user presses Enter on Step 4 or earlier in onboarding)
    if (currentStep < 5 && !isEditMode) {
      handleNextStep();
      return;
    }

    // Strictly validate all 5 steps before submitting
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const finalDriver = {
        ...form,
        name: `${form.firstName} ${form.lastName}`.trim(),
        profileImage: form.profileImage || '',
        vehicleImage: form.vehicleImage || vehicleImagePreview || '',
        accountHolderName: form.accountHolderName || `${form.firstName} ${form.lastName}`.trim(),
      };

      // Resolve source & fleet vendor affiliation
      if (form.source === 'fleet_operator' && form.vendorId) {
        finalDriver.source = 'fleet_operator';
        finalDriver.vendorId = form.vendorId;
        const matchedOp = operators.find(
          (o) => o._id === form.vendorId || o.id === form.vendorId || o.customId === form.vendorId
        );
        finalDriver.vendor = matchedOp ? matchedOp.name : (form.vendor || 'Fleet Operator');
      } else {
        finalDriver.source = 'admin';
        finalDriver.vendorId = null;
        finalDriver.vendor = 'Direct Partner';
      }

      if (isEditMode) {
        if (!finalDriver.password) {
          delete finalDriver.password;
        }

        const res = await updateDriver(editId, finalDriver);
        if (res && res.success === false) {
          toast({
            title: 'Failed to Update Driver',
            description: res.message || 'Error occurred while saving driver to backend.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }

        toast({
          title: 'Driver Updated Successfully! 🎉',
          description: `${finalDriver.firstName} ${finalDriver.lastName}'s profile and documents have been updated.`,
        });

        navigate(`/drivers/profile/${editId}`);
      } else {
        finalDriver.kycStatus = 'approved';
        finalDriver.status = true;

        const res = await addDriver(finalDriver);
        if (res && res.success === false) {
          toast({
            title: 'Failed to Add Driver',
            description: res.message || 'Error occurred while saving driver to backend.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }

        toast({
          title: 'Driver Successfully Onboarded! 🎉',
          description: `${finalDriver.firstName} ${finalDriver.lastName} has been registered and verified across all 5 steps.`,
        });

        navigate('/drivers');
      }
    } catch (err) {
      toast({
        title: 'Submission Error',
        description: err.message || 'Failed to submit driver.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>People</span>
            <ChevronRight className="h-3 w-3" />
            <Link to="/drivers" className="hover:text-primary transition-colors">Drivers</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">
              {isEditMode ? `Edit Driver (${existingDriver?.customId || editId})` : 'Add Driver (5-Step Wizard)'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {isEditMode
              ? `Edit Driver: ${form.firstName ? `${form.firstName} ${form.lastName}` : existingDriver?.name || 'Driver'}`
              : 'Driver Onboarding Wizard'}
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              {isEditMode ? `Editing • Step ${currentStep} of 5` : `Step ${currentStep} of 5`}
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditMode
              ? 'Update driver credentials, vehicle details, KYC documents, and bank payout information.'
              : 'Mirroring driver mobile app progression: Identity, Vehicle Category, License, Aadhaar, and Bank Payouts.'}
          </p>
        </div>

        <Link to={isEditMode ? `/drivers/profile/${editId}` : "/drivers"}>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            {isEditMode ? 'Back to Driver Profile' : 'Back to Driver List'}
          </Button>
        </Link>
      </div>

      {/* SolarWinds 5-Step Visual Stepper Bar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (isEditMode) {
                      setCurrentStep(step.id);
                      return;
                    }
                    if (step.id <= currentStep) {
                      setCurrentStep(step.id);
                      return;
                    }
                    for (let s = 1; s < step.id; s++) {
                      if (!validateStep(s)) {
                        setCurrentStep(s);
                        return;
                      }
                    }
                    setCurrentStep(step.id);
                  }}
                  className={`flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/40'
                      : isCompleted || isEditMode
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                      {step.id}. {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{step.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            if (currentStep < 5 && !isEditMode) {
              e.preventDefault();
              handleNextStep();
            }
          }
        }}
      >
        {/* ─── STEP 1: PERSONAL INFORMATION ─────────────────────────────────── */}
        {currentStep === 1 && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Step 1: Personal Information & Credentials
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Matches mobile app Step 1: Identity, emergency phone, address, operating zone, and languages.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 shadow-sm shrink-0">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Driver preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePreview(null);
                        setForm((prev) => ({ ...prev, profileImage: '' }));
                      }}
                      className="absolute top-0 right-0 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Driver Profile Picture</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Clear passport photo or selfie showing face clearly.
                  </p>
                  <div className="mt-2.5">
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={(e) => handleGenericFileChange(e, 'profileImage', setProfilePreview)}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      Choose Photo
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Ramesh"
                    value={form.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Last Name <span className="text-slate-400">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Varma"
                    value={form.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="driver@godest.in"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                {/* Primary Mobile Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Primary Phone (Login Phone) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${
                      form.primaryPhone?.length === 10 ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                      {form.primaryPhone?.length || 0}/10 digits
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={form.primaryCountryCode}
                      onChange={(e) => handleInputChange('primaryCountryCode', e.target.value)}
                      className="w-24 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2 text-slate-900 dark:text-white"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.country}</option>
                      ))}
                    </select>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="9876543210 (10 digits)"
                      value={form.primaryPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange('primaryPhone', val);
                      }}
                      className="flex-1 font-mono tracking-wide"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Must be a valid 10-digit mobile number for driver OTP login.</p>
                </div>

                {/* Secondary Phone */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Emergency / Secondary Phone
                    </label>
                    {form.secondaryPhone && (
                      <span className={`text-[10px] font-mono font-bold ${
                        form.secondaryPhone.length === 10 ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {form.secondaryPhone.length}/10 digits
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={form.secondaryCountryCode}
                      onChange={(e) => handleInputChange('secondaryCountryCode', e.target.value)}
                      className="w-24 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2 text-slate-900 dark:text-white"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.country}</option>
                      ))}
                    </select>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="Optional 10-digit emergency phone"
                      value={form.secondaryPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange('secondaryPhone', val);
                      }}
                      className="flex-1 font-mono tracking-wide"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Optional alternate emergency contact, restricted to 10 digits.</p>
                </div>

                {/* Driver Portal Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {isEditMode ? 'Change Password (Optional)' : 'Initial App Password'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isEditMode ? 'Leave blank to keep current password' : 'Set password (min 6 chars)'}
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>

                {/* Nationality */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Nationality
                  </label>
                  <Input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                </div>

                {/* Operating Zone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Assigned Operating Zone
                  </label>
                  <select
                    value={form.zone}
                    onChange={(e) => handleInputChange('zone', e.target.value)}
                    className="w-full text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {zones.length === 0 ? (
                      <option value="">No zones configured yet (Create in Zones)</option>
                    ) : (
                      zones.map((z) => (
                        <option key={z._id || z.id || z.name} value={z.name}>{z.name}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Residential Address
                  </label>
                  <Input
                    type="text"
                    placeholder="House/Flat No, Street, Landmark, City, Pincode"
                    value={form.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>

              {/* Languages Known Chips */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Languages Known
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_LANGUAGES.map((lang) => {
                    const isSelected = form.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Driver Registration Type / Fleet Affiliation */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    Driver Affiliation & Fleet Operator
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Choose whether this driver partner operates independently or belongs to an onboarded Fleet Operator agency.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      handleInputChange('source', 'admin');
                      handleInputChange('vendorId', '');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      form.source !== 'fleet_operator'
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Partner (Independent)</span>
                      {form.source !== 'fleet_operator' && <Check className="h-4 w-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Individual driver managed directly by platform admins.</p>
                  </div>

                  <div
                    onClick={() => {
                      handleInputChange('source', 'fleet_operator');
                      if (!form.vendorId && operators.length > 0) {
                        handleInputChange('vendorId', operators[0]._id || operators[0].id);
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      form.source === 'fleet_operator'
                        ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-1 ring-purple-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Fleet Operator Attached</span>
                      {form.source === 'fleet_operator' && <Check className="h-4 w-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Driver attached to a registered fleet agency or vendor pool.</p>
                  </div>
                </div>

                {form.source === 'fleet_operator' && (
                  <div className="p-3.5 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2 animate-fade-in">
                    <label className="text-xs font-semibold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-purple-600" />
                      Select Registered Fleet Operator *
                    </label>
                    <select
                      value={form.vendorId}
                      onChange={(e) => handleInputChange('vendorId', e.target.value)}
                      className="w-full text-xs font-medium rounded-md border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                      required={form.source === 'fleet_operator'}
                    >
                      <option value="">-- Choose Fleet Operator --</option>
                      {operators.map((op) => (
                        <option key={op._id || op.id} value={op._id || op.id}>
                          {op.name} ({op.customId || op.id} - {op.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── STEP 2: VEHICLE DETAILS ──────────────────────────────────────── */}
        {currentStep === 2 && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Step 2: Vehicle Details & Category
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Matches mobile app Step 2: Select dynamic vehicle category with uploaded photo, plate number, and features.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Dynamic Vehicle Categories with Real Uploaded Images */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Select Vehicle Category <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Queried live from MongoDB</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {vehicles.length === 0 ? (
                    <div className="col-span-full p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <p className="text-xs text-slate-500 font-medium">No vehicle categories found in database.</p>
                      <Link to="/bike-auto/vehicles/add" className="text-xs text-primary font-bold hover:underline mt-1.5 inline-block">
                        + Add Vehicle Category First
                      </Link>
                    </div>
                  ) : (
                    vehicles.map((v) => {
                      const isBike = (v.categoryType || v.name || '').toLowerCase().includes('bike') || (v.categoryType || v.name || '').toLowerCase().includes('scooter');
                      const FallbackIcon = isBike ? Bike : Car;
                      const isSelected = form.vehicleType === v.name;
                      const vehicleImg = v.image || v.mapImage;

                      return (
                        <button
                          key={v._id || v.id || v.name}
                          type="button"
                          onClick={() => handleVehicleTypeChange(v.name)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 relative group overflow-hidden ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-slate-900 dark:text-white ring-2 ring-primary shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                              {v.capacity || 1} seat{(v.capacity || 1) > 1 ? 's' : ''}
                            </span>
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>

                          {/* Real Uploaded Picture Container */}
                          <div className="h-20 w-full rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700/60">
                            {vehicleImg ? (
                              <img
                                src={vehicleImg}
                                alt={v.name}
                                className="h-full w-full object-contain transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <FallbackIcon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{v.name}</p>
                            {v.minKmPrice ? (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                ₹{v.minKmPrice} base ({v.minKmDistance || 1} km)
                              </p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Vehicle Photo Upload & Preview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 md:col-span-2">
                  <div className="relative h-20 w-28 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 shadow-sm shrink-0">
                    {vehicleImagePreview ? (
                      <img src={vehicleImagePreview} alt="Vehicle preview" className="h-full w-full object-contain" />
                    ) : (
                      <Car className="h-8 w-8 text-slate-400" />
                    )}
                    {vehicleImagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleImagePreview(null);
                          setForm((prev) => ({ ...prev, vehicleImage: '' }));
                        }}
                        className="absolute top-0 right-0 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Vehicle Photo</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Auto-filled from selected category or upload actual vehicle with plate.
                    </p>
                    <div className="mt-2.5">
                      <input
                        type="file"
                        id="vehicle-file-upload"
                        accept="image/*"
                        onChange={(e) => handleGenericFileChange(e, 'vehicleImage', setVehicleImagePreview)}
                        className="hidden"
                      />
                      <label
                        htmlFor="vehicle-file-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs"
                      >
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        Choose Vehicle Photo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Registration Plate Number <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. AP 09 TG 1234 or TS 07 EA 9821"
                    value={form.vehicleNumber}
                    onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                    className="font-mono uppercase font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Vehicle Color
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Matte Black / Yellow & Green"
                    value={form.vehicleColor}
                    onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Seating Capacity (Riders)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={form.passengerCapacity}
                    onChange={(e) => handleInputChange('passengerCapacity', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Vehicle Preferences Dropdown */}
              <div className="space-y-1.5 relative" ref={preferenceDropdownRef}>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Vehicle Comfort & Safety Amenities
                </label>
                <div
                  onClick={() => setPreferenceDropdownOpen(!preferenceDropdownOpen)}
                  className="min-h-[42px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-wrap gap-1.5 flex-1 pr-2">
                    {form.vehiclePreferences.length === 0 ? (
                      <span className="text-xs text-slate-400">Select amenities...</span>
                    ) : (
                      form.vehiclePreferences.map((pref) => (
                        <span
                          key={pref}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary"
                        >
                          {pref}
                          <X
                            className="h-3 w-3 hover:text-rose-500 cursor-pointer"
                            onClick={(e) => removePreference(pref, e)}
                          />
                        </span>
                      ))
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>

                {preferenceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-20 p-2 max-h-56 overflow-y-auto">
                    {(amenityList.length > 0
                      ? amenityList.map((a) => a.name)
                      : FALLBACK_AMENITIES
                    ).map((opt) => {
                      const isSelected = form.vehiclePreferences.includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => togglePreference(opt)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer ${
                            isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── STEP 3: DRIVING LICENSE & RC ─────────────────────────────────── */}
        {currentStep === 3 && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Step 3: Driving License & RC Verification
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Matches mobile app Step 3: Official license number, validity expiry, and front/back photos.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Driving License Number <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. DL-0720190088712"
                    value={form.drivingLicenseNumber}
                    onChange={(e) => handleInputChange('drivingLicenseNumber', e.target.value.toUpperCase())}
                    className="font-mono uppercase font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    License Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={form.drivingLicenseExpiry}
                    onChange={(e) => handleInputChange('drivingLicenseExpiry', e.target.value)}
                  />
                </div>
              </div>

              {/* Driving License Photos Front / Back */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Front Photo */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center">
                  <div className="h-28 w-full max-w-xs rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 mb-3 relative">
                    {licenseFrontPreview ? (
                      <img src={licenseFrontPreview} alt="License Front" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <FileText className="h-8 w-8 opacity-40" />
                        <span className="text-[11px]">License Front Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="dl-front-upload"
                    accept="image/*"
                    onChange={(e) => handleGenericFileChange(e, 'drivingLicenseImage', setLicenseFrontPreview)}
                    className="hidden"
                  />
                  <label
                    htmlFor="dl-front-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    Upload Front Side
                  </label>
                </div>

                {/* Back Photo */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center">
                  <div className="h-28 w-full max-w-xs rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 mb-3 relative">
                    {licenseBackPreview ? (
                      <img src={licenseBackPreview} alt="License Back" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <FileText className="h-8 w-8 opacity-40" />
                        <span className="text-[11px]">License Back Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="dl-back-upload"
                    accept="image/*"
                    onChange={(e) => handleGenericFileChange(e, 'drivingLicenseBackImage', setLicenseBackPreview)}
                    className="hidden"
                  />
                  <label
                    htmlFor="dl-back-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    Upload Back Side
                  </label>
                </div>
              </div>

              {/* RC Details */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Vehicle RC (Registration Certificate)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      RC Document Number
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. RC-TS07EA9821"
                      value={form.rcNumber}
                      onChange={(e) => handleInputChange('rcNumber', e.target.value.toUpperCase())}
                      className="font-mono uppercase font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-14 w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      {rcImagePreview ? (
                        <img src={rcImagePreview} alt="RC preview" className="h-full w-full object-contain" />
                      ) : (
                        <FileText className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      id="rc-upload"
                      accept="image/*"
                      onChange={(e) => handleGenericFileChange(e, 'rcImage', setRcImagePreview)}
                      className="hidden"
                    />
                    <label
                      htmlFor="rc-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50"
                    >
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      Upload RC Document
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── STEP 4: PERSONAL ID (AADHAAR / NATIONAL ID) ─────────────────── */}
        {currentStep === 4 && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Step 4: Personal ID & KYC Verification
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Matches mobile app Step 4: Aadhaar card / National ID number and dual-side photo upload.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    ID Document Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.personalIdType}
                    onChange={(e) => handleInputChange('personalIdType', e.target.value)}
                    className="w-full text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {PERSONAL_ID_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {form.personalIdType} Number <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 9876 5432 1098"
                    value={form.personalIdNumber}
                    onChange={(e) => handleInputChange('personalIdNumber', e.target.value)}
                    className="font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* ID Front & Back Photo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Front Photo */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center">
                  <div className="h-28 w-full max-w-xs rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 mb-3 relative">
                    {idFrontPreview ? (
                      <img src={idFrontPreview} alt="ID Front" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <ShieldCheck className="h-8 w-8 opacity-40" />
                        <span className="text-[11px]">{form.personalIdType} Front Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="id-front-upload"
                    accept="image/*"
                    onChange={(e) => handleGenericFileChange(e, 'personalIdFrontImage', setIdFrontPreview)}
                    className="hidden"
                  />
                  <label
                    htmlFor="id-front-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    Upload Front Side
                  </label>
                </div>

                {/* Back Photo */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center">
                  <div className="h-28 w-full max-w-xs rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 mb-3 relative">
                    {idBackPreview ? (
                      <img src={idBackPreview} alt="ID Back" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <ShieldCheck className="h-8 w-8 opacity-40" />
                        <span className="text-[11px]">{form.personalIdType} Back Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="id-back-upload"
                    accept="image/*"
                    onChange={(e) => handleGenericFileChange(e, 'personalIdBackImage', setIdBackPreview)}
                    className="hidden"
                  />
                  <label
                    htmlFor="id-back-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    Upload Back Side
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── STEP 5: BANK & PAYOUT SETTLEMENT DETAILS ─────────────────────── */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      Step 5: Bank Details & Direct Settlement
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Matches mobile app Step 5: Bank account, IBAN / IFSC, and UPI ID for instant daily ride earnings payouts.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
                      value={form.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Account Holder Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder={form.firstName ? `${form.firstName} ${form.lastName}` : 'Account Name'}
                      value={form.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Account Number / IBAN <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. IN89HDFC00001234567890"
                      value={form.accountNumber || form.ibanNumber}
                      onChange={(e) => {
                        handleInputChange('accountNumber', e.target.value);
                        handleInputChange('ibanNumber', e.target.value);
                      }}
                      className="font-mono font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      IFSC Code / Branch Code / VAT ID <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={form.ifscCode || form.vatId}
                      onChange={(e) => {
                        handleInputChange('ifscCode', e.target.value.toUpperCase());
                        handleInputChange('vatId', e.target.value.toUpperCase());
                      }}
                      className="font-mono uppercase font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Instant Payout UPI ID <span className="text-slate-400">(Optional for UPI Settlements)</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. driver@okhdfcbank"
                      value={form.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complete Onboarding Review Summary Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/40">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Review Driver Details Before Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Driver Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {form.firstName} {form.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Primary Contact</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {form.primaryCountryCode} {form.primaryPhone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Allocated Vehicle</span>
                  <span className="font-bold text-primary">
                    {form.vehicleType} ({form.vehicleNumber || 'No plate'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Operating Zone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {form.zone || 'None selected'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Driving License</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {form.drivingLicenseNumber || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">{form.personalIdType}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {form.personalIdNumber || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Bank & Account</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {form.bankName || 'Direct'}: {form.accountNumber ? `••••${form.accountNumber.slice(-4)}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">KYC Approval Status</span>
                  <Badge className="bg-emerald-500 text-white font-bold text-[10px] mt-0.5">
                    Pre-Approved Admin Verified
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── WIZARD BOTTOM CONTROLS & NAVIGATION ─────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || submitting}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Step {currentStep} of 5
            </span>

            {isEditMode && currentStep < 5 && (
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                {submitting ? 'Saving...' : 'Save & Update Driver'}
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold shadow-sm"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md px-6"
              >
                {submitting ? (
                  <>Saving Driver...</>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {isEditMode ? 'Save & Update Driver Profile' : 'Complete & Register Driver'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
