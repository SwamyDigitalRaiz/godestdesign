import { MOCK_ADMIN } from './mockData';

export const checkAdminExists = async () => {
  return { success: true, mainAdminExists: true, adminExists: true };
};

export const registerAdmin = async ({ name, email, password, phone }) => {
  return {
    success: true,
    data: {
      token: 'demo-static-jwt-token',
      admin: { ...MOCK_ADMIN, name: name || MOCK_ADMIN.name, email: email || MOCK_ADMIN.email },
    },
  };
};

export const loginAdmin = async ({ email, password }) => {
  return {
    success: true,
    data: {
      token: 'demo-static-jwt-token',
      admin: MOCK_ADMIN,
    },
  };
};

export const getAdminProfile = async () => {
  return {
    success: true,
    data: {
      admin: MOCK_ADMIN,
    },
  };
};
