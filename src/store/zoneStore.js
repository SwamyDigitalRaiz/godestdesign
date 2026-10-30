import { create } from 'zustand';
import * as zoneService from '../services/zoneService';

export const useZoneStore = create((set, get) => ({
  zones: [],
  loading: false,
  error: null,

  // ── Fetch all geo-zones from backend ──────────────────────────────────────
  fetchZones: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await zoneService.getAllZones(params);
      if (res.success && Array.isArray(res.data?.zones)) {
        set({
          zones: res.data.zones,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.warn('Backend fetchZones failed:', err.message);
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Add new geo-zone ──────────────────────────────────────────────────────
  addZone: async (zoneData) => {
    set({ loading: true, error: null });
    try {
      const res = await zoneService.createZone(zoneData);
      if (res.success && res.data?.zone) {
        set((state) => ({
          zones: [res.data.zone, ...state.zones],
          loading: false,
        }));
        return { success: true, zone: res.data.zone };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      // Optimistic local fallback
      const newZ = {
        ...zoneData,
        id: `ZONE-${Date.now()}`,
        status: true,
        totalDrivers: 0,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        zones: [newZ, ...state.zones],
        loading: false,
      }));
      return { success: true, zone: newZ };
    }
  },

  // ── Update geo-zone ───────────────────────────────────────────────────────
  updateZone: async (id, updates) => {
    set((state) => ({
      zones: state.zones.map((z) =>
        (z._id === id || z.id === id || z.customId === id) ? { ...z, ...updates } : z
      ),
    }));

    try {
      const res = await zoneService.updateZone(id, updates);
      if (res.success && res.data?.zone) {
        set((state) => ({
          zones: state.zones.map((z) =>
            (z._id === id || z.id === id || z.customId === id) ? res.data.zone : z
          ),
        }));
        return { success: true, zone: res.data.zone };
      }
    } catch (err) {
      console.warn('Backend updateZone failed:', err.message);
    }
    return { success: true };
  },

  // ── Toggle zone status ────────────────────────────────────────────────────
  toggleZoneStatus: async (id) => {
    set((state) => ({
      zones: state.zones.map((z) =>
        (z._id === id || z.id === id || z.customId === id) ? { ...z, status: !z.status } : z
      ),
    }));

    try {
      await zoneService.toggleZoneStatus(id);
    } catch (err) {
      console.warn('Backend toggleZoneStatus failed:', err.message);
    }
  },

  // ── Delete geo-zone ───────────────────────────────────────────────────────
  deleteZone: async (id) => {
    set((state) => ({
      zones: state.zones.filter((z) => z._id !== id && z.id !== id && z.customId !== id),
    }));

    try {
      await zoneService.deleteZone(id);
      return { success: true };
    } catch (err) {
      console.warn('Backend deleteZone failed:', err.message);
      return { success: true };
    }
  },

  clearError: () => set({ error: null }),
}));
