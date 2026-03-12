import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

/**
 * Custom hook for Google reCAPTCHA v3 integration
 * Provides easy-to-use reCAPTCHA verification for forms
 */
export const useRecaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyRecaptcha = useCallback(async (action = 'submit') => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not available');
      return null;
    }

    try {
      const token = await executeRecaptcha(action);
      return token;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return null;
    }
  }, [executeRecaptcha]);

  return { verifyRecaptcha };
};