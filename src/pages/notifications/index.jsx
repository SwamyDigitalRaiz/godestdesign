import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useNotificationStore } from '../../store/notificationStore';
import { useToast } from '../../components/ui/toaster';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Sparkles,
  Search,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Car,
  Bike,
  ShieldAlert,
  Ticket,
  Copy,
  ExternalLink,
} from 'lucide-react';

const AUDIENCES = [
  { value: 'all', label: 'All Users (Passengers & Drivers)', reach: 45000, icon: Users },
  { value: 'riders', label: 'All Passengers (Riders)', reach: 38500, icon: Smartphone },
  { value: 'drivers', label: 'All Driver Partners (Auto & Bike & Cab)', reach: 6500, icon: Car },
  { value: 'auto_drivers', label: 'Auto Drivers Only', reach: 3800, icon: Car },
  { value: 'bike_drivers', label: 'Bike Captains Only', reach: 2400, icon: Bike },
  { value: 'zone_hitec', label: 'Zone: Hitec City Corridor', reach: 8200, icon: MapPin },
  { value: 'zone_gachibowli', label: 'Zone: Gachibowli & Financial District', reach: 6900, icon: MapPin },
  { value: 'zone_secunderabad', label: 'Zone: Secunderabad & Begumpet', reach: 5400, icon: MapPin },
];

const NOTIFICATION_TYPES = [
  'Surge Alert',
  'Promotion',
  'Safety & Compliance',
  'Document Reminder',
  'System Announcement',
];

const TEMPLATES = [
  {
    label: '🌧️ Rain Surge Alert',
    title: '🌧️ Rain Surge: 1.5x Peak Incentives in Hitec City!',
    body: 'High passenger demand detected. Go online now to earn guaranteed 1.5x trip multipliers across Auto and Bike rides.',
    target: 'drivers',
    type: 'Surge Alert',
  },
  {
    label: '🎟️ Weekend 50% Off Promo',
    title: '🎉 Flat 50% OFF Your Next 3 Rides with code GODEST50!',
    body: 'Enjoy affordable mobility across Hyderabad. Valid on Auto and Bike taxi rides till Sunday midnight.',
    target: 'riders',
    type: 'Promotion',
  },
  {
    label: '🪖 Bike Helmet Safety',
    title: '⚠️ Safety First: Wear Clean Helmet on All Trips',
    body: 'Police inspection active on Outer Ring Road. Ensure passenger wears sanitized helmet before starting the trip.',
    target: 'bike_drivers',
    type: 'Safety & Compliance',
  },
  {
    label: '📋 Insurance Renewal Due',
    title: '📄 Immediate Action: Vehicle Insurance Renewal Due',
    body: 'Your commercial vehicle insurance policy expires in 5 days. Upload renewed documents to maintain active dispatch.',
    target: 'auto_drivers',
    type: 'Document Reminder',
  },
];

export function NotificationsPage() {
  const {
    notifications,
    sendNotification,
    deleteNotification,
    resetDefaults,
  } = useNotificationStore();

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');

  // Composer Form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [type, setType] = useState('Promotion');
  const [deepLink, setDeepLink] = useState('maat://home');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectedAudience = AUDIENCES.find((a) => a.value === target) || AUDIENCES[0];

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setTarget(tpl.target);
    setType(tpl.type);
    toast({
      title: 'Template Loaded',
      description: `Loaded: ${tpl.label}`,
    });
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both notification title and message body.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    setTimeout(() => {
      sendNotification({
        title: title.trim(),
        body: body.trim(),
        target,
        targetLabel: selectedAudience.label,
        targetZone: target.startsWith('zone_') ? selectedAudience.label : 'All Zones',
        type,
        channel: 'Push Notification',
        deepLink: deepLink.trim() || 'maat://home',
        imageUrl: imageUrl.trim(),
        estimatedReach: selectedAudience.reach,
      });

      setSending(false);
      toast({
        title: 'Broadcast Dispatched 🚀',
        description: `Push notification sent to ${selectedAudience.label} (~${selectedAudience.reach.toLocaleString()} devices).`,
      });

      // Reset form
      setTitle('');
      setBody('');
      setActiveTab('history');
    }, 600);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteNotification(deleteTarget.id);
      toast({
        title: 'Notification Deleted',
        description: `Notification #${deleteTarget.id} removed from campaign history.`,
      });
      setDeleteTarget(null);
    }
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return notifications.filter((n) => {
      const matchType =
        historyTypeFilter === 'all' || n.type === historyTypeFilter;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.targetLabel.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [notifications, historyTypeFilter, searchQuery]);

  // Metrics
  const totalCampaigns = notifications.length;
  const totalDelivered = notifications.reduce((acc, n) => acc + (n.deliveredCount || 0), 0);
  const totalOpened = notifications.reduce((acc, n) => acc + (n.openCount || 0), 0);
  const avgOpenRate = totalDelivered > 0
    ? `${((totalOpened / totalDelivered) * 100).toFixed(1)}%`
    : '48.2%';
  const driverCampaigns = notifications.filter((n) => n.target?.includes('driver')).length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Platform</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Notifications</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" />
            Push Notifications & Broadcast Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Broadcast targeted mobile push alerts, rain surge incentives, discount offers, and safety compliance notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="text-xs text-slate-600 dark:text-slate-300"
            title="Reset to default campaign history"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          {/* Tab Switcher Button */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'compose'
                  ? 'bg-primary text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              Compose Broadcast
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-primary text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              History ({notifications.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Broadcasts</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCampaigns}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Deliveries</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {totalDelivered.toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Open Rate</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{avgOpenRate}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Driver Campaigns</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{driverCampaigns}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── TAB 1: COMPOSE BROADCAST & LIVE PHONE PREVIEW ─────────────── */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Templates Strip */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Quick Preset Campaign Templates
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {tpl.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {tpl.title}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Form */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Compose Push Notification
                </CardTitle>
                <CardDescription>
                  Configure audience targeting and craft real-time mobile push copy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Audience */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Target Audience</Label>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Est. Reach: ~{selectedAudience.reach.toLocaleString()} devices
                    </span>
                  </div>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    {AUDIENCES.map((aud) => (
                      <option key={aud.value} value={aud.value}>
                        {aud.label} (~{aud.reach.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campaign Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notification Type</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {NOTIFICATION_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          type === t
                            ? 'bg-primary text-slate-950 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Notification Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. 🌧️ Rain Surge: 1.5x Multiplier in Hitec City!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-9 text-xs"
                    maxLength={65}
                  />
                  <div className="flex justify-end text-[10px] text-slate-400">
                    {title.length}/65 characters
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Message Body <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    placeholder="Keep it concise for mobile lock screens (recommended < 150 chars)..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    maxLength={180}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex justify-end text-[10px] text-slate-400">
                    {body.length}/180 characters
                  </div>
                </div>

                {/* Action Deep Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Action Deep Link</Label>
                    <Input
                      placeholder="e.g. maat://coupons or maat://driver/incentives"
                      value={deepLink}
                      onChange={(e) => setDeepLink(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Banner Image URL (Optional)</Label>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Send Button */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Will send instantly to <strong>{selectedAudience.label}</strong>
                  </div>
                  <Button
                    onClick={handleSendNotification}
                    disabled={sending || !title.trim() || !body.trim()}
                    className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Dispatching Push...' : 'Send Broadcast Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Live Mobile Lock Screen Mockup (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-slate-900 rounded-[44px] p-4 shadow-2xl border-4 border-slate-700/60 relative">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Lock Screen Header */}
              <div className="text-center text-white my-6">
                <span className="text-[11px] font-medium text-slate-300">Tuesday, October 20</span>
                <h2 className="text-5xl font-light tracking-tight mt-1">14:45</h2>
              </div>

              {/* Notification Bubble on Lock Screen */}
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20 mb-16 transition-all duration-300 animate-slide-up">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-slate-950 font-black text-[10px] shadow-xs">
                      G
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Go Dest Mobility
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">now</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {title || 'Your notification title appears here...'}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1 line-clamp-3">
                  {body || 'Type your campaign copy in the form to see how it renders on customer and driver lock screens.'}
                </p>

                {imageUrl && (
                  <div className="mt-2 h-20 w-full rounded-lg overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Lock screen bottom bar */}
              <div className="flex justify-between items-center px-4 py-2 text-white/50 text-xs">
                <span>Swipe up to open</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-white/70" />
                </div>
              </div>
              <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-2" />
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Real-time Android / iOS lock screen push simulation
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 2: BROADCAST HISTORY & LOGS ──────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by title, message or audience..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', ...NOTIFICATION_TYPES].map((t) => (
                <button
                  key={t}
                  onClick={() => setHistoryTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    historyTypeFilter === t
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t}
                </button>
              ))}
            </div>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Bell className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Campaigns Found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  No notifications match your search or type filter.
                </p>
              </div>
            ) : (
              filteredHistory.map((notif) => (
                <Card
                  key={notif.id}
                  className="border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-slate-900 dark:text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            #{notif.id}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {notif.type}
                          </Badge>
                          <Badge
                            className={`text-[10px] ${
                              notif.target?.includes('driver')
                                ? 'bg-purple-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {notif.targetLabel}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                            Sent
                          </Badge>
                          <span className="text-[11px] text-slate-400 ml-auto">
                            {new Date(notif.sentAt).toLocaleString()}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {notif.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                          {notif.body}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <span>
                            Delivered: <strong className="text-slate-800 dark:text-slate-200">{notif.deliveredCount?.toLocaleString()}</strong>
                          </span>
                          <span>
                            Open Rate: <strong className="text-emerald-600">{notif.openRate}</strong>
                          </span>
                          <span>Zone: <strong>{notif.targetZone}</strong></span>
                          <span>Channel: <strong>{notif.channel}</strong></span>
                          {notif.deepLink && (
                            <span className="font-mono text-[11px] text-primary">{notif.deepLink}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTitle(notif.title);
                          setBody(notif.body);
                          setTarget(notif.target || 'all');
                          setType(notif.type || 'Promotion');
                          setDeepLink(notif.deepLink || 'maat://home');
                          setActiveTab('compose');
                          toast({
                            title: 'Loaded into Composer',
                            description: 'You can now edit and re-dispatch this campaign.',
                          });
                        }}
                        className="text-xs h-8 flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(notif)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Campaign Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove notification #{deleteTarget?.id} from your campaign history?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 font-semibold"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
