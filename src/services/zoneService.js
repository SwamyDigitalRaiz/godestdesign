import { MOCK_ZONES } from './mockData';

const STORAGE_KEY = 'godest_demo_zones';

const getZonesList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [...MOCK_ZONES];
};

const saveZonesList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
};

export const getAllZones = async (params = {}) => {
  let list = getZonesList();
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((z) => z.name?.toLowerCase().includes(q) || z.city?.toLowerCase().includes(q) || z.code?.toLowerCase().includes(q));
  }
  return {
    success: true,
    data: {
      zones: list,
      total: list.length,
    },
  };
};

export const getZoneById = async (id) => {
  const list = getZonesList();
  const zone = list.find((z) => z.id === id || z._id === id) || list[0];
  return { success: true, data: { zone } };
};

export const createZone = async (payload) => {
  const list = getZonesList();
  const newZone = {
    ...payload,
    _id: `zn_${Date.now()}`,
    id: `zn_${Date.now()}`,
    driversOnline: 0,
    activeBookings: 0,
    status: 'active',
  };
  const updated = [newZone, ...list];
  saveZonesList(updated);
  return { success: true, message: 'Zone created successfully', data: { zone: newZone } };
};

export const updateZone = async (id, payload) => {
  const list = getZonesList();
  const updated = list.map((z) => (z.id === id || z._id === id ? { ...z, ...payload } : z));
  saveZonesList(updated);
  const zone = updated.find((z) => z.id === id || z._id === id);
  return { success: true, message: 'Zone updated successfully', data: { zone } };
};

export const toggleZoneStatus = async (id) => {
  const list = getZonesList();
  const target = list.find((z) => z.id === id || z._id === id);
  const newStatus = target?.status === 'active' ? 'inactive' : 'active';
  return updateZone(id, { status: newStatus });
};

export const deleteZone = async (id) => {
  const list = getZonesList();
  const updated = list.filter((z) => z.id !== id && z._id !== id);
  saveZonesList(updated);
  return { success: true, message: 'Zone deleted successfully' };
};
