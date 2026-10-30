import axios from 'axios';
import adminLogger from './adminLogger';
import {
  MOCK_ADMIN,
  MOCK_DRIVERS,
  MOCK_USERS,
  MOCK_VEHICLES,
  MOCK_ZONES,
  MOCK_FLEET,
  MOCK_STAFF,
  MOCK_ROLES,
  MOCK_AMENITIES,
  MOCK_RAPID_RIDES,
  MOCK_TRIP_SEARCHES,
} from './mockData';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Universal mock adapter so that ANY API request resolves smoothly with static mock data
api.interceptors.request.use(async (config) => {
  adminLogger.request(config);

  const url = config.url || '';
  let mockResult = { success: true, data: {} };

  if (url.includes('/auth/check')) {
    mockResult = { success: true, mainAdminExists: true, adminExists: true };
  } else if (url.includes('/auth/login') || url.includes('/auth/me')) {
    mockResult = { success: true, data: { token: 'demo-token', admin: MOCK_ADMIN } };
  } else if (url.includes('/drivers')) {
    mockResult = { success: true, data: { drivers: MOCK_DRIVERS, total: MOCK_DRIVERS.length, stats: {} } };
  } else if (url.includes('/users')) {
    mockResult = { success: true, data: { users: MOCK_USERS, total: MOCK_USERS.length, stats: {} } };
  } else if (url.includes('/vehicles')) {
    mockResult = { success: true, data: { vehicles: MOCK_VEHICLES, total: MOCK_VEHICLES.length } };
  } else if (url.includes('/zones')) {
    mockResult = { success: true, data: { zones: MOCK_ZONES, total: MOCK_ZONES.length } };
  } else if (url.includes('/fleet-operators')) {
    mockResult = { success: true, data: { operators: MOCK_FLEET, total: MOCK_FLEET.length } };
  } else if (url.includes('/staff')) {
    mockResult = { success: true, data: { staff: MOCK_STAFF, total: MOCK_STAFF.length } };
  } else if (url.includes('/roles')) {
    mockResult = { success: true, data: { roles: MOCK_ROLES, total: MOCK_ROLES.length } };
  } else if (url.includes('/amenities')) {
    mockResult = { success: true, data: { amenities: MOCK_AMENITIES, total: MOCK_AMENITIES.length } };
  } else if (url.includes('/bookings')) {
    mockResult = { success: true, data: { rides: MOCK_RAPID_RIDES, total: MOCK_RAPID_RIDES.length } };
  } else if (url.includes('/trip-inquiries')) {
    mockResult = { success: true, data: { inquiries: MOCK_TRIP_SEARCHES, total: MOCK_TRIP_SEARCHES.length } };
  }

  // Intercept and return mock directly via custom adapter
  config.adapter = async () => {
    return {
      data: mockResult,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };

  return config;
});

api.interceptors.response.use(
  (response) => {
    adminLogger.response(response);
    return response;
  },
  () => {
    return Promise.resolve({ data: { success: true, data: {} } });
  }
);

export default api;
