import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for modal state management
 * @param {Object} options - Modal options
 * @param {Function} [options.onOpen] - Callback when modal opens
 * @param {Function} [options.onClose] - Callback when modal closes
 * @param {number} [options.clearDelay=300] - Delay before clearing data (ms)
 * @returns {Object} Modal state and handlers
 */
export const useModal = (options = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
    if (options.onOpen) {
      options.onOpen(modalData);
    }
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (options.onClose) {
      options.onClose();
    }
    // Clear data after a short delay to allow animations
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setData(null);
    }, options.clearDelay || 300);
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
};

