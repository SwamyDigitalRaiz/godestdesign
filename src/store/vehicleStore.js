import { create } from 'zustand';
import * as vehicleService from '../services/vehicleService';

export const useVehicleStore = create((set, get) => ({
  vehicles: [],
  loading: false,
  error: null,

  // ── Fetch all vehicle categories from backend ─────────────────────────────
  fetchVehicles: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await vehicleService.getAllVehicles(params);
      if (res.success && Array.isArray(res.data?.vehicles)) {
        set({
          vehicles: res.data.vehicles,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.warn('Backend fetchVehicles failed:', err.message);
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Add new vehicle category ──────────────────────────────────────────────
  addVehicle: async (vehicleData) => {
    set({ loading: true, error: null });
    try {
      const res = await vehicleService.createVehicle(vehicleData);
      if (res.success && res.data?.vehicle) {
        set((state) => ({
          vehicles: [res.data.vehicle, ...state.vehicles],
          loading: false,
        }));
        return { success: true, vehicle: res.data.vehicle };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      // Optimistic local fallback if backend unreachable
      const newVeh = {
        ...vehicleData,
        id: `VEH-${Date.now()}`,
        status: true,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        vehicles: [newVeh, ...state.vehicles],
        loading: false,
      }));
      return { success: true, vehicle: newVeh };
    }
  },

  // ── Update vehicle category ──────────────────────────────────────────────
  updateVehicle: async (id, updates) => {
    // Optimistic UI update
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        (v._id === id || v.id === id || v.customId === id) ? { ...v, ...updates } : v
      ),
    }));

    try {
      const res = await vehicleService.updateVehicle(id, updates);
      if (res.success && res.data?.vehicle) {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            (v._id === id || v.id === id || v.customId === id) ? res.data.vehicle : v
          ),
        }));
        return { success: true, vehicle: res.data.vehicle };
      }
    } catch (err) {
      console.warn('Backend updateVehicle failed:', err.message);
    }
    return { success: true };
  },

  // ── Toggle specific field (status, bidding, weatherBad, etc.) ─────────────
  toggleField: async (id, fieldName) => {
    // Optimistic toggle
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        (v._id === id || v.id === id || v.customId === id)
          ? { ...v, [fieldName]: !v[fieldName] }
          : v
      ),
    }));

    try {
      await vehicleService.toggleVehicleField(id, fieldName);
    } catch (err) {
      console.warn('Backend toggleField failed, state maintained locally:', err.message);
    }
  },

  // ── Delete vehicle category ───────────────────────────────────────────────
  deleteVehicle: async (id) => {
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v._id !== id && v.id !== id && v.customId !== id),
    }));

    try {
      await vehicleService.deleteVehicle(id);
      return { success: true };
    } catch (err) {
      console.warn('Backend deleteVehicle failed, removed from local view:', err.message);
      return { success: true };
    }
  },

  clearError: () => set({ error: null }),
}));
