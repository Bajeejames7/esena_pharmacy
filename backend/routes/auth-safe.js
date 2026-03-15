const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController-safe");

// Safe auth route without logger dependencies
router.post("/login", login);

module.exports = router;