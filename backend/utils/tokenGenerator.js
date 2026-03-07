const crypto = require("crypto");
const db = require("../config/db");

/**
 * Generate a unique 50-character alphanumeric token
 * Implements Requirements 13.1-13.10
 * 
 * @returns {Promise<string>} A unique 50-character alphanumeric token
 * @throws {Error} If unable to generate unique token after 10 attempts
 */
async function generateUniqueToken() {
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random bytes and create token
    let token = "";
    
    // Keep generating until we have at least 50 alphanumeric characters
    while (token.length < 50) {
      // Generate 32 random bytes using cryptographic random number generator (Req 13.1)
      const randomBytes = crypto.randomBytes(32);
      
      // Encode to base64 format (Req 13.2)
      const encoded = randomBytes.toString("base64");
      
      // Remove special characters (Req 13.3)
      const alphanumeric = encoded.replace(/[^A-Za-z0-9]/g, "");
      
      token += alphanumeric;
    }
    
    // Truncate to exactly 50 characters (Req 13.4)
    token = token.substring(0, 50);
    
    // Verify token does not exist in orders table (Req 13.5)
    const [ordersResult] = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE token = ?",
      [token]
    );
    
    // Verify token does not exist in appointments table (Req 13.6)
    const [appointmentsResult] = await db.query(
      "SELECT COUNT(*) as count FROM appointments WHERE token = ?",
      [token]
    );
    
    // If token is unique in both tables, return it
    if (ordersResult[0].count === 0 && appointmentsResult[0].count === 0) {
      // Token is exactly 50 characters (Req 13.9)
      // Token contains only alphanumeric characters (Req 13.10)
      return token;
    }
    
    // If token exists, retry (Req 13.7)
  }
  
  // If all 10 attempts fail, throw error (Req 13.8)
  throw new Error("Failed to generate unique token after 10 attempts");
}

module.exports = { generateUniqueToken };
