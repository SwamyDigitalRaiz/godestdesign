import { MOCK_USERS } from './mockData';

const STORAGE_KEY = 'godest_demo_users';

const getUsersList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [...MOCK_USERS];
};

const saveUsersList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
};

export const getAllUsers = async (params = {}) => {
  let list = getUsersList();
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.customId?.toLowerCase().includes(q)
    );
  }

  const stats = {
    totalUsers: list.length,
    activeCount: list.filter((u) => u.status === 'active').length,
    suspendedCount: list.filter((u) => u.status === 'suspended').length,
    totalRidesSum: list.reduce((acc, u) => acc + (u.totalRides || 0), 0),
    totalSpentSum: list.reduce((acc, u) => acc + (u.totalSpent || 0), 0),
  };

  return {
    success: true,
    data: {
      users: list,
      pagination: { total: list.length, page: 1, limit: 20, pages: 1 },
      stats,
    },
  };
};

export const getUserById = async (id) => {
  const list = getUsersList();
  const user = list.find((u) => u.id === id || u._id === id || u.customId === id) || list[0];
  return { success: true, data: { user } };
};

export const createUser = async (payload) => {
  const list = getUsersList();
  const newUser = {
    ...payload,
    _id: `usr_${Date.now()}`,
    id: `usr_${Date.now()}`,
    customId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'active',
    rating: 5.0,
    totalRides: 0,
    totalSpent: 0,
    walletBalance: 0,
    createdAt: new Date().toISOString(),
  };
  const updated = [newUser, ...list];
  saveUsersList(updated);
  return { success: true, data: { user: newUser } };
};

export const updateUser = async (id, payload) => {
  const list = getUsersList();
  const updated = list.map((u) => (u.id === id || u._id === id ? { ...u, ...payload } : u));
  saveUsersList(updated);
  const user = updated.find((u) => u.id === id || u._id === id);
  return { success: true, data: { user } };
};

export const toggleBlockUser = async (id) => {
  const list = getUsersList();
  const target = list.find((u) => u.id === id || u._id === id);
  const newStatus = target?.status === 'active' ? 'suspended' : 'active';
  return updateUser(id, { status: newStatus, isBlocked: newStatus === 'suspended' });
};

export const deleteUser = async (id) => {
  const list = getUsersList();
  const updated = list.filter((u) => u.id !== id && u._id !== id);
  saveUsersList(updated);
  return { success: true, message: 'User deleted successfully' };
};
