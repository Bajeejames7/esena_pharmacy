const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.header("Authorization");
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  // Validate Authorization header format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid authorization header format" });
  }
  
  // Extract token
  const token = authHeader.substring(7);
  
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info to request object
    req.user = decoded;
    
    // Allow request to proceed
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token signature" });
    } else {
      return res.status(401).json({ message: "Token verification failed" });
    }
  }
};

module.exports = auth;
