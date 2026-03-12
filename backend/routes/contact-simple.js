const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Simple contact route without middleware
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }
    
    // Insert into database
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
      [name, email, phone, message]
    );
    
    res.status(201).json({ 
      message: "Message sent successfully"
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;