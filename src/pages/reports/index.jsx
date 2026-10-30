import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
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
import { useReportStore } from '../../store/reportStore';
import { useToast } from '../../components/ui/toaster';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  RefreshCw,
  Car,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  MapPin,
  Phone,
  FileText,
  Ban,
  DollarSign,
  Send,
  Sparkles,
} from 'lucide-react';

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export function ReportsPage() {
  const {
    reports,
    addReport,
    updateReportStatus,
    updateAdminNotes,
    deleteReport,
    resetDefaults,
  } = useReportStore();

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'under investigation' | 'resolved' | 'dismissed'
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Investigation Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchTab =
        activeTab === 'all' ||
        r.status.toLowerCase() === activeTab.toLowerCase();

      const matchSeverity =
        selectedSeverity === 'All' || r.severity === selectedSeverity;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.reportNumber.toLowerCase().includes(q) ||
        r.incidentType.toLowerCase().includes(q) ||
        r.reporterName?.toLowerCase().includes(q) ||
        r.targetName?.toLowerCase().includes(q) ||
        r.targetVehicle?.toLowerCase().includes(q) ||
        r.rideId?.toLowerCase().includes(q);

      return matchTab && matchSeverity && matchSearch;
    });
  }, [reports, activeTab, selectedSeverity, searchQuery]);

  // Metrics
  const totalCount = reports.length;
  const criticalCount = reports.filter((r) => r.severity === 'Critical').length;
  const pendingCount = reports.filter((r) => r.status === 'Pending' || r.status === 'Under Investigation').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  const handleOpenInvestigate = (rep) => {
    setSelectedReport(rep);
    setInvestigationNotes(rep.adminNotes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedReport) return;
    updateAdminNotes(selectedReport.id, investigationNotes);
    toast({
      title: 'Notes Saved',
      description: 'Internal investigation log updated.',
    });
    setSelectedReport({ ...selectedReport, adminNotes: investigationNotes });
  };

  const handleStatusChange = (newStatus, actionLabel) => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, newStatus);
    if (actionLabel) {
      updateAdminNotes(selectedReport.id, investigationNotes, actionLabel);
    }
    toast({
      title: `Report ${newStatus}`,
      description: actionLabel || `Status changed to ${newStatus}.`,
    });
    setSelectedReport({
      ...selectedReport,
      status: newStatus,
      actionTaken: actionLabel || selectedReport.actionTaken,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteReport(deleteTarget.id);
      toast({
        title: 'Report Removed',
        description: `Report ${deleteTarget.reportNumber} has been removed.`,
      });
      setDeleteTarget(null);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] animate-pulse flex items-center gap-1 font-bold">
            <ShieldAlert className="h-3 w-3" /> CRITICAL SOS
          </Badge>
        );
      case 'High':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold">
            HIGH
          </Badge>
        );
      case 'Medium':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-[10px]">
            MEDIUM
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500 text-[10px]">
            LOW
          </Badge>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-[11px] gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'Under Investigation':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-[11px] gap-1">
            <AlertTriangle className="h-3 w-3" /> In Review
          </Badge>
        );
      case 'Resolved':
        return (
          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[11px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-500 bg-slate-50 text-[11px] gap-1">
            <XCircle className="h-3 w-3" /> Dismissed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Platform</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Reports & Disputes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Safety Incident Command & Dispute Resolution
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Investigate emergency SOS alerts, passenger-driver harassment reports, fare extortion claims, and vehicle damage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="text-xs text-slate-600 dark:text-slate-300"
            title="Reset to default incident reports"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reports</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200 dark:border-red-900/50 bg-red-50/20 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Critical SOS Alerts</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Review</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search ─────────────────────────────────────────── */}
      <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by report #, incident, rider, driver, vehicle plate..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Incidents' },
              { id: 'pending', label: 'Pending' },
              { id: 'under investigation', label: 'In Review' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'dismissed', label: 'Dismissed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Severity Filter:
          </span>
          {SEVERITIES.map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedSeverity === sev
                  ? sev === 'Critical'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-primary text-slate-950 font-bold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sev === 'All' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reports Grid / List ──────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Incident Reports Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No safety complaints or emergency reports match your current filter.
            </p>
          </div>
        ) : (
          filteredReports.map((rep) => (
            <Card
              key={rep.id}
              className={`border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
                rep.severity === 'Critical'
                  ? 'border-red-300 dark:border-red-900/70 bg-red-50/15'
                  : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Incident Icon & Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      rep.severity === 'Critical'
                        ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <ShieldAlert className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Top Row: Badges & Timestamp */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {rep.reportNumber}
                      </span>
                      {getSeverityBadge(rep.severity)}
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          rep.serviceType === 'Cab'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {rep.serviceType}
                      </Badge>
                      {getStatusBadge(rep.status)}
                      <span className="text-[11px] text-slate-400 ml-auto">
                        {new Date(rep.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Incident Type Header */}
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                      {rep.incidentType}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                      {rep.description}
                    </p>

                    {/* Parties In Conflict */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Reported By ({rep.reporterType}):</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {rep.reporterName} ({rep.reporterPhone})
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Reported Target ({rep.targetType}):</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {rep.targetName} {rep.targetVehicle && `• ${rep.targetVehicle}`}
                        </p>
                      </div>
                    </div>

                    {/* Action Taken strip if exists */}
                    {rep.actionTaken && (
                      <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Action: <strong>{rep.actionTaken}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => handleOpenInvestigate(rep)}
                    size="sm"
                    className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Investigate
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(rep)}
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

      {/* ── Investigate Incident Dialog ──────────────────────────────── */}
      <Dialog open={Boolean(selectedReport)} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-500">
                      {selectedReport.reportNumber}
                    </span>
                    {getSeverityBadge(selectedReport.severity)}
                    {getStatusBadge(selectedReport.status)}
                  </div>

                  <span className="text-xs text-slate-400">
                    Logged: {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>

                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  {selectedReport.incidentType}
                </DialogTitle>
                <DialogDescription>
                  Full mobility dispute record, location snapshots, and safety resolution actions.
                </DialogDescription>
              </DialogHeader>

              {/* Trip & Location Strip */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Car className="h-3.5 w-3.5 text-primary" />
                    Ride Reference: <strong className="font-mono text-primary">{selectedReport.rideId}</strong>
                  </span>
                  {selectedReport.targetVehicle && (
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{selectedReport.targetVehicle}</span>
                  )}
                </div>

                {selectedReport.pickup && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Route: {selectedReport.pickup} → {selectedReport.drop}</span>
                  </div>
                )}

                {selectedReport.currentLocation && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Incident Location Snapshot: {selectedReport.currentLocation}</span>
                  </div>
                )}
              </div>

              {/* Incident Description */}
              <div className="space-y-1 py-1">
                <Label className="text-xs font-semibold">Incident Statement</Label>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedReport.description}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1.5 py-1">
                <Label className="text-xs font-semibold">Admin Investigation Notes & Logs</Label>
                <textarea
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Enter internal investigation notes, tele-interview findings, or hub reports..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  className="text-xs h-7"
                >
                  Save Internal Notes
                </Button>
              </div>

              {/* Dispute Resolution Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                  Take Safety & Dispute Action
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('Under Investigation', 'Driver Account Temporarily Suspended')}
                    className="border-red-300 text-red-700 hover:bg-red-50 text-[11px] h-8 flex items-center gap-1"
                  >
                    <Ban className="h-3 w-3" />
                    Suspend Driver
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('Resolved', 'Full Passenger Fare Refund Processed')}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] h-8 flex items-center gap-1"
                  >
                    <DollarSign className="h-3 w-3" />
                    Refund Passenger
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('Resolved', 'Investigation Completed and Warning Issued')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 text-[11px] h-8 flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Resolve Issue
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('Dismissed', 'Report dismissed as unverified / false claim')}
                    className="text-slate-600 text-[11px] h-8 flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Dismiss Report
                  </Button>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Report
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete report <strong>{deleteTarget?.reportNumber}</strong>?
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
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
