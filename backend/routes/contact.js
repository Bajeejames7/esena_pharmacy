const express = require("express");
const router = express.Router();
const { createContact } = require("../controllers/contactController");
const { recaptchaMiddleware } = require("../utils/recaptcha");

// Apply reCAPTCHA middleware and then the controller
router.post("/", recaptchaMiddleware('contact_form', 0.5), createContact);

module.exports = router;
