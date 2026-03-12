const axios = require('axios');

/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} token - reCAPTCHA token from frontend
 * @param {string} action - Action name (optional, for v3)
 * @param {number} minScore - Minimum score for v3 (default: 0.5)
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
const verifyRecaptcha = async (token, action = null, minScore = 0.5) => {
  try {
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      console.warn('reCAPTCHA secret key not configured');
      return { success: true }; // Allow requests when not configured
    }

    if (!token) {
      return { success: false, error: 'reCAPTCHA token is required' };
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const { success, score, action: responseAction, 'error-codes': errorCodes } = response.data;

    if (!success) {
      console.error('reCAPTCHA verification failed:', errorCodes);
      return { 
        success: false, 
        error: 'reCAPTCHA verification failed' 
      };
    }

    // For reCAPTCHA v3, check score
    if (score !== undefined) {
      if (score < minScore) {
        console.warn(`reCAPTCHA score too low: ${score} (minimum: ${minScore})`);
        return { 
          success: false, 
          score,
          error: 'reCAPTCHA score too low' 
        };
      }

      // Optionally verify action matches
      if (action && responseAction !== action) {
        console.warn(`reCAPTCHA action mismatch: expected ${action}, got ${responseAction}`);
      }
    }

    return { success: true, score };

  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return { 
      success: false, 
      error: 'reCAPTCHA verification failed' 
    };
  }
};

/**
 * Express middleware for reCAPTCHA verification
 * @param {string} action - Expected action name (optional)
 * @param {number} minScore - Minimum score for v3 (default: 0.5)
 */
const recaptchaMiddleware = (action = null, minScore = 0.5) => {
  return async (req, res, next) => {
    try {
      const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
      
      const result = await verifyRecaptcha(token, action, minScore);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'reCAPTCHA verification failed'
        });
      }

      // Add score to request for logging/analytics
      req.recaptchaScore = result.score;
      next();

    } catch (error) {
      console.error('reCAPTCHA middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = {
  verifyRecaptcha,
  recaptchaMiddleware
};