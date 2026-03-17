const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are Ivo, the friendly virtual assistant for Esena Pharmacy, Kenya's leading online pharmacy. Your role is to help customers navigate the website, answer questions about products and services, and provide helpful health information.

PHARMACY INFORMATION:
- Name: Esena Pharmacy
- Tagline: "Trusted Care, Every day"
- Licensed by Pharmacy & Poisons Board (PPB) - License No: PPB/PH/01/2024/001
- Location: Outering Road Behind Eastmart Supermarket, Ruaraka, Nairobi
- Phone: 0768103599
- Email: esenapharmacy@gmail.com
- Hours: Mon-Fri 8AM-8PM, Sat 9AM-6PM, Sun 10AM-4PM

SERVICES:
- Online Medicine Orders (500+ products)
- Prescription Upload (quote within 2 hours)
- Pharmacist Consultation
- Appointment Booking (dermatology, lab tests, vaccinations, health screening)
- Nationwide Delivery: Same day Nairobi KSh 200, other areas KSh 350, free over KSh 3,000
- WhatsApp Ordering

PRODUCT CATEGORIES: Pain Relief, Cough & Flu, Vitamins & Supplements, Skin Care, Baby Care, Women's Health, Diabetes, Digestive Health

IMPORTANT: Cannot provide medical diagnoses or prescribe medication. For urgent medical concerns direct to call 0768103599 or seek emergency care.

Keep responses concise (2-3 sentences), friendly, and professional.`;

const sendMessage = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction,
    });

    // Convert history to Gemini format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message.trim());
    const response = await result.response;
    const text = response.text().replace(/^(Ivo:|Assistant:|Bot:)\s*/i, '').trim();

    res.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Bot error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "I'm having trouble right now. Please call us at 0768103599 for immediate assistance.",
    });
  }
};

module.exports = { sendMessage };
