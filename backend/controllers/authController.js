const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
