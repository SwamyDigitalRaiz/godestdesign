import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ImageDropzone } from '../../components/ui/image-dropzone';
import { useToast } from '../../components/ui/toaster';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import {
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Shield,
  CreditCard,
  Car,
  Bus,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export function BannersTab() {
  const { toast } = useToast();
  const {
    settings,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    moveBannerPriority,
    fetchBanners,
  } = useAppSettingsStore();

  const banners = settings.banners || [];

  // Fetch live banners from MongoDB on mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');

  // Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    actionType: 'none',
    actionTarget: '',
    targetAudience: 'all',
    priority: 1,
    isActive: true,
    imageFile: null,
    imagePreview: null,
  });

  // Preview Carousel active index
  const [previewIndex, setPreviewIndex] = useState(0);

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        const matchesQuery =
          !searchQuery.trim() ||
          (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (b.subtitle && b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesAudience =
          audienceFilter === 'all' || (b.targetAudience || 'all') === audienceFilter;

        return matchesQuery && matchesAudience;
      })
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [banners, searchQuery, audienceFilter]);

  // Active banners for interactive mobile preview
  const activeBanners = useMemo(() => {
    return banners.filter((b) => b.isActive);
  }, [banners]);

  // Auto rotate preview carousel
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      actionType: 'none',
      actionTarget: '',
      targetAudience: 'all',
      priority: banners.length + 1,
      isActive: true,
      imageFile: null,
      imagePreview: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      actionType: banner.actionType || 'none',
      actionTarget: banner.actionTarget || '',
      targetAudience: banner.targetAudience || 'all',
      priority: banner.priority || 1,
      isActive: banner.isActive !== false,
      imageFile: null,
      imagePreview: banner.imageUrl || null,
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a valid image file (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingBanner && !formData.imagePreview) {
      toast({
        title: 'Image Required',
        description: 'Please select a banner graphic or upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const bannerPayload = {
        title: formData.title,
        subtitle: formData.subtitle,
        actionType: formData.actionType,
        actionTarget: formData.actionTarget,
        targetAudience: formData.targetAudience,
        priority: Number(formData.priority) || 1,
        isActive: formData.isActive,
        imageUrl: formData.imagePreview || editingBanner?.imageUrl,
      };

      if (editingBanner) {
        updateBanner(editingBanner._id || editingBanner.id, bannerPayload);
        toast({
          title: 'Banner Updated',
          description: 'Promotional banner changes saved successfully.',
        });
      } else {
        addBanner(bannerPayload);
        toast({
          title: 'Banner Created',
          description: 'New home promotional banner has been published.',
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save banner',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (id) => {
    toggleBannerActive(id);
    const b = banners.find((item) => (item._id || item.id) === id);
    toast({
      title: b?.isActive ? 'Banner Disabled' : 'Banner Activated',
      description: `Banner status set to ${b?.isActive ? 'hidden' : 'live'}.`,
    });
  };

  const handleMovePriority = (banner, direction) => {
    moveBannerPriority(banner._id || banner.id, direction);
    toast({
      title: 'Priority Updated',
      description: `Shifted display position ${direction}.`,
    });
  };

  const handleDelete = () => {
    if (!bannerToDelete) return;
    deleteBanner(bannerToDelete._id || bannerToDelete.id);
    toast({
      title: 'Banner Deleted',
      description: `"${bannerToDelete.title || 'Banner'}" removed from mobile app carousels.`,
    });
    setDeleteConfirmOpen(false);
    setBannerToDelete(null);
  };

  const getActionBadge = (type) => {
    switch (type) {
      case 'booking':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200">
            <Car className="h-3 w-3 mr-1" /> Book Ride
          </Badge>
        );
      case 'bus':
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200">
            <Bus className="h-3 w-3 mr-1" /> Intercity Bus
          </Badge>
        );
      case 'wallet':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200">
            <CreditCard className="h-3 w-3 mr-1" /> Wallet & UPI
          </Badge>
        );
      case 'safety':
        return (
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200">
            <Shield className="h-3 w-3 mr-1" /> Safety Center
          </Badge>
        );
      case 'promos':
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200">
            <Tag className="h-3 w-3 mr-1" /> Promos & Offers
          </Badge>
        );
      case 'url':
        return (
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200">
            <ExternalLink className="h-3 w-3 mr-1" /> External Link
          </Badge>
        );
      case 'custom':
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200">
            <Smartphone className="h-3 w-3 mr-1" /> In-App Route
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-200">
            Display Only
          </Badge>
        );
    }
  };

  const getAudienceBadge = (audience) => {
    switch (audience) {
      case 'riders':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
            Riders Only
          </Badge>
        );
      case 'drivers':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
            Drivers Only
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            All Users
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview & Stats Header - Solar Hearts Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-amber-500/10 rounded-2xl border border-blue-100 dark:border-blue-950/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Mobile App Home Banners
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage promotional, safety, event, and service banners that appear dynamically on the Go Dest mobile app home screens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-2"
          >
            <Plus className="h-4 w-4" /> Add Banner
          </Button>
        </div>
      </div>

      {/* Interactive Mobile Screen Live Preview - Solar Hearts Style */}
      {activeBanners.length > 0 && (
        <Card className="border-indigo-100 dark:border-indigo-950/40 bg-gradient-to-b from-blue-50/30 to-white dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Live Mobile Carousel Preview
                </CardTitle>
                <CardDescription>
                  Preview how banners rotate in the app home screen ({activeBanners.length} active banner{activeBanners.length > 1 ? 's' : ''})
                </CardDescription>
              </div>

              {activeBanners.length > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      setPreviewIndex(
                        (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      setPreviewIndex((prev) => (prev + 1) % activeBanners.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="max-w-xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-slate-950 aspect-[16/7] group">
                {activeBanners[previewIndex] && (
                  <>
                    <img
                      src={activeBanners[previewIndex].imageUrl}
                      alt={activeBanners[previewIndex].title || 'Banner'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Gradient Overlay for text readability & CTA */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between p-4">
                      <div className="flex-1 min-w-0 pr-3">
                        {activeBanners[previewIndex].title && (
                          <h4 className="text-white font-bold text-base drop-shadow-md truncate">
                            {activeBanners[previewIndex].title}
                          </h4>
                        )}
                        {activeBanners[previewIndex].subtitle && (
                          <p className="text-white/80 text-xs mt-0.5 line-clamp-1 drop-shadow">
                            {activeBanners[previewIndex].subtitle}
                          </p>
                        )}
                      </div>

                      {/* CTA Button matching mobile app */}
                      {activeBanners[previewIndex].actionType !== 'none' && (
                        <div className="shrink-0 px-3 py-1.5 rounded-full bg-white/95 text-slate-900 font-extrabold text-[11px] shadow-lg flex items-center gap-1">
                          {activeBanners[previewIndex].actionType === 'booking' && 'Book Ride ⚡'}
                          {activeBanners[previewIndex].actionType === 'bus' && 'Book Bus 🚌'}
                          {activeBanners[previewIndex].actionType === 'wallet' && 'Wallet 💳'}
                          {activeBanners[previewIndex].actionType === 'safety' && 'Safety SOS 🛡️'}
                          {activeBanners[previewIndex].actionType === 'promos' && 'Claim Promo 🎁'}
                          {activeBanners[previewIndex].actionType === 'url' && 'Explore ↗'}
                          {activeBanners[previewIndex].actionType === 'custom' && 'Open ➔'}
                        </div>
                      )}
                    </div>

                    {/* Target audience badge in preview */}
                    <div className="absolute top-2.5 right-2.5">
                      {getAudienceBadge(activeBanners[previewIndex].targetAudience)}
                    </div>
                  </>
                )}
              </div>

              {/* Indicator dots */}
              {activeBanners.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {activeBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${previewIndex === i
                          ? 'w-6 bg-blue-600 dark:bg-blue-400'
                          : 'w-2 bg-slate-300 dark:bg-slate-700'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search banners by title or subtitle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Audiences</option>
            <option value="riders">Passengers / Riders Only</option>
            <option value="drivers">Driver Partners Only</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setAudienceFilter('all'); }}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Banner Cards Grid / List - Solar Hearts Style */}
      {filteredBanners.length === 0 ? (
        <Card className="border-dashed border-2 py-12 text-center">
          <CardContent className="space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              No banners found
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search query or audience filter.'
                : 'Upload marketing banners to engage your mobile app users directly on their home screen.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleOpenAddModal} className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
                <Plus className="h-4 w-4 mr-1.5" /> Create First Banner
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.map((banner, index) => (
            <Card
              key={banner.id}
              className={`overflow-hidden border transition-all duration-200 hover:shadow-md ${banner.isActive
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
                }`}
            >
              {/* Image banner */}
              <div className="relative aspect-[16/7] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge className="bg-black/70 text-white backdrop-blur-sm border-0 font-bold text-xs">
                    #{banner.priority}
                  </Badge>
                  {banner.isActive ? (
                    <Badge className="bg-emerald-500/90 text-white backdrop-blur-sm border-0 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-600/90 text-white backdrop-blur-sm border-0 text-xs">
                      Disabled
                    </Badge>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  {getAudienceBadge(banner.targetAudience)}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                    {banner.title || <span className="text-slate-400 italic font-normal">Untitled Banner</span>}
                  </h4>
                  {banner.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Action:</span>
                    {getActionBadge(banner.actionType)}
                  </div>

                  {banner.actionTarget && (
                    <span
                      title={banner.actionTarget}
                      className="text-[11px] font-mono text-slate-400 max-w-[120px] truncate"
                    >
                      {banner.actionTarget}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Status Toggle & Priority arrows */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.isActive}
                      onCheckedChange={() => handleToggleStatus(banner._id || banner.id)}
                      title="Toggle Active Status"
                    />

                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-md">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-none rounded-l-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        disabled={index === 0}
                        onClick={() => handleMovePriority(banner, 'up')}
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-none rounded-r-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        disabled={index === filteredBanners.length - 1}
                        onClick={() => handleMovePriority(banner, 'down')}
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      onClick={() => handleOpenEditModal(banner)}
                      title="Edit Banner"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      onClick={() => {
                        setBannerToDelete(banner);
                        setDeleteConfirmOpen(true);
                      }}
                      title="Delete Banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Banner Dialog Modal - Solar Hearts Style */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <ImageIcon className="h-5 w-5" />
              </div>
              {editingBanner ? 'Edit Banner' : 'Add New Home Banner'}
            </DialogTitle>
            <DialogDescription>
              Upload a mobile-optimized banner graphic (recommended 16:7 aspect ratio, e.g. 1024x450).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Image Upload Area with Drag & Drop */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Banner Graphic Image *
              </Label>
              <ImageDropzone
                value={formData.imagePreview}
                onChange={({ file, previewUrl }) => {
                  setFormData((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: previewUrl,
                  }));
                }}
                onClear={() => {
                  setFormData((prev) => ({
                    ...prev,
                    imageFile: null,
                    imagePreview: null,
                  }));
                }}
                aspectRatio="16/7"
                recommendedText="Drag & drop from machine or click to browse. Recommended 16:7 (e.g. 1024x450). PNG, JPG, WEBP"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="banner-title">Title / Headline (Optional)</Label>
                <Input
                  id="banner-title"
                  placeholder="e.g. 50% Off First 5 Auto Rides"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="banner-subtitle">Subtitle / Description (Optional)</Label>
                <Input
                  id="banner-subtitle"
                  placeholder="e.g. Free sanitized helmets & live GPS tracking"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
            </div>

            {/* Target Audience & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="banner-audience">Target Audience</Label>
                <select
                  id="banner-audience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Users</option>
                  <option value="riders">Passengers / Riders Only</option>
                  <option value="drivers">Driver Partners Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="banner-priority">Display Priority</Label>
                <Input
                  id="banner-priority"
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 1 })
                  }
                />
              </div>
            </div>

            {/* Action Type */}
            <div className="space-y-1.5">
              <Label htmlFor="banner-action">Click / Tap Action</Label>
              <select
                id="banner-action"
                value={formData.actionType}
                onChange={(e) => {
                  const type = e.target.value;
                  let target = formData.actionTarget;
                  if (type === 'booking') target = 'maat://booking';
                  else if (type === 'bus') target = 'maat://bus-bookings';
                  else if (type === 'wallet') target = 'maat://wallet';
                  else if (type === 'safety') target = 'maat://safety-center';
                  else if (type === 'promos') target = 'maat://promos';
                  setFormData({ ...formData, actionType: type, actionTarget: target });
                }}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="none">None (Display Only)</option>
                <option value="booking">Book Ride (Bike, Auto, Cab)</option>
                <option value="bus">Intercity Bus Booking</option>
                <option value="wallet">Driver Wallet & Settlements</option>
                <option value="safety">Safety Center & Emergency SOS</option>
                <option value="promos">Promo Codes & Discounts</option>
                <option value="url">Open External Web URL (https://...)</option>
                <option value="custom">Custom In-App Deep Link Path</option>
              </select>
            </div>

            {/* Target URL or Path */}
            {(formData.actionType === 'url' || formData.actionType === 'custom' || formData.actionType === 'promos') && (
              <div className="space-y-1.5">
                <Label htmlFor="banner-target">
                  {formData.actionType === 'url' ? 'External URL (https://...)' : 'In-App Route / Deep Link'}
                </Label>
                <Input
                  id="banner-target"
                  placeholder={
                    formData.actionType === 'url'
                      ? 'https://godest.in/promos'
                      : 'maat://promos?code=MAATFIRST'
                  }
                  value={formData.actionTarget}
                  onChange={(e) => setFormData({ ...formData, actionTarget: e.target.value })}
                />
              </div>
            )}

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Enable Banner
                </p>
                <p className="text-xs text-slate-500">
                  When enabled, this banner will be displayed to matching mobile users.
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBanner ? 'Save Changes' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Solar Hearts Style */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Banner?"
        description={`Are you sure you want to permanently delete the banner "${bannerToDelete?.title || 'this banner'}"? This action cannot be undone.`}
        confirmText="Delete Banner"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
}

export default BannersTab;
