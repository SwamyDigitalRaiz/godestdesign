import { MOCK_TRIP_SEARCHES } from './mockData';

const STORAGE_KEY = 'godest_demo_inquiries';

const getInitialInquiries = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return [...MOCK_TRIP_SEARCHES];
};

let inquiriesDatabase = getInitialInquiries();

const saveInquiries = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiriesDatabase));
  } catch (e) {
    // ignore
  }
};

export const tripInquiryService = {
  getInquiries: async (params = {}) => {
    let list = [...inquiriesDatabase];

    if (params.status && params.status !== 'all') {
      list = list.filter((i) => i.status === params.status);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.userName?.toLowerCase().includes(q) ||
          i.userPhone?.toLowerCase().includes(q) ||
          i.pickupText?.toLowerCase().includes(q) ||
          i.destinationText?.toLowerCase().includes(q)
      );
    }

    const totalToday = inquiriesDatabase.length;
    const bookedToday = inquiriesDatabase.filter((i) => i.status === 'booked').length;
    const choosingNow = inquiriesDatabase.filter((i) => i.status === 'choosing').length;
    const conversionRate = totalToday > 0 ? `${((bookedToday / totalToday) * 100).toFixed(1)}%` : '0.0%';

    return {
      success: true,
      data: {
        inquiries: list,
        total: list.length,
        stats: {
          totalToday,
          bookedToday,
          choosingNow,
          conversionRate,
        },
      },
    };
  },

  deleteInquiry: async (id) => {
    inquiriesDatabase = inquiriesDatabase.filter((i) => i.id !== id && i._id !== id);
    saveInquiries();
    return { success: true, message: 'Inquiry deleted successfully' };
  },
};

export default tripInquiryService;
