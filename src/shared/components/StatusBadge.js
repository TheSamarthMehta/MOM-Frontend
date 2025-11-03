import React from 'react';
import { STATUS_COLORS, ROLE_COLORS } from '../constants/enums';

export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.Scheduled;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badge} ${className}`}>
      {status}
    </span>
  );
};

export const RoleBadge = ({ role, className = '' }) => {
  const roleConfig = ROLE_COLORS[role] || ROLE_COLORS.Staff;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.bg} ${roleConfig.text} ${className}`}>
      {role}
    </span>
  );
};

export default StatusBadge;

