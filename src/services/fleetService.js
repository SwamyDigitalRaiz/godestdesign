import { MOCK_FLEET } from './mockData';

let fleetList = [...MOCK_FLEET];

export const getAllFleetOperators = async (params = {}) => {
  let list = [...fleetList];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((f) => f.name?.toLowerCase().includes(q) || f.contactPerson?.toLowerCase().includes(q));
  }
  return {
    success: true,
    data: {
      operators: list,
      pagination: { total: list.length, page: 1, limit: 20, pages: 1 },
      stats: { totalOperators: list.length, activeOperators: list.length },
    },
  };
};

export const getFleetOperatorById = async (id) => {
  const operator = fleetList.find((f) => f.id === id || f._id === id) || fleetList[0];
  return { success: true, data: { operator, drivers: [], stats: {} } };
};

export const createFleetOperator = async (payload) => {
  const newOperator = {
    ...payload,
    _id: `flt_${Date.now()}`,
    id: `flt_${Date.now()}`,
    totalVehicles: 0,
    activeDrivers: 0,
    status: 'active',
  };
  fleetList = [newOperator, ...fleetList];
  return { success: true, data: { operator: newOperator } };
};

export const updateFleetOperator = async (id, payload) => {
  fleetList = fleetList.map((f) => (f.id === id || f._id === id ? { ...f, ...payload } : f));
  const operator = fleetList.find((f) => f.id === id || f._id === id);
  return { success: true, data: { operator } };
};

export const toggleOperatorStatus = async (id) => {
  fleetList = fleetList.map((f) => {
    if (f.id === id || f._id === id) {
      return { ...f, status: f.status === 'active' ? 'inactive' : 'active' };
    }
    return f;
  });
  return { success: true };
};

export const deleteFleetOperator = async (id) => {
  fleetList = fleetList.filter((f) => f.id !== id && f._id !== id);
  return { success: true, message: 'Vendor removed successfully' };
};
