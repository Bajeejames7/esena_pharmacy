/**
 * Form validation utilities
 * Implements Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (supports various formats)
 */
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Validate email format
 * Implements Requirements 15.5
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate phone number format
 * Implements Requirements 15.6
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  if (cleanPhone.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Phone number must be between 10-15 digits' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate date is in the future
 * Implements Requirements 15.7
 */
export const validateFutureDate = (date) => {
  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  if (selectedDate < today) {
    return { isValid: false, error: 'Date must be in the future' };
  }
  
  // Check if date is too far in the future (1 year)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  if (selectedDate > maxDate) {
    return { isValid: false, error: 'Date cannot be more than 1 year in the future' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate required field
 * Implements Requirements 15.1, 15.2
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate string length
 * Implements Requirements 15.3, 15.4
 */
export const validateLength = (value, min = 0, max = Infinity, fieldName = 'Field') => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedValue = value.trim();
  
  if (trimmedValue.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters long` };
  }
  
  if (trimmedValue.length > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max} characters long` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate order form
 * Implements Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */
export const validateOrderForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateRequired(formData.name, 'Full name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  } else {
    const lengthValidation = validateLength(formData.name, 2, 100, 'Full name');
    if (!lengthValidation.isValid) {
      errors.name = lengthValidation.error;
    }
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  
  // Validate address
  const addressValidation = validateRequired(formData.address, 'Address');
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error;
  } else {
    const lengthValidation = validateLength(formData.address, 10, 200, 'Address');
    if (!lengthValidation.isValid) {
      errors.address = lengthValidation.error;
    }
  }
  
  // Validate city
  const cityValidation = validateRequired(formData.city, 'City');
  if (!cityValidation.isValid) {
    errors.city = cityValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate appointment form
 * Implements Requirements 15.1, 15.2, 15.5, 15.6, 15.7
 */
export const validateAppointmentForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateRequired(formData.name, 'Full name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  } else {
    const lengthValidation = validateLength(formData.name, 2, 100, 'Full name');
    if (!lengthValidation.isValid) {
      errors.name = lengthValidation.error;
    }
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  
  // Validate service
  const serviceValidation = validateRequired(formData.service, 'Service');
  if (!serviceValidation.isValid) {
    errors.service = serviceValidation.error;
  }
  
  // Validate date
  const dateValidation = validateFutureDate(formData.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error;
  }
  
  // Validate time
  const timeValidation = validateRequired(formData.time, 'Time');
  if (!timeValidation.isValid) {
    errors.time = timeValidation.error;
  }
  
  // Validate message (optional but if provided, check length)
  if (formData.message && formData.message.trim().length > 0) {
    const messageValidation = validateLength(formData.message, 0, 500, 'Message');
    if (!messageValidation.isValid) {
      errors.message = messageValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate contact form
 * Implements Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */
export const validateContactForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateRequired(formData.name, 'Full name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  } else {
    const lengthValidation = validateLength(formData.name, 2, 100, 'Full name');
    if (!lengthValidation.isValid) {
      errors.name = lengthValidation.error;
    }
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate phone (optional)
  if (formData.phone && formData.phone.trim().length > 0) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  // Validate subject
  const subjectValidation = validateRequired(formData.subject, 'Subject');
  if (!subjectValidation.isValid) {
    errors.subject = subjectValidation.error;
  } else {
    const lengthValidation = validateLength(formData.subject, 5, 100, 'Subject');
    if (!lengthValidation.isValid) {
      errors.subject = lengthValidation.error;
    }
  }
  
  // Validate message
  const messageValidation = validateRequired(formData.message, 'Message');
  if (!messageValidation.isValid) {
    errors.message = messageValidation.error;
  } else {
    const lengthValidation = validateLength(formData.message, 10, 1000, 'Message');
    if (!lengthValidation.isValid) {
      errors.message = lengthValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Real-time validation for form fields
 * Returns validation result immediately
 */
export const validateField = (fieldName, value, formData = {}) => {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'date':
      return validateFutureDate(value);
    case 'name':
      const nameReq = validateRequired(value, 'Name');
      if (!nameReq.isValid) return nameReq;
      return validateLength(value, 2, 100, 'Name');
    case 'subject':
      const subjectReq = validateRequired(value, 'Subject');
      if (!subjectReq.isValid) return subjectReq;
      return validateLength(value, 5, 100, 'Subject');
    case 'message':
      const messageReq = validateRequired(value, 'Message');
      if (!messageReq.isValid) return messageReq;
      return validateLength(value, 10, 1000, 'Message');
    default:
      return validateRequired(value, fieldName);
  }
};