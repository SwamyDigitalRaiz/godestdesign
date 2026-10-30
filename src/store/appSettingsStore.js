import { create } from 'zustand';
import * as settingsService from '../services/settingsService';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';

export { DEFAULT_SETTINGS };

const STORAGE_KEY = 'maat_app_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const parsedPolicies = parsed.policies || {};
    return {
      general: { ...DEFAULT_SETTINGS.general, ...(parsed.general || {}) },
      featureToggles: { ...DEFAULT_SETTINGS.featureToggles, ...(parsed.featureToggles || {}) },
      dispatchRules: { ...DEFAULT_SETTINGS.dispatchRules, ...(parsed.dispatchRules || {}) },
      locationSettings: { ...DEFAULT_SETTINGS.locationSettings, ...(parsed.locationSettings || {}) },
      inactivityPolicy: { ...DEFAULT_SETTINGS.inactivityPolicy, ...(parsed.inactivityPolicy || {}) },
      banners: Array.isArray(parsed.banners) ? parsed.banners : [],
      introImages: Array.isArray(parsed.introImages) ? parsed.introImages : [],
      policies: {
        ...DEFAULT_SETTINGS.policies,
        ...parsedPolicies,
        user: {
          ...DEFAULT_SETTINGS.policies.user,
          ...(parsedPolicies.user || {
            termsOfService: parsedPolicies.termsOfService || DEFAULT_SETTINGS.policies.user.termsOfService,
            privacyPolicy: parsedPolicies.privacyPolicy || DEFAULT_SETTINGS.policies.user.privacyPolicy,
            refundDisputePolicy: parsedPolicies.refundDisputePolicy || DEFAULT_SETTINGS.policies.user.refundDisputePolicy,
          }),
        },
        driver: {
          ...DEFAULT_SETTINGS.policies.driver,
          ...(parsedPolicies.driver || {}),
        },
      },
    };
  } catch (err) {
    console.error('Failed to load MAAT app settings:', err);
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save MAAT app settings:', err);
  }
}

export const useAppSettingsStore = create((set, get) => ({
  settings: loadSettings(),
  loading: false,
  error: null,

  // ── Fetch complete settings from backend dynamically ─────────────────────
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await settingsService.getAppSettings();
      if (res.success && res.data?.settings) {
        const fetched = {
          general: res.data.settings.general || {},
          featureToggles: res.data.settings.featureToggles || {},
          dispatchRules: res.data.settings.dispatchRules || {},
          locationSettings: res.data.settings.locationSettings || {},
          inactivityPolicy: res.data.settings.inactivityPolicy || {},
          banners: Array.isArray(res.data.settings.banners) ? res.data.settings.banners : [],
          introImages: Array.isArray(res.data.settings.introImages) ? res.data.settings.introImages : [],
          policies: res.data.settings.policies || {},
        };
        saveSettings(fetched);
        set({ settings: fetched, loading: false });
        return { success: true, settings: fetched };
      }
      set({ loading: false });
    } catch (err) {
      console.warn('Backend fetchSettings failed:', err.message);
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
    return { success: false };
  },

  // ── Fetch Banners Dynamically ─────────────────────────────────────────────
  fetchBanners: async (params = {}) => {
    try {
      const res = await settingsService.bannerService.getAll(params);
      if (res.success && Array.isArray(res.data?.banners)) {
        const updated = { ...get().settings, banners: res.data.banners };
        saveSettings(updated);
        set({ settings: updated });
        return res.data.banners;
      }
    } catch (err) {
      console.warn('Dynamic banner fetch error:', err.message);
    }
    return get().settings.banners || [];
  },

  // ── Fetch Intro Screens Dynamically ───────────────────────────────────────
  fetchIntroScreens: async (params = {}) => {
    try {
      const res = await settingsService.introScreenService.getAll(params);
      if (res.success && Array.isArray(res.data?.introScreens)) {
        const updated = { ...get().settings, introImages: res.data.introScreens };
        saveSettings(updated);
        set({ settings: updated });
        return res.data.introScreens;
      }
    } catch (err) {
      console.warn('Dynamic intro screen fetch error:', err.message);
    }
    return get().settings.introImages || [];
  },

  // ── Fetch Policies Dynamically ────────────────────────────────────────────
  fetchPolicies: async () => {
    try {
      const res = await settingsService.policyService.getAll();
      if (res.success && Array.isArray(res.data?.policies)) {
        const policyMap = {};
        res.data.policies.forEach((p) => {
          if (p.type === 'terms_of_service') policyMap.termsOfService = p.contentMarkdown;
          if (p.type === 'privacy_policy') policyMap.privacyPolicy = p.contentMarkdown;
          if (p.type === 'refund_dispute_policy') policyMap.refundDisputePolicy = p.contentMarkdown;
        });
        const updated = { ...get().settings, policies: policyMap };
        saveSettings(updated);
        set({ settings: updated });
        return policyMap;
      }
    } catch (err) {
      console.warn('Dynamic policy fetch error:', err.message);
    }
    return get().settings.policies || {};
  },

  // ── Update General Settings ───────────────────────────────────────────────
  updateGeneral: async (fields) => {
    const updated = {
      ...get().settings,
      general: { ...get().settings.general, ...fields },
    };
    saveSettings(updated);
    set({ settings: updated });

    try {
      await settingsService.updateSettingsSection('general', updated.general);
      return { success: true };
    } catch (err) {
      console.warn('Backend updateGeneral error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── Update Feature Toggle ─────────────────────────────────────────────────
  updateFeatureToggle: async (key, value) => {
    const updatedToggles = { ...get().settings.featureToggles, [key]: value };
    const updated = {
      ...get().settings,
      featureToggles: updatedToggles,
    };
    saveSettings(updated);
    set({ settings: updated });

    try {
      await settingsService.updateSettingsSection('featureToggles', updatedToggles);
      return { success: true };
    } catch (err) {
      console.warn('Backend updateFeatureToggle error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── Update Dispatch & Ride Rules ──────────────────────────────────────────
  updateDispatchRules: async (fields) => {
    const updated = {
      ...get().settings,
      dispatchRules: { ...get().settings.dispatchRules, ...fields },
    };
    saveSettings(updated);
    set({ settings: updated });

    try {
      await settingsService.updateSettingsSection('dispatchRules', updated.dispatchRules);
      return { success: true };
    } catch (err) {
      console.warn('Backend updateDispatchRules error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── Update Location & Telematics Settings ─────────────────────────────────
  updateLocationSettings: async (fields) => {
    const updated = {
      ...get().settings,
      locationSettings: { ...get().settings.locationSettings, ...fields },
    };
    saveSettings(updated);
    set({ settings: updated });

    try {
      await settingsService.updateSettingsSection('locationSettings', updated.locationSettings);
      return { success: true };
    } catch (err) {
      console.warn('Backend updateLocationSettings error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── Update Inactivity Policy ──────────────────────────────────────────────
  updateInactivityPolicy: async (fields) => {
    const updated = {
      ...get().settings,
      inactivityPolicy: { ...get().settings.inactivityPolicy, ...fields },
    };
    saveSettings(updated);
    set({ settings: updated });

    try {
      await settingsService.updateSettingsSection('inactivityPolicy', updated.inactivityPolicy);
      return { success: true };
    } catch (err) {
      console.warn('Backend updateInactivityPolicy error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── Update Legal & Compliance Policies ───────────────────────────────────
  updatePolicies: async (fields) => {
    const current = get().settings.policies || {};
    let updatedPolicies;

    if (fields.targetApp === 'driver') {
      const driverObj = {
        ...(current.driver || {}),
        termsOfService: fields.termsOfService !== undefined ? fields.termsOfService : current.driver?.termsOfService,
        privacyPolicy: fields.privacyPolicy !== undefined ? fields.privacyPolicy : current.driver?.privacyPolicy,
        refundDisputePolicy: fields.refundDisputePolicy !== undefined ? fields.refundDisputePolicy : current.driver?.refundDisputePolicy,
      };
      updatedPolicies = {
        ...current,
        driver: driverObj,
      };
    } else if (fields.targetApp === 'user') {
      const userObj = {
        ...(current.user || {}),
        termsOfService: fields.termsOfService !== undefined ? fields.termsOfService : current.user?.termsOfService,
        privacyPolicy: fields.privacyPolicy !== undefined ? fields.privacyPolicy : current.user?.privacyPolicy,
        refundDisputePolicy: fields.refundDisputePolicy !== undefined ? fields.refundDisputePolicy : current.user?.refundDisputePolicy,
      };
      updatedPolicies = {
        ...current,
        user: userObj,
        termsOfService: userObj.termsOfService,
        privacyPolicy: userObj.privacyPolicy,
        refundDisputePolicy: userObj.refundDisputePolicy,
      };
    } else {
      updatedPolicies = {
        ...current,
        ...fields,
        user: { ...(current.user || {}), ...(fields.user || {}) },
        driver: { ...(current.driver || {}), ...(fields.driver || {}) },
      };
    }

    const updated = {
      ...get().settings,
      policies: updatedPolicies,
    };
    saveSettings(updated);
    set({ settings: updated });

    try {
      await settingsService.updateSettingsSection('policies', fields);
      return { success: true };
    } catch (err) {
      console.warn('Backend updatePolicies error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── BANNER CRUD (Domain Service Integrated) ───────────────────────────────
  addBanner: async (bannerData) => {
    try {
      const res = await settingsService.bannerService.create({
        title: bannerData.title || '',
        subtitle: bannerData.subtitle || '',
        imageUrl: bannerData.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80',
        actionType: bannerData.actionType || 'none',
        actionTarget: bannerData.actionTarget || '',
        targetAudience: bannerData.targetAudience || 'all',
        priority: Number(bannerData.priority) || ((get().settings.banners?.length || 0) + 1),
        isActive: bannerData.isActive !== false,
      });

      const newBanner = res?.data?.banner || {
        id: `bnr-${Date.now()}`,
        ...bannerData,
      };

      const updatedBanners = [...(get().settings.banners || []), newBanner].sort(
        (a, b) => (a.priority || 0) - (b.priority || 0)
      );
      const updated = { ...get().settings, banners: updatedBanners };
      saveSettings(updated);
      set({ settings: updated });
    } catch (err) {
      console.warn('Dedicated banner creation fallback:', err.message);
      const newBanner = {
        id: `bnr-${Date.now()}`,
        ...bannerData,
        createdAt: new Date().toISOString(),
      };
      const updatedBanners = [...(get().settings.banners || []), newBanner];
      const updated = { ...get().settings, banners: updatedBanners };
      saveSettings(updated);
      set({ settings: updated });
    }
  },

  updateBanner: async (id, fields) => {
    try {
      if (id && !id.startsWith('bnr-')) {
        await settingsService.bannerService.update(id, fields);
      }
    } catch (err) {
      console.warn('Backend updateBanner error:', err.message);
    }

    const updatedBanners = (get().settings.banners || [])
      .map((b) => (b.id === id || b._id === id ? { ...b, ...fields } : b))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const updated = { ...get().settings, banners: updatedBanners };
    saveSettings(updated);
    set({ settings: updated });
  },

  deleteBanner: async (id) => {
    try {
      if (id && !id.startsWith('bnr-')) {
        await settingsService.bannerService.delete(id);
      }
    } catch (err) {
      console.warn('Backend deleteBanner error:', err.message);
    }

    const updatedBanners = (get().settings.banners || []).filter((b) => b.id !== id && b._id !== id);
    const updated = { ...get().settings, banners: updatedBanners };
    saveSettings(updated);
    set({ settings: updated });
  },

  toggleBannerActive: async (id) => {
    try {
      if (id && !id.startsWith('bnr-')) {
        await settingsService.bannerService.toggleStatus(id);
      }
    } catch (err) {
      console.warn('Backend toggleBannerActive error:', err.message);
    }

    const updatedBanners = (get().settings.banners || []).map((b) =>
      b.id === id || b._id === id ? { ...b, isActive: !b.isActive } : b
    );
    const updated = { ...get().settings, banners: updatedBanners };
    saveSettings(updated);
    set({ settings: updated });
  },

  moveBannerPriority: async (id, direction) => {
    try {
      if (id && !id.startsWith('bnr-')) {
        await settingsService.bannerService.reorder(id, direction);
      }
    } catch (err) {
      console.warn('Backend moveBannerPriority error:', err.message);
    }

    const list = [...(get().settings.banners || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const index = list.findIndex((b) => b.id === id || b._id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const pCurrent = list[index].priority || 1;
    const pTarget = list[targetIndex].priority || 1;
    list[index].priority = pTarget;
    list[targetIndex].priority = pCurrent;

    list.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const updated = { ...get().settings, banners: list };
    saveSettings(updated);
    set({ settings: updated });
  },

  reorderBanners: async (startIndex, endIndex) => {
    const list = [...(get().settings.banners || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);
    const reordered = list.map((item, idx) => ({ ...item, priority: idx + 1 }));
    const updated = { ...get().settings, banners: reordered };
    saveSettings(updated);
    set({ settings: updated });
  },

  // ── INTRO IMAGES CRUD (Domain Service Integrated) ─────────────────────────
  addIntroImage: async (introData) => {
    try {
      const res = await settingsService.introScreenService.create({
        name: introData.name || 'New Onboarding Screen',
        imageUrl: introData.imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
        tag: introData.tag || `Walkthrough Step ${(get().settings.introImages?.length || 0) + 1}`,
        type: introData.type || 'user',
        platform: introData.platform || 'all',
        description: introData.description || '',
        priority: introData.priority ? Number(introData.priority) : (get().settings.introImages?.length || 0) + 1,
        isActive: introData.isActive !== false,
      });

      const newIntro = res?.data?.screen || {
        id: `intro-${Date.now()}`,
        ...introData,
      };

      const updatedIntros = [...(get().settings.introImages || []), newIntro].sort(
        (a, b) => (a.priority || 0) - (b.priority || 0)
      );
      const updated = { ...get().settings, introImages: updatedIntros };
      saveSettings(updated);
      set({ settings: updated });
    } catch (err) {
      console.warn('Dedicated intro creation fallback:', err.message);
      const newIntro = {
        id: `intro-${Date.now()}`,
        ...introData,
        createdAt: new Date().toISOString(),
      };
      const updatedIntros = [...(get().settings.introImages || []), newIntro];
      const updated = { ...get().settings, introImages: updatedIntros };
      saveSettings(updated);
      set({ settings: updated });
    }
  },

  updateIntroImage: async (id, fields) => {
    try {
      if (id && !id.startsWith('intro-')) {
        await settingsService.introScreenService.update(id, fields);
      }
    } catch (err) {
      console.warn('Backend updateIntroImage error:', err.message);
    }

    const list = (get().settings.introImages || [])
      .map((img) => (img.id === id || img._id === id ? { ...img, ...fields } : img))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const updated = { ...get().settings, introImages: list };
    saveSettings(updated);
    set({ settings: updated });
  },

  deleteIntroImage: async (id) => {
    try {
      if (id && !id.startsWith('intro-')) {
        await settingsService.introScreenService.delete(id);
      }
    } catch (err) {
      console.warn('Backend deleteIntroImage error:', err.message);
    }

    const list = (get().settings.introImages || []).filter((img) => img.id !== id && img._id !== id);
    const updated = { ...get().settings, introImages: list };
    saveSettings(updated);
    set({ settings: updated });
  },

  toggleIntroImage: async (id) => {
    try {
      if (id && !id.startsWith('intro-')) {
        await settingsService.introScreenService.toggleStatus(id);
      }
    } catch (err) {
      console.warn('Backend toggleIntroImage error:', err.message);
    }

    const list = (get().settings.introImages || []).map((img) =>
      img.id === id || img._id === id ? { ...img, isActive: !img.isActive } : img
    );
    const updated = { ...get().settings, introImages: list };
    saveSettings(updated);
    set({ settings: updated });
  },

  moveIntroImage: async (id, direction) => {
    try {
      if (id && !id.startsWith('intro-')) {
        await settingsService.introScreenService.reorder(id, direction);
      }
    } catch (err) {
      console.warn('Backend moveIntroImage error:', err.message);
    }

    const list = [...(get().settings.introImages || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const index = list.findIndex((img) => img.id === id || img._id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index].priority || 1;
    list[index].priority = list[targetIndex].priority || 1;
    list[targetIndex].priority = temp;

    list.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const updated = { ...get().settings, introImages: list };
    saveSettings(updated);
    set({ settings: updated });
  },

  // ── Reset to Defaults ─────────────────────────────────────────────────────
  resetDefaults: async () => {
    saveSettings(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });

    try {
      await settingsService.resetAppSettings();
    } catch (err) {
      console.warn('Backend resetDefaults error:', err.message);
    }
  },
}));
