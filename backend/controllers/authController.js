const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { logger } = require("../utils/logger");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      logger.security('LOGIN_ATTEMPT_MISSING_CREDENTIALS', { username }, req);
      return res.status(400).json({ 
        error: "Missing credentials",
        message: "Username and password are required" 
      });
    }
    
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    
    if (users.length === 0) {
      logger.authFailure('USER_NOT_FOUND', { username }, req);
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "Invalid username or password" 
      });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.authFailure('INVALID_PASSWORD', { 
        username, 
        userId: user.id 
      }, req);
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "Invalid username or password" 
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    // Log successful authentication
    logger.audit('USER_LOGIN_SUCCESS', {
      userId: user.id,
      username: user.username,
      role: user.role
    }, req);
    
    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username,
      role: user.role,
      ip: req.ip
    });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    logger.error('Login error occurred', error, {
      username: req.body.username,
      ip: req.ip
    });
    
    res.status(500).json({ 
      error: "Authentication error",
      message: "Unable to process login request. Please try again." 
    });
  }
};
