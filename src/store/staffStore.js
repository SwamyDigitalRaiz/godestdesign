import { create } from 'zustand';
import staffService from '../services/staffService';

export const useStaffStore = create((set, get) => ({
  staff: [],
  loading: false,
  error: null,

  // ── Fetch all staff members from backend ──────────────────────────────────
  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const data = await staffService.getStaff();
      set({ staff: data || [], loading: false });
      return data;
    } catch (err) {
      const message = err.message || 'Failed to fetch staff members';
      set({ loading: false, error: message });
      throw err;
    }
  },

  // ── Add new staff member ─────────────────────────────────────────────────
  addStaff: async (staffData) => {
    set({ loading: true, error: null });
    try {
      const newMember = await staffService.createStaff(staffData);
      set((state) => ({
        staff: [newMember, ...state.staff],
        loading: false,
      }));
      return newMember;
    } catch (err) {
      const message = err.message || 'Failed to create staff member';
      set({ loading: false, error: message });
      throw err;
    }
  },

  // ── Update staff member ──────────────────────────────────────────────────
  updateStaff: async (id, staffData) => {
    set({ loading: true, error: null });
    try {
      const updatedMember = await staffService.updateStaff(id, staffData);
      set((state) => ({
        staff: state.staff.map((s) => ((s._id || s.id) === id ? updatedMember : s)),
        loading: false,
      }));
      return updatedMember;
    } catch (err) {
      const message = err.message || 'Failed to update staff member';
      set({ loading: false, error: message });
      throw err;
    }
  },

  // ── Delete staff member ──────────────────────────────────────────────────
  deleteStaff: async (id) => {
    set({ loading: true, error: null });
    try {
      await staffService.deleteStaff(id);
      set((state) => ({
        staff: state.staff.filter((s) => (s._id || s.id) !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      const message = err.message || 'Failed to delete staff member';
      set({ loading: false, error: message });
      throw err;
    }
  },

  // ── Toggle staff active status ───────────────────────────────────────────
  toggleStaffStatus: async (id) => {
    try {
      const res = await staffService.toggleStaffStatus(id);
      set((state) => ({
        staff: state.staff.map((s) =>
          (s._id || s.id) === id ? { ...s, isActive: !s.isActive } : s
        ),
      }));
      return res;
    } catch (err) {
      const message = err.message || 'Failed to toggle staff status';
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
