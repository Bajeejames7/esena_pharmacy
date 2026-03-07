const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

const auth = (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.header("Authorization");
  
  // Check if Authorization header exists
  if (!authHeader) {
    logger.security('MISSING_AUTH_HEADER', {
      path: req.path,
      method: req.method
    }, req);
    return res.status(401).json({ 
      error: "Authentication required",
      message: "No authorization token provided" 
    });
  }
  
  // Validate Authorization header format
  if (!authHeader.startsWith("Bearer ")) {
    logger.security('INVALID_AUTH_HEADER_FORMAT', {
      authHeader: authHeader.substring(0, 20) + '...',
      path: req.path,
      method: req.method
    }, req);
    return res.status(401).json({ 
      error: "Authentication failed",
      message: "Invalid authorization header format" 
    });
  }
  
  // Extract token
  const token = authHeader.substring(7);
  
  if (!token || token.trim() === '') {
    logger.security('EMPTY_AUTH_TOKEN', {
      path: req.path,
      method: req.method
    }, req);
    return res.status(401).json({ 
      error: "Authentication required",
      message: "No authorization token provided" 
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info to request object
    req.user = decoded;
    
    // Log successful authentication
    logger.debug('Token verified successfully', {
      userId: decoded.userId,
      role: decoded.role,
      path: req.path,
      method: req.method
    });
    
    // Allow request to proceed
    next();
  } catch (error) {
    // Log authentication failure with details
    logger.security('TOKEN_VERIFICATION_FAILED', {
      error: error.name,
      message: error.message,
      path: req.path,
      method: req.method,
      tokenPreview: token.substring(0, 20) + '...'
    }, req);
    
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token expired",
        message: "Your session has expired. Please log in again." 
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token",
        message: "Authentication token is invalid" 
      });
    } else {
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "Token verification failed" 
      });
    }
  }
};

module.exports = auth;
