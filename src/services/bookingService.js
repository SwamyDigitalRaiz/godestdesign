import { MOCK_RAPID_RIDES, MOCK_DRIVERS } from './mockData';

const STORAGE_KEY = 'godest_demo_bookings';

const getInitialBookings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return [...MOCK_RAPID_RIDES];
};

let bookingsDatabase = getInitialBookings();

const saveBookings = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingsDatabase));
  } catch (e) {
    // ignore
  }
};

export const bookingService = {
  getBookings: async (params = {}) => {
    let filtered = [...bookingsDatabase];
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((r) => r.status === params.status);
    }
    if (params.vehicleType && params.vehicleType !== 'all') {
      filtered = filtered.filter((r) => r.vehicleType?.toLowerCase() === params.vehicleType?.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id?.toLowerCase().includes(q) ||
          r.user?.name?.toLowerCase().includes(q) ||
          r.driver?.name?.toLowerCase().includes(q) ||
          r.pickup?.toLowerCase().includes(q) ||
          r.drop?.toLowerCase().includes(q)
      );
    }

    const counts = {
      all: bookingsDatabase.length,
      requested: bookingsDatabase.filter((r) => r.status === 'requested').length,
      ongoing: bookingsDatabase.filter((r) => r.status === 'ongoing').length,
      completed: bookingsDatabase.filter((r) => r.status === 'completed').length,
      cancelled: bookingsDatabase.filter((r) => r.status === 'cancelled').length,
    };

    return {
      success: true,
      data: {
        rides: filtered,
        counts,
        total: filtered.length,
      },
    };
  },

  getAvailableDrivers: async (params = {}) => {
    let drivers = MOCK_DRIVERS.filter((d) => d.status === 'approved' && d.dutyStatus === 'online');
    if (params.vehicleType) {
      drivers = drivers.filter(
        (d) => d.vehicleType?.toLowerCase() === params.vehicleType?.toLowerCase()
      );
    }
    return {
      success: true,
      data: {
        drivers,
      },
    };
  },

  assignDriver: async (rideId, driverId) => {
    const driver = MOCK_DRIVERS.find((d) => d.id === driverId || d._id === driverId);
    bookingsDatabase = bookingsDatabase.map((r) => {
      if (r.id === rideId || r.mongoId === rideId) {
        return {
          ...r,
          status: 'ongoing',
          driver: driver
            ? {
                name: driver.name,
                phone: driver.phone,
                vehicleNo: driver.vehicleNumber,
                rating: driver.rating || '4.8',
              }
            : r.driver,
        };
      }
      return r;
    });
    saveBookings();
    return { success: true, message: 'Driver assigned successfully' };
  },
};

export default bookingService;
