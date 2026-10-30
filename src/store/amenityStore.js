import { create } from 'zustand';
import { MOCK_AMENITIES } from '../services/mockData';

const STORAGE_KEY = 'godest_demo_amenities';

const getInitialAmenities = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return [...MOCK_AMENITIES];
};

const saveAmenities = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
};

export const useAmenityStore = create((set, get) => ({
  amenities: getInitialAmenities(),
  loading: false,
  error: null,

  fetchAmenities: async () => {
    set({ loading: true, error: null });
    const current = getInitialAmenities();
    set({ amenities: current, loading: false });
  },

  createAmenity: async (payload) => {
    const newAmenity = {
      ...payload,
      _id: `amn_${Date.now()}`,
      id: `amn_${Date.now()}`,
      status: payload.status !== undefined ? payload.status : true,
      sortOrder: payload.sortOrder || (get().amenities.length + 1),
    };
    const updated = [newAmenity, ...get().amenities];
    set({ amenities: updated });
    saveAmenities(updated);
    return newAmenity;
  },

  updateAmenity: async (id, payload) => {
    const updated = get().amenities.map((a) =>
      a._id === id || a.id === id ? { ...a, ...payload } : a
    );
    set({ amenities: updated });
    saveAmenities(updated);
    return updated.find((a) => a._id === id || a.id === id);
  },

  toggleAmenityStatus: async (id) => {
    const updated = get().amenities.map((a) =>
      a._id === id || a.id === id ? { ...a, status: !a.status } : a
    );
    set({ amenities: updated });
    saveAmenities(updated);
    return updated.find((a) => a._id === id || a.id === id);
  },

  deleteAmenity: async (id) => {
    const updated = get().amenities.filter((a) => a._id !== id && a.id !== id);
    set({ amenities: updated });
    saveAmenities(updated);
  },
}));
