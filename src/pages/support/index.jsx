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
import { useSupportStore } from '../../store/supportStore';
import { useToast } from '../../components/ui/toaster';
import {
  Headphones,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  User,
  Car,
  MapPin,
  RefreshCw,
  Trash2,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Fare Dispute',
  'Lost & Found',
  'Payment & Wallet',
  'Cancellation & Refund',
  'Technical & App',
];

const CANNED_RESPONSES = [
  'Apologies for the hassle. We have initiated a refund of the disputed amount back to your wallet.',
  'We have contacted your driver partner. The item has been deposited safely at our local hub.',
  'Our safety team has flagged this driver for a mandatory compliance retraining workshop.',
  'Could you please share a screenshot or bank transaction reference so we can verify with accounts?',
];

export function SupportPage() {
  const {
    tickets,
    addTicket,
    updateTicketStatus,
    updateTicketPriority,
    addReply,
    deleteTicket,
    resetDefaults,
  } = useSupportStore();

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open' | 'in progress' | 'resolved' | 'closed'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket Details / Thread Dialog
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Create Ticket Dialog
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    userType: 'Rider',
    userName: '',
    userPhone: '',
    userEmail: '',
    rideId: '',
    category: 'Fare Dispute',
    priority: 'Medium',
    subject: '',
    description: '',
  });

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchTab =
        activeTab === 'all' ||
        t.status.toLowerCase() === activeTab.toLowerCase();

      const matchCategory =
        selectedCategory === 'All' || t.category === selectedCategory;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userPhone.toLowerCase().includes(q) ||
        (t.rideId && t.rideId.toLowerCase().includes(q));

      return matchTab && matchCategory && matchSearch;
    });
  }, [tickets, activeTab, selectedCategory, searchQuery]);

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    addReply(selectedTicket.id, replyText);
    toast({
      title: 'Reply Sent',
      description: 'Your response was posted to the customer ticket thread.',
    });
    setReplyText('');
    // refresh selected ticket
    const updated = useSupportStore
      .getState()
      .tickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleCreateTicket = () => {
    if (!newTicketForm.userName || !newTicketForm.subject) {
      toast({
        title: 'Validation Error',
        description: 'Please provide user name and ticket subject.',
        variant: 'destructive',
      });
      return;
    }

    addTicket({
      ...newTicketForm,
      assignedTo: 'Super Admin',
    });

    toast({
      title: 'Ticket Raised',
      description: 'New support ticket created successfully.',
    });

    setShowCreateModal(false);
    setNewTicketForm({
      userType: 'Rider',
      userName: '',
      userPhone: '',
      userEmail: '',
      rideId: '',
      category: 'Fare Dispute',
      priority: 'Medium',
      subject: '',
      description: '',
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteTicket(deleteTarget.id);
      toast({
        title: 'Ticket Deleted',
        description: `Ticket ${deleteTarget.ticketNumber} has been removed.`,
      });
      setDeleteTarget(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px]">Urgent</Badge>;
      case 'High':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px]">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50 text-[10px]">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600 text-[10px]">Low</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold gap-1">
            <Clock className="h-3 w-3" /> Open
          </Badge>
        );
      case 'In Progress':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/40 text-[11px] font-semibold gap-1">
            <MessageSquare className="h-3 w-3" /> In Progress
          </Badge>
        );
      case 'Resolved':
        return (
          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-500 bg-slate-50 dark:bg-slate-800 text-[11px] gap-1">
            <XCircle className="h-3 w-3" /> Closed
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
            <span className="text-slate-900 dark:text-white font-medium">Customer Support</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Headphones className="h-6 w-6 text-primary" />
            Customer & Driver Support Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resolve ride complaints, fare disputes, lost item inquiries, and passenger refund requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="text-xs text-slate-600 dark:text-slate-300"
            title="Reset to default tickets"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Raise Support Ticket
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tickets</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Tickets</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{openCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Headphones className="h-5 w-5" />
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
              placeholder="Search by ticket #, user name, phone, ride ID..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tickets' },
              { id: 'open', label: 'Open' },
              { id: 'in progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'closed', label: 'Closed' },
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary/20 text-slate-950 dark:text-white font-bold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tickets Table / List ─────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Headphones className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Support Tickets Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no tickets matching your search or status filter.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: User & Subject info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                    {ticket.userAvatar ? (
                      <img src={ticket.userAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {ticket.ticketNumber}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                      <Badge variant="outline" className="text-[10px] border-slate-300 dark:border-slate-700">
                        {ticket.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          ticket.userType === 'Driver'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {ticket.userType}
                      </Badge>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {ticket.subject}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Requester: <strong className="text-slate-800 dark:text-slate-200">{ticket.userName}</strong> ({ticket.userPhone})</span>
                      {ticket.rideId && (
                        <span>Ride Ref: <strong className="font-mono text-primary">{ticket.rideId}</strong></span>
                      )}
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.assignedTo && (
                        <span>Agent: {ticket.assignedTo}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setReplyText('');
                    }}
                    size="sm"
                    className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    View & Reply
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[10px]">
                      {ticket.messages?.length || 1}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(ticket)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── View & Reply Ticket Dialog ───────────────────────────────── */}
      <Dialog open={Boolean(selectedTicket)} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-500">
                      {selectedTicket.ticketNumber}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                    <Badge variant="outline">{selectedTicket.category}</Badge>
                    {getStatusBadge(selectedTicket.status)}
                  </div>

                  {/* Quick Status Select */}
                  <div className="flex items-center gap-1">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        updateTicketStatus(selectedTicket.id, e.target.value);
                        setSelectedTicket({ ...selectedTicket, status: e.target.value });
                        toast({ title: 'Status Updated', description: `Marked as ${e.target.value}` });
                      }}
                      className="h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold"
                    >
                      <option value="Open">Status: Open</option>
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Resolved">Status: Resolved</option>
                      <option value="Closed">Status: Closed</option>
                    </select>
                  </div>
                </div>

                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {selectedTicket.subject}
                </DialogTitle>
                <DialogDescription>
                  Customer conversation thread and mobility ride incident information.
                </DialogDescription>
              </DialogHeader>

              {/* Ride Summary Strip (if applicable) */}
              {selectedTicket.rideId && (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Car className="h-3.5 w-3.5 text-primary" />
                      Ride Booking: <strong className="font-mono text-primary">{selectedTicket.rideId}</strong>
                    </span>
                    {selectedTicket.vehicleNumber && (
                      <span className="text-slate-500">Vehicle: {selectedTicket.vehicleNumber}</span>
                    )}
                    {selectedTicket.fareAmount && (
                      <span className="font-bold text-emerald-600">Fare: ₹{selectedTicket.fareAmount}</span>
                    )}
                  </div>
                  {selectedTicket.pickup && (
                    <div className="flex items-center gap-2 text-slate-500 truncate">
                      <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{selectedTicket.pickup} → {selectedTicket.drop}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Thread */}
              <div className="space-y-3 py-3 max-h-[350px] overflow-y-auto pr-1">
                {selectedTicket.messages?.map((msg, idx) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {msg.senderName}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-primary text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Predefined Quick Responses */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Quick Canned Responses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CANNED_RESPONSES.map((resp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyText(resp)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 text-slate-600 dark:text-slate-300 text-[11px] transition-colors line-clamp-1 max-w-xs text-left"
                      title={resp}
                    >
                      {resp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <div className="space-y-2 pt-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply to passenger/driver..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <div className="flex items-center gap-2 mr-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateTicketStatus(selectedTicket.id, 'Resolved');
                      setSelectedTicket({ ...selectedTicket, status: 'Resolved' });
                      toast({ title: 'Marked Resolved', description: 'Ticket status set to Resolved.' });
                    }}
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Quick Resolve
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold text-xs flex items-center gap-1.5"
                  size="sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Raise New Ticket Modal ───────────────────────────────────── */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              Raise Support Ticket
            </DialogTitle>
            <DialogDescription>
              Create a support ticket manually on behalf of a passenger or driver partner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">User Type</Label>
                <select
                  value={newTicketForm.userType}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, userType: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                >
                  <option value="Rider">Passenger (Rider)</option>
                  <option value="Driver">Driver Partner</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Category</Label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Customer / Driver Name *</Label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={newTicketForm.userName}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, userName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={newTicketForm.userPhone}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, userPhone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Associated Ride ID</Label>
                <Input
                  placeholder="e.g. GD-RD-98211"
                  value={newTicketForm.rideId}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, rideId: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Priority</Label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                >
                  <option value="Urgent">Urgent (Immediate SOS)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Subject / Issue Summary *</Label>
              <Input
                placeholder="Brief summary of the complaint or query"
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description / Initial Details</Label>
              <textarea
                placeholder="Detailed explanation from caller/user..."
                value={newTicketForm.description}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              className="bg-primary text-slate-950 hover:bg-primary/90 font-semibold text-xs"
              size="sm"
            >
              Submit Ticket
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
              Delete Ticket
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ticket <strong>{deleteTarget?.ticketNumber}</strong>?
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
