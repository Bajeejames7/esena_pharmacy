import {
  validateEmail,
  validatePhone,
  validateFutureDate,
  validateRequired,
  validateLength,
  validateOrderForm,
  validateAppointmentForm,
  validateContactForm,
  validateField
} from './validation';

/**
 * Property tests for form validation
 * Implements Requirements 15.1, 15.2, 15.3, 15.4
 * Property 8: Form Validation Completeness
 */

describe('Form Validation Property Tests', () => {
  /**
   * Property 8: Form Validation Completeness
   * Validates: Requirements 15.1, 15.2, 15.3, 15.4
   * Test that validation is consistent for same input
   */
  test('Property 8: Validation consistency for same input', () => {
    const testInputs = [
      { field: 'email', value: 'test@example.com', shouldBeValid: true },
      { field: 'email', value: 'invalid-email', shouldBeValid: false },
      { field: 'email', value: '', shouldBeValid: false },
      { field: 'phone', value: '+1234567890', shouldBeValid: true },
      { field: 'phone', value: '123-456-7890', shouldBeValid: true },
      { field: 'phone', value: '123', shouldBeValid: false },
      { field: 'name', value: 'John Doe', shouldBeValid: true },
      { field: 'name', value: 'A', shouldBeValid: false },
      { field: 'name', value: '', shouldBeValid: false }
    ];

    testInputs.forEach(({ field, value, shouldBeValid }) => {
      // Run validation multiple times to ensure consistency
      const results = Array.from({ length: 5 }, () => validateField(field, value));
      
      // All results should be identical
      results.forEach((result, index) => {
        expect(result.isValid).toBe(shouldBeValid);
        if (index > 0) {
          expect(result.isValid).toBe(results[0].isValid);
          expect(result.error).toBe(results[0].error);
        }
      });
    });
  });

  test('Email validation covers all requirements', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user123@test-domain.com'
    ];

    const invalidEmails = [
      '',
      'invalid-email',
      '@example.com',
      'test@',
      'test.example.com',
      'test@.com',
      'test@com',
      'a'.repeat(250) + '@example.com' // Too long
    ];

    validEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    invalidEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  test('Phone validation handles various formats', () => {
    const validPhones = [
      '+1234567890',
      '1234567890',
      '+44 20 7946 0958',
      '(555) 123-4567',
      '555.123.4567',
      '555-123-4567'
    ];

    const invalidPhones = [
      '',
      '123',
      'abc123def',
      '+',
      '123456789012345678', // Too long
      '12345' // Too short
    ];

    validPhones.forEach(phone => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    invalidPhones.forEach(phone => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  test('Future date validation works correctly', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const twoYears = new Date(today);
    twoYears.setFullYear(twoYears.getFullYear() + 2);

    // Valid future dates
    expect(validateFutureDate(tomorrow.toISOString().split('T')[0]).isValid).toBe(true);
    expect(validateFutureDate(nextYear.toISOString().split('T')[0]).isValid).toBe(true);

    // Invalid dates
    expect(validateFutureDate('').isValid).toBe(false);
    expect(validateFutureDate(yesterday.toISOString().split('T')[0]).isValid).toBe(false);
    expect(validateFutureDate('invalid-date').isValid).toBe(false);
    expect(validateFutureDate(twoYears.toISOString().split('T')[0]).isValid).toBe(false);
  });

  test('Required field validation', () => {
    const validValues = ['test', 'a', '123', 'valid input'];
    const invalidValues = ['', '   ', null, undefined];

    validValues.forEach(value => {
      const result = validateRequired(value, 'Test Field');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    invalidValues.forEach(value => {
      const result = validateRequired(value, 'Test Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Test Field is required');
    });
  });

  test('Length validation with various constraints', () => {
    const testCases = [
      { value: 'test', min: 2, max: 10, shouldBeValid: true },
      { value: 'a', min: 2, max: 10, shouldBeValid: false }, // Too short
      { value: 'this is too long', min: 2, max: 10, shouldBeValid: false }, // Too long
      { value: 'perfect', min: 5, max: 10, shouldBeValid: true },
      { value: '', min: 0, max: 10, shouldBeValid: false } // Empty
    ];

    testCases.forEach(({ value, min, max, shouldBeValid }) => {
      const result = validateLength(value, min, max, 'Test Field');
      expect(result.isValid).toBe(shouldBeValid);
    });
  });

  test('Order form validation completeness', () => {
    const validOrderForm = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main Street, Apt 4B',
      city: 'New York'
    };

    const invalidOrderForm = {
      name: '',
      email: 'invalid-email',
      phone: '123',
      address: '',
      city: ''
    };

    const validResult = validateOrderForm(validOrderForm);
    expect(validResult.isValid).toBe(true);
    expect(Object.keys(validResult.errors)).toHaveLength(0);

    const invalidResult = validateOrderForm(invalidOrderForm);
    expect(invalidResult.isValid).toBe(false);
    expect(Object.keys(invalidResult.errors).length).toBeGreaterThan(0);
    expect(invalidResult.errors.name).toBeTruthy();
    expect(invalidResult.errors.email).toBeTruthy();
    expect(invalidResult.errors.phone).toBeTruthy();
    expect(invalidResult.errors.address).toBeTruthy();
    expect(invalidResult.errors.city).toBeTruthy();
  });

  test('Appointment form validation completeness', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const validAppointmentForm = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567890',
      service: 'dermatology',
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      message: 'Optional message'
    };

    const invalidAppointmentForm = {
      name: '',
      email: 'invalid-email',
      phone: '123',
      service: '',
      date: '2020-01-01', // Past date
      time: '',
      message: 'a'.repeat(600) // Too long
    };

    const validResult = validateAppointmentForm(validAppointmentForm);
    expect(validResult.isValid).toBe(true);
    expect(Object.keys(validResult.errors)).toHaveLength(0);

    const invalidResult = validateAppointmentForm(invalidAppointmentForm);
    expect(invalidResult.isValid).toBe(false);
    expect(Object.keys(invalidResult.errors).length).toBeGreaterThan(0);
  });

  test('Contact form validation completeness', () => {
    const validContactForm = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1234567890', // Optional
      subject: 'Question about products',
      message: 'I have a question about your vitamin supplements.'
    };

    const invalidContactForm = {
      name: 'A', // Too short
      email: 'invalid-email',
      phone: '123', // Invalid format
      subject: 'Hi', // Too short
      message: 'Short' // Too short
    };

    const validResult = validateContactForm(validContactForm);
    expect(validResult.isValid).toBe(true);
    expect(Object.keys(validResult.errors)).toHaveLength(0);

    const invalidResult = validateContactForm(invalidContactForm);
    expect(invalidResult.isValid).toBe(false);
    expect(Object.keys(invalidResult.errors).length).toBeGreaterThan(0);
  });

  test('Edge cases and boundary values', () => {
    // Test boundary values for length validation
    expect(validateLength('ab', 2, 10).isValid).toBe(true); // Minimum length
    expect(validateLength('abcdefghij', 2, 10).isValid).toBe(true); // Maximum length
    expect(validateLength('a', 2, 10).isValid).toBe(false); // Below minimum
    expect(validateLength('abcdefghijk', 2, 10).isValid).toBe(false); // Above maximum

    // Test email edge cases
    expect(validateEmail('a@b.co').isValid).toBe(true); // Minimum valid email
    expect(validateEmail('test@sub.domain.com').isValid).toBe(true); // Subdomain

    // Test phone edge cases
    expect(validatePhone('1234567890').isValid).toBe(true); // Minimum length
    expect(validatePhone('123456789012345').isValid).toBe(true); // Maximum length
  });
});