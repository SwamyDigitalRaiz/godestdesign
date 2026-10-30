import { DEFAULT_SETTINGS } from '../config/defaultSettings';

const STORAGE_KEY = 'godest_demo_app_settings';

const loadSavedSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
};

let currentSettings = loadSavedSettings();

const saveCurrentSettings = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (e) {
    // ignore
  }
};

export const getAppSettings = async () => {
  return {
    success: true,
    data: {
      settings: currentSettings,
    },
  };
};

export const updateAppSettings = async (payload) => {
  currentSettings = { ...currentSettings, ...payload };
  saveCurrentSettings();
  return {
    success: true,
    data: {
      settings: currentSettings,
    },
  };
};

export const updateSettingsSection = async (section, payload) => {
  currentSettings[section] = { ...(currentSettings[section] || {}), ...payload };
  saveCurrentSettings();
  return {
    success: true,
    data: {
      settings: currentSettings,
    },
  };
};

export const resetAppSettings = async () => {
  currentSettings = { ...DEFAULT_SETTINGS };
  saveCurrentSettings();
  return {
    success: true,
    data: {
      settings: currentSettings,
    },
  };
};

export const getPublicSettings = async () => {
  return {
    success: true,
    data: {
      settings: currentSettings,
    },
  };
};

export const locationService = {
  get: async () => ({
    success: true,
    data: { locationSettings: currentSettings.locationSettings },
  }),
  update: async (payload) => {
    currentSettings.locationSettings = {
      ...(currentSettings.locationSettings || {}),
      ...payload,
    };
    saveCurrentSettings();
    return {
      success: true,
      data: { locationSettings: currentSettings.locationSettings },
    };
  },
};

export const bannerService = {
  getAll: async () => ({
    success: true,
    data: { banners: currentSettings.banners || [] },
  }),
  create: async (bannerData) => {
    const newBanner = {
      ...bannerData,
      _id: `bnr_${Date.now()}`,
      id: `bnr_${Date.now()}`,
    };
    currentSettings.banners = [newBanner, ...(currentSettings.banners || [])];
    saveCurrentSettings();
    return { success: true, data: { banner: newBanner } };
  },
  update: async (id, bannerData) => {
    currentSettings.banners = (currentSettings.banners || []).map((b) =>
      b._id === id || b.id === id ? { ...b, ...bannerData } : b
    );
    saveCurrentSettings();
    return { success: true, data: { banner: bannerData } };
  },
  toggleStatus: async (id) => {
    currentSettings.banners = (currentSettings.banners || []).map((b) =>
      b._id === id || b.id === id ? { ...b, active: !b.active } : b
    );
    saveCurrentSettings();
    return { success: true };
  },
  delete: async (id) => {
    currentSettings.banners = (currentSettings.banners || []).filter(
      (b) => b._id !== id && b.id !== id
    );
    saveCurrentSettings();
    return { success: true };
  },
};

export default {
  getAppSettings,
  updateAppSettings,
  updateSettingsSection,
  resetAppSettings,
  getPublicSettings,
  locationService,
  bannerService,
};
