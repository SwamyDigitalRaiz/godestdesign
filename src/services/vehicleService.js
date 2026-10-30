import { MOCK_VEHICLES } from './mockData';

const STORAGE_KEY = 'godest_demo_vehicles';

const getVehiclesList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [...MOCK_VEHICLES];
};

const saveVehiclesList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
};

export const getAllVehicles = async (params = {}) => {
  let list = getVehiclesList();
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((v) => v.name?.toLowerCase().includes(q) || v.code?.toLowerCase().includes(q));
  }
  return {
    success: true,
    data: {
      vehicles: list,
      total: list.length,
    },
  };
};

export const getVehicleById = async (id) => {
  const list = getVehiclesList();
  const vehicle = list.find((v) => v.id === id || v._id === id) || list[0];
  return { success: true, data: { vehicle } };
};

export const createVehicle = async (payload) => {
  const list = getVehiclesList();
  const newVeh = {
    ...payload,
    _id: `veh_${Date.now()}`,
    id: `veh_${Date.now()}`,
    activeDrivers: 0,
    status: 'active',
  };
  const updated = [newVeh, ...list];
  saveVehiclesList(updated);
  return { success: true, message: 'Vehicle created successfully', data: { vehicle: newVeh } };
};

export const updateVehicle = async (id, payload) => {
  const list = getVehiclesList();
  const updated = list.map((v) => (v.id === id || v._id === id ? { ...v, ...payload } : v));
  saveVehiclesList(updated);
  const vehicle = updated.find((v) => v.id === id || v._id === id);
  return { success: true, message: 'Vehicle updated successfully', data: { vehicle } };
};

export const toggleVehicleField = async (id, fieldName) => {
  const list = getVehiclesList();
  const target = list.find((v) => v.id === id || v._id === id);
  if (!target) return { success: false };
  const currentVal = target[fieldName];
  const newVal = currentVal === 'active' ? 'inactive' : currentVal === 'inactive' ? 'active' : !currentVal;
  return updateVehicle(id, { [fieldName]: newVal });
};

export const deleteVehicle = async (id) => {
  const list = getVehiclesList();
  const updated = list.filter((v) => v.id !== id && v._id !== id);
  saveVehiclesList(updated);
  return { success: true, message: 'Vehicle category deleted' };
};
