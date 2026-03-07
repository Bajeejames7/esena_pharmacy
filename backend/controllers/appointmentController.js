const db = require("../config/db");
const transporter = require("../config/mail");
const generateToken = require("../utils/tokenGenerator");

exports.createAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, date, message } = req.body;
    const token = generateToken();
    
    const [result] = await db.query(
      "INSERT INTO appointments (name, email, phone, service, date, message, token) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, service, date, message, token]
    );
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Appointment Confirmation - Esena Pharmacy",
      html: `<h2>Appointment Confirmed</h2>
             <p>Service: ${service}</p>
             <p>Date: ${date}</p>
             <p>Token: ${token}</p>`
    });
    
    res.status(201).json({ id: result.insertId, token, message: "Appointment booked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query("SELECT * FROM appointments ORDER BY date DESC");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    await db.query("UPDATE appointments SET status = ? WHERE id = ?", [status, req.params.id]);
    
    res.json({ message: "Appointment status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
