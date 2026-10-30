import { create } from 'zustand';
import * as userService from '../services/userService';

/**
 * User Store — integrated with MAAT backend /api/admin/users/*
 *
 * State:
 *  - users       : current page of users from the backend
 *  - pagination  : { total, page, limit, pages }
 *  - stats       : { totalUsers, activeCount, suspendedCount, totalRidesSum, totalSpentSum }
 *  - loading     : boolean
 *  - error       : string | null
 */
export const useUserStore = create((set, get) => ({
  users: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },
  stats: { totalUsers: 0, activeCount: 0, suspendedCount: 0, totalRidesSum: 0, totalSpentSum: 0 },
  loading: false,
  error: null,
  currentUser: null,

  // ── Fetch paginated users ──────────────────────────────────────────────────
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await userService.getAllUsers(params);
      if (res.success) {
        set({
          users: res.data.users,
          pagination: res.data.pagination,
          stats: res.data.stats,
          loading: false,
        });
      } else {
        set({ loading: false, error: res.message });
      }
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Fetch single user ──────────────────────────────────────────────────────
  fetchUserById: async (id) => {
    set({ loading: true, error: null, currentUser: null });
    try {
      const res = await userService.getUserById(id);
      if (res.success) {
        set({ currentUser: res.data.user, loading: false });
        return res.data.user;
      }
      set({ loading: false, error: res.message });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
    return null;
  },

  // Alias for existing code using getUserById(id) directly
  getUserById: (id) => {
    return get().users.find((u) => u._id === id || u.id === id || u.customId === id);
  },

  // ── Create user ────────────────────────────────────────────────────────────
  createUser: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await userService.createUser(payload);
      if (res.success) {
        // Prepend to local list
        set((state) => ({
          users: [res.data.user, ...state.users],
          loading: false,
        }));
        return { success: true, user: res.data.user };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Update user ────────────────────────────────────────────────────────────
  updateUser: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const res = await userService.updateUser(id, payload);
      if (res.success) {
        set((state) => ({
          users: state.users.map((u) =>
            (u._id === id || u.id === id || u.customId === id) ? res.data.user : u
          ),
          currentUser: state.currentUser?._id === id || state.currentUser?.id === id
            ? res.data.user
            : state.currentUser,
          loading: false,
        }));
        return { success: true, user: res.data.user };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Toggle block / unblock ─────────────────────────────────────────────────
  toggleBlockUser: async (id) => {
    try {
      const res = await userService.toggleBlockUser(id);
      if (res.success) {
        set((state) => ({
          users: state.users.map((u) =>
            (u._id === id || u.id === id || u.customId === id)
              ? { ...u, status: res.data.status, isBlocked: res.data.isBlocked }
              : u
          ),
        }));
        return res.data.status;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || err.message });
    }
    return null;
  },

  // ── Delete user ────────────────────────────────────────────────────────────
  deleteUser: async (id) => {
    try {
      const res = await userService.deleteUser(id);
      if (res.success) {
        set((state) => ({
          users: state.users.filter(
            (u) => u._id !== id && u.id !== id && u.customId !== id
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

  // ── Adjust wallet balance (kept local for speed, then sync) ───────────────
  adjustWalletBalance: async (id, { amount, action, reason }) => {
    const delta = action === 'add' ? Number(amount) : -Number(amount);
    const payload = {
      walletBalance: delta,
      walletNote: reason,
    };
    return get().updateUser(id, payload);
  },

  // ── Real-time presence & location update from socket ───────────────────────
  updateUserPresence: (payload) => {
    const { userId, id, phone, isOnline, lastSeen, location, appVersion, appBuildNumber, currentLocation, activeInquiry, currentAction } = payload || {};
    set((state) => ({
      users: state.users.map((u) => {
        const matches =
          (userId && (u._id === userId || u.id === userId || u.customId === userId)) ||
          (id && (u._id === id || u.id === id || u.customId === id)) ||
          (phone && u.phone && u.phone === phone);

        if (matches) {
          return {
            ...u,
            ...(isOnline !== undefined ? { isOnline } : {}),
            ...(lastSeen ? { lastSeen } : {}),
            ...(location ? { location } : {}),
            ...(appVersion ? { appVersion } : {}),
            ...(appBuildNumber ? { appBuildNumber } : {}),
            ...(currentLocation ? { currentLocation } : {}),
            ...(activeInquiry !== undefined ? { activeInquiry } : {}),
            ...(currentAction !== undefined ? { currentAction } : {}),
          };
        }
        return u;
      }),
    }));
  },

  clearError: () => set({ error: null }),
}));
