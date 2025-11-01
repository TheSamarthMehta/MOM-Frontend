import { useState, useCallback } from 'react';

/**
 * Custom hook for form management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler function
 * @param {Object} validation - Validation schema (optional)
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, onSubmit = null, validation = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur if validation is provided
    if (validation && validation[field]) {
      const error = validation[field](values[field], values);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  }, [values, validation]);

  const setValue = useCallback((field, value) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldValue = useCallback((field, value) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const validate = useCallback(() => {
    if (!validation) return true;

    const newErrors = {};
    Object.keys(validation).forEach(field => {
      const error = validation[field](values[field], values);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validation).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return Object.keys(newErrors).length === 0;
  }, [values, validation]);

  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Submission failed';
      setErrors(prev => ({ ...prev, _submit: errorMessage }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const resetField = useCallback((field) => {
    setValues(prev => ({ ...prev, [field]: initialValues[field] }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setTouched(prev => {
      const newTouched = { ...prev };
      delete newTouched[field];
      return newTouched;
    });
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setFieldValue,
    setFieldError,
    reset,
    resetField,
    validate,
  };
};

