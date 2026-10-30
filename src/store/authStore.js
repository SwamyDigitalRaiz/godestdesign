import { create } from 'zustand';
import { MOCK_ADMIN } from '../services/mockData';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('maat_admin_user') || 'null') || MOCK_ADMIN,
  token: localStorage.getItem('maat_admin_token') || 'demo-static-token',
  isAuthenticated: true,
  loading: false,
  error: null,

  _persist: (user, token) => {
    localStorage.setItem('maat_admin_token', token);
    localStorage.setItem('maat_admin_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    const user = { ...MOCK_ADMIN, email: credentials.email || MOCK_ADMIN.email };
    const token = 'demo-static-token';
    localStorage.setItem('maat_admin_token', token);
    localStorage.setItem('maat_admin_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, loading: false, error: null });
    return { success: true };
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    const user = { ...MOCK_ADMIN, ...payload };
    const token = 'demo-static-token';
    localStorage.setItem('maat_admin_token', token);
    localStorage.setItem('maat_admin_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, loading: false, error: null });
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem('maat_admin_token');
    localStorage.removeItem('maat_admin_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAdminExists: async () => {
    return { success: true, mainAdminExists: true, adminExists: true };
  },

  loadProfile: async () => {
    set({ user: MOCK_ADMIN, isAuthenticated: true });
    return { success: true, data: { admin: MOCK_ADMIN } };
  },

  clearError: () => set({ error: null }),
}));
