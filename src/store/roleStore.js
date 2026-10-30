import { create } from 'zustand';
import * as roleService from '../services/roleService';

export const PERMISSION_CATEGORIES = {
  'People & Drivers': ['users', 'drivers', 'vendors', 'kyc'],
  'Bike & Auto Mobility': ['vehicles', 'bike-auto-drivers', 'rapid-bookings', 'zone'],
  'Other Rides': ['bus-bookings', 'live-tracking'],
  'Finance & Settlements': ['payments', 'withdrawals', 'payouts', 'wallet-promo', 'coupons'],
  'Safety, Support & Platform': ['notifications', 'support', 'reviews', 'reports'],
  'Analytics & Admin': ['dashboard', 'analytics', 'logs', 'roles', 'staff', 'settings'],
};

export const PERMISSION_LABELS = {
  users: 'Passenger Users & Profiles',
  drivers: 'Drivers Fleet & KYC Approvals',
  vendors: 'Fleet Operators',
  kyc: 'KYC Document Verifications',
  vehicles: 'Bike & Auto Vehicle Types',
  'bike-auto-drivers': 'Bike & Auto Drivers Registry',
  'rapid-bookings': 'Bike & Auto Bookings',
  zone: 'Geo-Zones & Boundary Geofencing',
  'bus-bookings': 'Bus Bookings & API Providers',
  'live-tracking': 'Live GPS Fleet Map Tracking',
  payments: 'User Payments & Transactions',
  withdrawals: 'Driver & Vendor Withdrawals',
  payouts: 'Driver Earnings Settlements',
  'wallet-promo': 'Wallet Balances & Promotional Cash',
  coupons: 'Discount Coupons & Vouchers',
  notifications: 'Broadcast Push Notifications',
  support: 'Customer & Driver Support Tickets',
  reviews: 'Ratings & Reviews Moderation',
  reports: 'Safety Incidents & Flagged Rides',
  dashboard: 'Command Center Dashboard',
  analytics: 'Revenue & Volume Analytics',
  logs: 'System Logs & Audit Trails',
  roles: 'Roles & Permissions',
  staff: 'Staff Management',
  settings: 'Global App & Gateway Settings',
};

export const getAvailableActions = (permission) => {
  switch (permission) {
    case 'dashboard':
    case 'live-tracking':
    case 'logs':
      return ['view'];
    case 'users':
      return ['view', 'edit', 'block', 'wallet', 'delete'];
    case 'drivers':
    case 'kyc':
      return ['view', 'approve', 'reject', 'edit', 'delete'];
    case 'withdrawals':
      return ['view', 'approve', 'reject', 'delete'];
    case 'payouts':
      return ['view', 'process', 'delete'];
    case 'payments':
      return ['view', 'refund', 'delete'];
    case 'wallet-promo':
      return ['view', 'credit', 'debit'];
    case 'rapid-bookings':
      return ['view', 'edit', 'cancel', 'delete'];
    case 'support':
      return ['view', 'reply', 'close', 'delete'];
    case 'reports':
      return ['view', 'resolve', 'delete'];
    case 'reviews':
      return ['view', 'delete'];
    case 'notifications':
      return ['view', 'create', 'delete'];
    case 'settings':
      return ['view', 'edit'];
    default:
      return ['view', 'create', 'edit', 'delete'];
  }
};

export const ROLE_PRESETS = [
  {
    name: 'Super Admin',
    description: 'Full unrestricted access to all modules, financial settlements, and staff controls',
    apply: () => {
      const perms = { all: true };
      Object.keys(PERMISSION_LABELS).forEach((key) => {
        perms[key] = {};
        getAvailableActions(key).forEach((act) => { perms[key][act] = true; });
      });
      return perms;
    },
  },
  {
    name: 'Operations & Fleet Manager',
    description: 'Manages drivers, vehicle categories, KYC approvals, zones, and live GPS tracking',
    apply: () => ({
      dashboard: { view: true },
      drivers: { view: true, approve: true, reject: true, edit: true },
      'bike-auto-drivers': { view: true, create: true, edit: true, delete: true },
      vehicles: { view: true, create: true, edit: true, delete: true },
      kyc: { view: true, approve: true, reject: true },
      zone: { view: true, create: true, edit: true, delete: true },
      'rapid-bookings': { view: true, edit: true, cancel: true },
      'live-tracking': { view: true },
      support: { view: true, reply: true, close: true },
    }),
  },
  {
    name: 'Customer Support & Safety Lead',
    description: 'Handles passenger and driver disputes, safety reports, reviews, and ticket resolutions',
    apply: () => ({
      dashboard: { view: true },
      users: { view: true, edit: true, block: true },
      support: { view: true, reply: true, close: true },
      reports: { view: true, resolve: true },
      reviews: { view: true, delete: true },
      'rapid-bookings': { view: true },
      'live-tracking': { view: true },
    }),
  },
  {
    name: 'Finance & Payout Auditor',
    description: 'Audits ride payments, approves driver withdrawals, processes payouts, and manages coupons',
    apply: () => ({
      dashboard: { view: true },
      payments: { view: true, refund: true },
      withdrawals: { view: true, approve: true, reject: true },
      payouts: { view: true, process: true },
      'wallet-promo': { view: true, credit: true, debit: true },
      coupons: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true, export: true },
    }),
  },
  {
    name: 'Safety & Compliance Officer',
    description: 'Reviews KYC documents, investigates flagged incidents, and inspects audit logs',
    apply: () => ({
      dashboard: { view: true },
      kyc: { view: true, approve: true, reject: true },
      drivers: { view: true, edit: true },
      reports: { view: true, resolve: true },
      reviews: { view: true },
      'live-tracking': { view: true },
      logs: { view: true },
    }),
  },
];

/**
 * Role Store — integrated with MAAT backend /api/admin/roles/*
 */
export const useRoleStore = create((set, get) => ({
  roles: [],
  loading: false,
  error: null,

  // ── Fetch all roles ────────────────────────────────────────────────────────
  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      const res = await roleService.getRoles();
      if (res.success) {
        set({ roles: res.data.roles, loading: false });
      } else {
        set({ loading: false, error: res.message });
      }
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ── Add role ───────────────────────────────────────────────────────────────
  addRole: async (roleData) => {
    set({ loading: true, error: null });
    try {
      const res = await roleService.createRole(roleData);
      if (res.success) {
        set((state) => ({ roles: [res.data.role, ...state.roles], loading: false }));
        return { success: true, role: res.data.role };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Update role ────────────────────────────────────────────────────────────
  updateRole: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const res = await roleService.updateRole(id, updates);
      if (res.success) {
        set((state) => ({
          roles: state.roles.map((r) => (r._id === id || r.id === id ? res.data.role : r)),
          loading: false,
        }));
        return { success: true, role: res.data.role };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Delete role ────────────────────────────────────────────────────────────
  deleteRole: async (id) => {
    const role = get().roles.find((r) => r._id === id || r.id === id);
    if (role?.isSystem) throw new Error('System roles cannot be deleted');

    set({ loading: true, error: null });
    try {
      const res = await roleService.deleteRole(id);
      if (res.success) {
        set((state) => ({
          roles: state.roles.filter((r) => r._id !== id && r.id !== id),
          loading: false,
        }));
        return { success: true };
      }
      set({ loading: false, error: res.message });
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
