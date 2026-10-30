import { MOCK_DRIVERS } from './mockData';

const STORAGE_KEY = 'godest_demo_drivers';

const getDriversList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [...MOCK_DRIVERS];
};

const saveDriversList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
};

export const getAllDrivers = async (params = {}) => {
  let list = getDriversList();
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.phone?.includes(q) ||
        d.customId?.toLowerCase().includes(q) ||
        d.vehicleNumber?.toLowerCase().includes(q)
    );
  }
  if (params.vehicleType && params.vehicleType !== 'all') {
    list = list.filter((d) => d.vehicleType?.toLowerCase() === params.vehicleType.toLowerCase());
  }

  const stats = {
    totalDrivers: list.length,
    activeCount: list.filter((d) => d.status === 'approved' && d.dutyStatus === 'online').length,
    pendingKycCount: list.filter((d) => d.status === 'pending').length,
    totalRidesSum: list.reduce((acc, d) => acc + (d.totalRides || 0), 0),
  };

  return {
    success: true,
    data: {
      drivers: list,
      pagination: { total: list.length, page: 1, limit: 20, pages: 1 },
      stats,
    },
  };
};

export const getDriverById = async (id) => {
  const list = getDriversList();
  const driver = list.find((d) => d.id === id || d._id === id || d.customId === id) || list[0];
  return { success: true, data: { driver } };
};

export const createDriver = async (payload) => {
  const list = getDriversList();
  const newDriver = {
    ...payload,
    _id: `drv_${Date.now()}`,
    id: `drv_${Date.now()}`,
    customId: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'approved',
    dutyStatus: 'online',
    rating: 5.0,
    totalRides: 0,
    createdAt: new Date().toISOString(),
  };
  const updated = [newDriver, ...list];
  saveDriversList(updated);
  return { success: true, data: { driver: newDriver } };
};

export const updateDriver = async (id, payload) => {
  const list = getDriversList();
  const updated = list.map((d) => (d.id === id || d._id === id ? { ...d, ...payload } : d));
  saveDriversList(updated);
  const driver = updated.find((d) => d.id === id || d._id === id);
  return { success: true, data: { driver } };
};

export const updateKycStatus = async (id, payload) => {
  return updateDriver(id, { kycStatus: payload.kycStatus, status: payload.kycStatus === 'approved' ? 'approved' : 'rejected' });
};

export const toggleDriverStatus = async (id) => {
  const list = getDriversList();
  const target = list.find((d) => d.id === id || d._id === id);
  const newDuty = target?.dutyStatus === 'online' ? 'offline' : 'online';
  return updateDriver(id, { dutyStatus: newDuty });
};

export const deleteDriver = async (id) => {
  const list = getDriversList();
  const updated = list.filter((d) => d.id !== id && d._id !== id);
  saveDriversList(updated);
  return { success: true, message: 'Driver deleted successfully' };
};

export const getDriverLiveLocations = async () => {
  const list = getDriversList();
  return {
    success: true,
    data: {
      drivers: list.filter((d) => d.liveLocation),
    },
  };
};
