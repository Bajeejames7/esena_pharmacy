const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Safe Auth Controller - No Logger Dependencies
 * Use this temporarily to test if logger is causing the issue
 */

exports.login = async (req, res) => {
  try {
    console.log('Login attempt started');
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        error: "Missing credentials",
        message: "Username and password are required" 
      });
    }
    
    console.log('Querying database for user:', username);
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    
    if (users.length === 0) {
      console.log('User not found:', username);
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "Invalid username or password" 
      });
    }
    
    const user = users[0];
    console.log('User found, checking password');
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "Invalid username or password" 
      });
    }
    
    console.log('Password verified, generating token');
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    console.log('Login successful for user:', username);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      error: "Authentication error",
      message: "Unable to process login request. Please try again.",
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};