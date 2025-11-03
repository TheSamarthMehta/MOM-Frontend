export const MEETING_STATUS = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  CONVENER: 'Convener',
  STAFF: 'Staff',
};

export const STATUS_COLORS = {
  [MEETING_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-success-100 text-success-800',
  },
  [MEETING_STATUS.SCHEDULED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    badge: 'bg-primary-100 text-primary-800',
  },
  [MEETING_STATUS.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-danger-100 text-danger-800',
  },
  [MEETING_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    badge: 'bg-warning-100 text-warning-800',
  },
};

export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
  [USER_ROLES.CONVENER]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  [USER_ROLES.STAFF]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
};

export const MEETING_STATUS_LIST = Object.values(MEETING_STATUS);
export const USER_ROLES_LIST = Object.values(USER_ROLES);

