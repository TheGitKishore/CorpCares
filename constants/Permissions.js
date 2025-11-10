/**
 * Centralized permission definitions
 * Use these constants in your controllers for type-safety and maintainability
 */

export const Permissions = {
  // User Account Management
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  VIEW_ALL_USERS: 'VIEW_ALL_USERS',
  VIEW_USER: 'VIEW_USER',

  // User Profile Management
  CREATE_PROFILE: 'CREATE_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  DELETE_PROFILE: 'DELETE_PROFILE',
  VIEW_ALL_PROFILES: 'VIEW_ALL_PROFILES',
  VIEW_PROFILE: 'VIEW_PROFILE',

  // Service Category Management
  CREATE_CATEGORY: 'CREATE_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  VIEW_ALL_CATEGORIES: 'VIEW_ALL_CATEGORIES',
  VIEW_CATEGORY: 'VIEW_CATEGORY',

  // Service Request Management
  CREATE_OWN_REQUEST: 'CREATE_OWN_REQUEST',
  UPDATE_OWN_REQUEST: 'UPDATE_OWN_REQUEST',
  DELETE_OWN_REQUEST: 'DELETE_OWN_REQUEST',
  VIEW_OWN_REQUESTS: 'VIEW_OWN_REQUESTS',
  
  VIEW_ALL_REQUESTS: 'VIEW_ALL_REQUESTS',
  DELETE_ANY_REQUEST: 'DELETE_ANY_REQUEST',
  UPDATE_REQUEST_STATUS: 'UPDATE_REQUEST_STATUS',

  // CSR Features
  SAVE_REQUEST: 'SAVE_REQUEST',
  UNSAVE_REQUEST: 'UNSAVE_REQUEST',
  SHORTLIST_REQUEST: 'SHORTLIST_REQUEST',
  UNSHORTLIST_REQUEST: 'UNSHORTLIST_REQUEST',
  VIEW_SAVED_REQUESTS: 'VIEW_SAVED_REQUESTS',
  VIEW_SHORTLISTED_REQUESTS: 'VIEW_SHORTLISTED_REQUESTS',

  // Statistics
  VIEW_STATISTICS: 'VIEW_STATISTICS'
};

// Role-based permission sets (for easy database seeding)
export const RolePermissions = {
  'User Admin': [
    Permissions.CREATE_USER,
    Permissions.UPDATE_USER,
    Permissions.DELETE_USER,
    Permissions.VIEW_ALL_USERS,
    Permissions.VIEW_USER,
    Permissions.CREATE_PROFILE,
    Permissions.UPDATE_PROFILE,
    Permissions.DELETE_PROFILE,
    Permissions.VIEW_ALL_PROFILES,
    Permissions.VIEW_PROFILE
  ],
  
  'Platform Manager': [
    Permissions.CREATE_CATEGORY,
    Permissions.UPDATE_CATEGORY,
    Permissions.DELETE_CATEGORY,
    Permissions.VIEW_ALL_CATEGORIES,
    Permissions.VIEW_CATEGORY
  ],
  
  'CSR Rep': [
    Permissions.VIEW_ALL_REQUESTS,
    Permissions.SAVE_REQUEST,
    Permissions.UNSAVE_REQUEST,
    Permissions.SHORTLIST_REQUEST,
    Permissions.UNSHORTLIST_REQUEST,
    Permissions.VIEW_SAVED_REQUESTS,
    Permissions.VIEW_SHORTLISTED_REQUESTS,
    Permissions.UPDATE_REQUEST_STATUS
  ],
  
  'PIN': [
    Permissions.CREATE_OWN_REQUEST,
    Permissions.UPDATE_OWN_REQUEST,
    Permissions.DELETE_OWN_REQUEST,
    Permissions.VIEW_OWN_REQUESTS,
    Permissions.VIEW_STATISTICS
  ]
};