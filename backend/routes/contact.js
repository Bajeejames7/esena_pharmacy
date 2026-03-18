const express = require("express");
const router = express.Router();
const { createContact } = require("../controllers/contactController");
const { recaptchaMiddleware } = require("../utils/recaptcha");

// reCAPTCHA is optional for contact — skip middleware if no token provided
router.post("/", (req, res, next) => {
  if (req.body.recaptchaToken) {
    return recaptchaMiddleware('contact_form', 0.5)(req, res, next);
  }
  next();
}, createContact);

module.exports = router;
