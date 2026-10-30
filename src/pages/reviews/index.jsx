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
import { useReviewStore } from '../../store/reviewStore';
import { useToast } from '../../components/ui/toaster';
import {
  Star,
  Search,
  RefreshCw,
  Trash2,
  Car,
  User,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  Calendar,
  ThumbsUp,
  SlidersHorizontal,
} from 'lucide-react';

export function ReviewsPage() {
  const {
    reviews,
    addReview,
    updateReviewStatus,
    toggleFeatured,
    deleteReview,
    resetDefaults,
  } = useReviewStore();

  const { toast } = useToast();

  const [starFilter, setStarFilter] = useState('all'); // 'all' | '5' | '4' | '3' | 'critical'
  const [serviceFilter, setServiceFilter] = useState('all'); // 'all' | 'Auto' | 'Bike' | 'Cab'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Approved' | 'Flagged'
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Star Filter
      let matchStar = true;
      if (starFilter === '5') matchStar = r.rating === 5;
      else if (starFilter === '4') matchStar = r.rating === 4;
      else if (starFilter === '3') matchStar = r.rating === 3;
      else if (starFilter === 'critical') matchStar = r.rating <= 2;

      // Service Filter
      const matchService =
        serviceFilter === 'all' || r.serviceType === serviceFilter;

      // Status Filter
      const matchStatus =
        statusFilter === 'all' || r.status === statusFilter;

      // Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.reviewerName?.toLowerCase().includes(q) ||
        r.driverName?.toLowerCase().includes(q) ||
        r.vehiclePlate?.toLowerCase().includes(q) ||
        r.rideId?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q);

      return matchStar && matchService && matchStatus && matchSearch;
    });
  }, [reviews, starFilter, serviceFilter, statusFilter, searchQuery]);

  // Metrics
  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(2)
    : '5.0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarPercent = totalCount > 0 ? Math.round((fiveStarCount / totalCount) * 100) : 100;
  const criticalCount = reviews.filter((r) => r.rating <= 2).length;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-4 w-4 ${
              s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteReview(deleteTarget.id);
      toast({
        title: 'Review Removed',
        description: 'The review has been permanently removed.',
      });
      setDeleteTarget(null);
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
            <span className="text-slate-900 dark:text-white font-medium">Reviews & Ratings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Star className="h-6 w-6 text-primary fill-primary" />
            Passenger & Driver Ratings & Reviews
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor trip feedback, investigate low-rating rides, and moderate customer testimonials across all vehicle types.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="text-xs text-slate-600 dark:text-slate-300"
            title="Reset to default reviews"
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
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Platform Rating</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgRating}</span>
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reviews</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Star className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">5-Star Ratio</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{fiveStarPercent}%</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical / 1-2 Stars</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
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
              placeholder="Search by rider, driver, vehicle plate, comment..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Ratings' },
              { id: '5', label: '5 Stars ★' },
              { id: '4', label: '4 Stars ★' },
              { id: '3', label: '3 Stars ★' },
              { id: 'critical', label: '1-2 Stars (Alerts)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStarFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  starFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters: Vehicle Service & Moderation Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Vehicle Service:
            </span>
            {['all', 'Auto', 'Bike', 'Cab'].map((serv) => (
              <button
                key={serv}
                onClick={() => setServiceFilter(serv)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  serviceFilter === serv
                    ? 'bg-primary text-slate-950 font-bold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {serv === 'all' ? 'All Services' : serv}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Moderation:
            </span>
            {['all', 'Approved', 'Flagged'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews Grid / List ──────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Star className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Reviews Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No passenger ratings match your current filter selections.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <Card
              key={rev.id}
              className={`border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
                rev.rating <= 2
                  ? 'border-red-200 dark:border-red-900/50 bg-red-50/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Star Rating & Review Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Reviewer Avatar */}
                  <div className="h-11 w-11 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {rev.reviewerAvatar ? (
                      <img src={rev.reviewerAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Top Row: Stars + Badges + Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStars(rev.rating)}
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {rev.rating}.0
                      </span>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          rev.serviceType === 'Auto'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : rev.serviceType === 'Bike'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {rev.serviceType}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          rev.reviewerType === 'Driver'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {rev.reviewerType}
                      </Badge>

                      {rev.featured && (
                        <Badge className="bg-amber-500 text-white text-[10px] gap-1">
                          <Sparkles className="h-3 w-3" /> Featured
                        </Badge>
                      )}

                      {rev.status === 'Flagged' && (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <AlertTriangle className="h-3 w-3" /> Flagged
                        </Badge>
                      )}

                      <span className="text-[11px] text-slate-400 ml-auto">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mt-2 font-medium">
                      "{rev.comment}"
                    </p>

                    {/* Tags */}
                    {rev.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {rev.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              rev.rating <= 2
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <span>By: <strong className="text-slate-700 dark:text-slate-300">{rev.reviewerName}</strong></span>
                      <span>Partner: <strong className="text-slate-700 dark:text-slate-300">{rev.driverName}</strong></span>
                      {rev.vehiclePlate && (
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{rev.vehiclePlate}</span>
                      )}
                      <span>Trip: <strong className="font-mono text-primary">{rev.rideId}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleFeatured(rev.id);
                      toast({
                        title: rev.featured ? 'Removed from Featured' : 'Marked as Featured',
                        description: `Review by ${rev.reviewerName} updated.`,
                      });
                    }}
                    className={`text-xs h-8 ${
                      rev.featured ? 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30' : 'text-slate-600'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    {rev.featured ? 'Featured' : 'Feature'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = rev.status === 'Flagged' ? 'Approved' : 'Flagged';
                      updateReviewStatus(rev.id, next);
                      toast({
                        title: `Review ${next}`,
                        description: `Moderation status updated to ${next}.`,
                      });
                    }}
                    className="text-xs h-8 text-slate-600"
                  >
                    {rev.status === 'Flagged' ? 'Approve' : 'Flag'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(rev)}
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

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Review
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this review by <strong>{deleteTarget?.reviewerName}</strong>?
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
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
