import { create } from 'zustand';
import * as driverService from '../services/driverService';

/**
 * Driver Store — integrated with MAAT backend /api/admin/drivers/*
 *
 * State:
 *  - drivers     : current page of drivers from the backend
 *  - pagination  : { total, page, limit, pages }
 *  - stats       : KPI summary from backend
 *  - loading     : boolean
 *  - error       : string | null
 */
export const useDriverStore = create((set, get) => ({
  drivers: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },
  stats: {},
  loading: false,
  error: null,
  currentDriver: null,

  // ── Fetch paginated drivers ────────────────────────────────────────────────
  fetchDrivers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await driverService.getAllDrivers(params);
      if (res.success) {
        set({
          drivers: res.data.drivers,
          pagination: res.data.pagination,
          stats: res.data.stats || {},
          loading: false,
        });
      } else {
        set({ loading: false, error: res.message });
      }
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Fetch single driver ────────────────────────────────────────────────────
  fetchDriverById: async (id) => {
    set({ loading: true, error: null, currentDriver: null });
    try {
      const res = await driverService.getDriverById(id);
      if (res.success) {
        set({ currentDriver: res.data.driver, loading: false });
        return res.data.driver;
      }
      set({ loading: false, error: res.message });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
    return null;
  },

  // ── Add (create) driver ───────────────────────────────────────────────────
  addDriver: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await driverService.createDriver(payload);
      if (res.success) {
        set((state) => ({
          drivers: [res.data.driver, ...state.drivers],
          loading: false,
        }));
        return { success: true, driver: res.data.driver };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Update driver ──────────────────────────────────────────────────────────
  updateDriver: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const res = await driverService.updateDriver(id, updates);
      if (res.success) {
        set((state) => ({
          drivers: state.drivers.map((d) =>
            (d._id === id || d.id === id || d.customId === id) ? res.data.driver : d
          ),
          currentDriver: state.currentDriver?._id === id ? res.data.driver : state.currentDriver,
          loading: false,
        }));
        return { success: true, driver: res.data.driver };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Approve driver (KYC approved + status active) ─────────────────────────
  approveDriver: async (id) => {
    try {
      const res = await driverService.updateKycStatus(id, { kycStatus: 'approved' });
      if (res.success) {
        set((state) => ({
          drivers: state.drivers.map((d) =>
            (d._id === id || d.id === id || d.customId === id) ? res.data.driver : d
          ),
        }));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Reject driver (KYC rejected) ─────────────────────────────────────────
  rejectDriver: async (id, reason = 'Document verification failed') => {
    try {
      const res = await driverService.updateKycStatus(id, {
        kycStatus: 'rejected',
        rejectionReason: reason,
      });
      if (res.success) {
        set((state) => ({
          drivers: state.drivers.map((d) =>
            (d._id === id || d.id === id || d.customId === id) ? res.data.driver : d
          ),
        }));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Toggle driver active / inactive ──────────────────────────────────────
  toggleDriverStatus: async (id) => {
    try {
      const res = await driverService.toggleDriverStatus(id);
      if (res.success) {
        set((state) => ({
          drivers: state.drivers.map((d) =>
            (d._id === id || d.id === id || d.customId === id) ? res.data.driver : d
          ),
        }));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Delete driver ─────────────────────────────────────────────────────────
  deleteDriver: async (id) => {
    try {
      const res = await driverService.deleteDriver(id);
      if (res.success) {
        set((state) => ({
          drivers: state.drivers.filter(
            (d) => d._id !== id && d.id !== id && d.customId !== id
          ),
        }));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ error: message });
      return { success: false, message };
    }
  },

  // ── Get live GPS locations for map ────────────────────────────────────────
  fetchLiveLocations: async () => {
    try {
      const res = await driverService.getDriverLiveLocations();
      if (res.success) {
        return res.data.drivers;
      }
    } catch (err) {
      console.warn('Live locations unavailable:', err.message);
    }
    return [];
  },

  // ── Real-time driver presence & live location update from socket ─────────
  updateDriverPresence: (payload) => {
    const { driverId, id, isOnline, lastSeen, location, liveLocation, appVersion, appBuildNumber } = payload || {};
    set((state) => ({
      drivers: state.drivers.map((d) => {
        if (d._id === driverId || d.id === id || d.customId === id || d.id === driverId) {
          return {
            ...d,
            ...(isOnline !== undefined ? { isOnline, dutyStatus: isOnline ? (d.dutyStatus === 'offline' ? 'online' : d.dutyStatus) : 'offline' } : {}),
            ...(lastSeen ? { lastSeen } : {}),
            ...(location ? { location } : {}),
            ...(liveLocation ? { liveLocation } : {}),
            ...(appVersion ? { appVersion } : {}),
            ...(appBuildNumber ? { appBuildNumber } : {}),
          };
        }
        return d;
      }),
    }));
  },

  clearError: () => set({ error: null }),
}));
