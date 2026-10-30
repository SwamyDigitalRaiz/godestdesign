import { MOCK_STAFF } from './mockData';

let staffList = [...MOCK_STAFF];

const staffService = {
  getStaff: async () => {
    return [...staffList];
  },

  createStaff: async (staffData) => {
    const newStaff = {
      ...staffData,
      _id: `stf_${Date.now()}`,
      id: `stf_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    staffList = [newStaff, ...staffList];
    return newStaff;
  },

  updateStaff: async (id, staffData) => {
    staffList = staffList.map((s) => (s.id === id || s._id === id ? { ...s, ...staffData } : s));
    return staffList.find((s) => s.id === id || s._id === id);
  },

  toggleStaffStatus: async (id) => {
    staffList = staffList.map((s) => {
      if (s.id === id || s._id === id) {
        return { ...s, status: s.status === 'active' ? 'inactive' : 'active' };
      }
      return s;
    });
    return { success: true };
  },

  deleteStaff: async (id) => {
    staffList = staffList.filter((s) => s.id !== id && s._id !== id);
    return { success: true };
  },
};

export default staffService;
