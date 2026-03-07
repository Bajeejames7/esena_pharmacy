const db = require("../config/db");
const transporter = require("../config/mail");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
      [name, email, phone, message]
    );
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Message:</strong> ${message}</p>`
    });
    
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
