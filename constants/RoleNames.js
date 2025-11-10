/**
 * Centralized role name definitions
 * Use these constants throughout the application for consistency and type-safety
 */

export const RoleNames = {
  USER_ADMIN: 'User Admin',
  PLATFORM_MANAGER: 'Platform Manager',
  CSR_REP: 'CSR Rep',
  PIN: 'PIN'
};

// Helper function to validate role name
export function isValidRole(roleName) {
  return Object.values(RoleNames).includes(roleName);
}

// Helper function to get all role names
export function getAllRoles() {
  return Object.values(RoleNames);
}