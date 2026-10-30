import { MOCK_ROLES } from './mockData';

let rolesList = [...MOCK_ROLES];

export const getRoles = async () => {
  return { success: true, data: { roles: rolesList } };
};

export const createRole = async (payload) => {
  const newRole = {
    ...payload,
    id: `role_${Date.now()}`,
    usersCount: 0,
  };
  rolesList = [newRole, ...rolesList];
  return { success: true, data: { role: newRole } };
};

export const updateRole = async (id, payload) => {
  rolesList = rolesList.map((r) => (r.id === id ? { ...r, ...payload } : r));
  const role = rolesList.find((r) => r.id === id);
  return { success: true, data: { role } };
};

export const deleteRole = async (id) => {
  rolesList = rolesList.filter((r) => r.id !== id);
  return { success: true, message: 'Role deleted successfully' };
};
