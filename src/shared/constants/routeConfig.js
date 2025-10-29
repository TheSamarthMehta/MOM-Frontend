/**
 * Route Configuration
 * Centralized route paths and page titles mapping
 */

export const ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MASTER_CONFIGURE: '/master_configure',
  MEETINGS_MANAGER: '/meetings_manager',
  ATTENDANCE: '/attendance',
  DOCUMENTS_MANAGER: '/documents_manager',
  REPORT: '/report',
  LOGIN: '/login',
  SIGNUP: '/signup',
};

export const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.MASTER_CONFIGURE]: 'Master Configuration',
  [ROUTES.MEETINGS_MANAGER]: 'Meetings Management',
  [ROUTES.ATTENDANCE]: 'Attendance & Participants',
  [ROUTES.DOCUMENTS_MANAGER]: 'Documents Management',
  [ROUTES.REPORT]: 'Reports & Analytics',
};

/**
 * Get page title for a given route path
 * @param {string} pathname - The current route path
 * @returns {string} The page title or empty string if not found
 */
export const getPageTitle = (pathname) => {
  return PAGE_TITLES[pathname] || '';
};
