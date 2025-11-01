/**
 * Notification Utilities
 * Provides user-friendly notifications instead of browser alerts
 */

/**
 * Show a notification to the user
 * This is a simple implementation - can be replaced with toast library (react-hot-toast, react-toastify, etc.)
 */
export const showNotification = (message, type = 'info') => {
  // For now, use a simple approach that doesn't require additional dependencies
  // In production, replace with a proper toast notification library
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

export const showError = (message) => showNotification(message, 'error');
export const showSuccess = (message) => showNotification(message, 'success');
export const showWarning = (message) => showNotification(message, 'warning');
export const showInfo = (message) => showNotification(message, 'info');

/**
 * Enhanced alert replacement
 * Uses notification system instead of browser alert
 */
export const notify = {
  error: showError,
  success: showSuccess,
  warning: showWarning,
  info: showInfo,
};

