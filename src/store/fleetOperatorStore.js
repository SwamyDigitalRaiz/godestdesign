import { create } from 'zustand';
import * as fleetService from '../services/fleetService';

/**
 * Fleet Operator Store — integrated with MAAT backend /api/admin/fleet-operators/*
 */
export const useFleetOperatorStore = create((set, get) => ({
  operators: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },
  stats: {
    totalOperators: 0,
    activeOperators: 0,
    totalManagedDrivers: 0,
    totalAutoCount: 0,
    totalBikeCount: 0,
  },
  availableDrivers: [],
  loading: false,
  error: null,
  currentOperator: null,

  // ── Fetch all operators ────────────────────────────────────────────────────
  fetchOperators: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await fleetService.getAllFleetOperators(params);
      if (res.success) {
        set({
          operators: res.data.operators,
          pagination: res.data.pagination || {},
          stats: res.data.stats || get().stats,
          loading: false,
        });
        return res.data;
      } else {
        set({ loading: false, error: res.message });
      }
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Fetch single operator ─────────────────────────────────────────────────
  fetchOperatorById: async (id) => {
    set({ loading: true, error: null, currentOperator: null });
    try {
      const res = await fleetService.getFleetOperatorById(id);
      if (res.success) {
        set({ currentOperator: res.data.operator, loading: false });
        return res.data.operator;
      }
      set({ loading: false, error: res.message });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
    return null;
  },

  // ── Create operator ───────────────────────────────────────────────────────
  addOperator: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fleetService.createFleetOperator(payload);
      if (res.success) {
        set((state) => ({
          operators: [res.data.operator, ...state.operators],
          stats: {
            ...state.stats,
            totalOperators: state.stats.totalOperators + 1,
            activeOperators: state.stats.activeOperators + 1,
          },
          loading: false,
        }));
        return { success: true, operator: res.data.operator };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Update operator ───────────────────────────────────────────────────────
  updateOperator: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fleetService.updateFleetOperator(id, payload);
      if (res.success) {
        set((state) => ({
          operators: state.operators.map((o) =>
            o._id === id || o.id === id || o.customId === id ? { ...o, ...res.data.operator } : o
          ),
          currentOperator:
            state.currentOperator?._id === id || state.currentOperator?.id === id || state.currentOperator?.customId === id
              ? { ...state.currentOperator, ...res.data.operator }
              : state.currentOperator,
          loading: false,
        }));
        return { success: true, operator: res.data.operator };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Toggle operator status ────────────────────────────────────────────────
  toggleOperatorStatus: async (id) => {
    try {
      const res = await fleetService.toggleOperatorStatus(id);
      if (res.success) {
        set((state) => ({
          operators: state.operators.map((o) =>
            o._id === id || o.id === id || o.customId === id
              ? { ...o, status: res.data.status }
              : o
          ),
          currentOperator:
            state.currentOperator &&
            (state.currentOperator._id === id ||
              state.currentOperator.id === id ||
              state.currentOperator.customId === id)
              ? { ...state.currentOperator, status: res.data.status }
              : state.currentOperator,
        }));
        return { success: true, status: res.data.status };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Delete operator ───────────────────────────────────────────────────────
  deleteOperator: async (id) => {
    try {
      const res = await fleetService.deleteFleetOperator(id);
      if (res.success) {
        set((state) => ({
          operators: state.operators.filter(
            (o) => o._id !== id && o.id !== id && o.customId !== id
          ),
          stats: {
            ...state.stats,
            totalOperators: Math.max(0, state.stats.totalOperators - 1),
          },
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

  // ── Reset password for operator ──────────────────────────────────────────
  resetOperatorPassword: async (id) => {
    try {
      const res = await fleetService.resetOperatorPassword(id);
      if (res.success) {
        const newPwd = res.data.tempPassword;
        set((state) => ({
          operators: state.operators.map((o) =>
            o._id === id || o.id === id || o.customId === id
              ? {
                  ...o,
                  portalAccess: {
                    ...(o.portalAccess || {}),
                    tempPassword: newPwd,
                  },
                }
              : o
          ),
          currentOperator:
            state.currentOperator &&
            (state.currentOperator._id === id ||
              state.currentOperator.id === id ||
              state.currentOperator.customId === id)
              ? {
                  ...state.currentOperator,
                  portalAccess: {
                    ...(state.currentOperator.portalAccess || {}),
                    tempPassword: newPwd,
                  },
                }
              : state.currentOperator,
        }));
        return { success: true, tempPassword: newPwd };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Fetch available drivers not assigned to fleet ─────────────────────────
  fetchAvailableDrivers: async () => {
    try {
      const res = await fleetService.getAvailableDrivers();
      if (res.success) {
        set({ availableDrivers: res.data.drivers || [] });
        return res.data.drivers;
      }
    } catch (err) {
      console.warn('fetchAvailableDrivers error:', err);
    }
    return [];
  },

  // ── Assign driver(s) to operator ──────────────────────────────────────────
  assignDriverToOperator: async (operatorId, driverId) => {
    try {
      const res = await fleetService.assignDrivers(operatorId, { driverId });
      if (res.success) {
        // Refresh operator details
        await get().fetchOperatorById(operatorId);
        // Refresh operators list
        get().fetchOperators();
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Unassign driver from operator ────────────────────────────────────────
  unassignDriverFromOperator: async (operatorId, driverId) => {
    try {
      const res = await fleetService.unassignDriver(operatorId, driverId);
      if (res.success) {
        // Refresh current operator details
        await get().fetchOperatorById(operatorId);
        // Refresh operators list
        get().fetchOperators();
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  clearError: () => set({ error: null }),
}));
