import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Ivo Bot Service - AI-powered pharmacy assistant
 * Uses Google Gemini API for intelligent responses
 */
class IvoBotService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.conversationHistory = [];
    this.isInitialized = false;
    this.systemPrompt = this.getSystemPrompt();
    this.loadConversationHistory();
  }

  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('ivo_conversation_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only load recent conversations (last 24 hours)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.conversationHistory = parsed.filter(msg => 
          new Date(msg.timestamp).getTime() > oneDayAgo
        );
      }
    } catch (error) {
      console.warn('Failed to load conversation history:', error);
      this.conversationHistory = [];
    }
  }

  saveConversationHistory() {
    try {
      localStorage.setItem('ivo_conversation_history', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.warn('Failed to save conversation history:', error);
    }
  }

  getSystemPrompt() {
    return `You are Ivo, the friendly virtual assistant for Esena Pharmacy, Kenya's leading online pharmacy. Your role is to help customers navigate the website, answer questions about products and services, and provide helpful health information.

PHARMACY INFORMATION:
- Name: Esena Pharmacy
- Tagline: "Trusted Care, Every day"
- Licensed by Pharmacy & Poisons Board (PPB) - License No: PPB/PH/01/2024/001
- 5+ years serving Kenya
- Location: Outering Road Behind Eastmart Supermarket, Ruaraka, Nairobi
- Phone: 0768103599
- Email: esenapharmacy@gmail.com
- Hours: Mon-Fri 8AM-8PM, Sat 9AM-6PM, Sun 10AM-4PM

SERVICES OFFERED:
1. Online Medicine Orders - Browse 500+ products, search by category
2. Prescription Upload - Upload prescription, get quote within 2 hours
3. Pharmacist Consultation - Professional medication advice and health consultations
4. Appointment Booking - Dermatology, lab tests, vaccinations, health screening
5. Nationwide Delivery - Same day in Nairobi (KSh 200), 1-3 days other areas (KSh 350), Free delivery over KSh 3,000
6. WhatsApp Ordering - Send prescription photos for quick quotes

PRODUCT CATEGORIES:
- Pain Relief, Cough & Flu, Vitamins & Supplements, Skin Care
- Baby Care, Women's Health, Diabetes, Digestive Health

WEBSITE NAVIGATION:
- Home (/) - About (/about), Blog (/blog), Contact (/contact)
- Products (/products) - All Products, Supplements (/supplements), Personal Care (/personal-care)
- Services - Upload Prescription (/upload-prescription), Book Appointment (/book-appointment), Track Order (/track-order)
- Shop (/shop) - Shopping cart and checkout

PERSONALITY & TONE:
- Friendly, professional, and empathetic
- Clear and concise responses
- Emphasize safety, licensing, and professional standards
- Use warm, welcoming language
- Be helpful and solution-oriented

IMPORTANT LIMITATIONS:
- Cannot provide specific medical diagnoses
- Cannot recommend prescriptions without pharmacist consultation
- For urgent medical concerns, direct to call 0768103599 or seek emergency care
- For complex medical questions, recommend speaking with licensed pharmacist

RESPONSE GUIDELINES:
- Keep responses concise but helpful (max 3-4 sentences usually)
- Provide specific navigation instructions when needed
- Include relevant contact information when appropriate
- Always emphasize professional, licensed service
- Use emojis sparingly and appropriately
- If asked about prices, mention they may vary and to check the website or call for current pricing

COMMON SCENARIOS:
- Product searches: Guide to /products page, mention categories
- Prescription help: Direct to /upload-prescription, explain 2-hour review process
- Appointments: Direct to /book-appointment, mention available services
- Delivery questions: Explain costs and areas, mention free delivery threshold
- Contact info: Provide phone, email, address, and hours
- Health questions: Provide general info but recommend pharmacist consultation

Remember: You represent a trusted, licensed pharmacy committed to quality healthcare and customer service.`;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Test the API connection with a simple prompt
      const testResult = await this.model.generateContent("Hello, respond with just 'Ready'");
      const testResponse = testResult.response.text();
      
      if (testResponse) {
        this.isInitialized = true;
        console.log('Ivo Bot initialized successfully');
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Failed to initialize Ivo Bot:', error);
      throw new Error('Bot service unavailable - please try again later');
    }
  }

  async sendMessage(userMessage) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Add user message to history
      const userMessageObj = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      
      this.conversationHistory.push(userMessageObj);

      // Prepare conversation context (last 8 messages for better context)
      const recentHistory = this.conversationHistory.slice(-8);
      const conversationContext = recentHistory
        .map(msg => `${msg.role === 'user' ? 'Customer' : 'Ivo'}: ${msg.content}`)
        .join('\n');

      // Create the full prompt
      const fullPrompt = `${this.systemPrompt}

RECENT CONVERSATION:
${conversationContext}

Please respond as Ivo, the Esena Pharmacy assistant. Keep your response helpful, concise (2-3 sentences), and professional. If the customer asks about specific products or medical advice, guide them appropriately while emphasizing our professional services.`;

      // Generate response with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const result = await this.model.generateContent(fullPrompt);
      clearTimeout(timeoutId);
      
      const response = result.response;
      let botMessage = response.text();

      // Clean up the response
      botMessage = botMessage.trim();
      
      // Remove any unwanted prefixes
      botMessage = botMessage.replace(/^(Ivo:|Assistant:|Bot:)\s*/i, '');

      // Add bot response to history
      const botMessageObj = {
        role: 'assistant',
        content: botMessage,
        timestamp: new Date().toISOString()
      };
      
      this.conversationHistory.push(botMessageObj);

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-15);
      }

      // Save to localStorage
      this.saveConversationHistory();

      return {
        success: true,
        message: botMessage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating bot response:', error);
      
      // Provide contextual fallback based on the error
      let fallbackResponse;
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        fallbackResponse = "I'm experiencing high demand right now. Please try again in a moment, or call us directly at 0768103599 for immediate assistance.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        fallbackResponse = "I'm having connection issues. Please check your internet connection or call us at 0768103599 for help.";
      } else {
        fallbackResponse = this.getFallbackResponse(userMessage);
      }
      
      return {
        success: false,
        message: fallbackResponse,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm Ivo, your Esena Pharmacy assistant. I'm currently experiencing some technical difficulties, but I'm here to help! You can browse our products, upload prescriptions, or call us at 0768103599 for immediate assistance. 😊";
    }
    
    if (message.includes('product') || message.includes('medicine') || message.includes('medication')) {
      return "You can browse our 500+ products on the Products page. We have categories like Pain Relief, Supplements, Personal Care, and more. For specific medication questions, please call our pharmacist at 0768103599.";
    }
    
    if (message.includes('prescription')) {
      return "You can upload your prescription on our Upload Prescription page. Our licensed pharmacist will review it within 2 hours and provide a quote. For immediate assistance, call 0768103599.";
    }
    
    if (message.includes('delivery') || message.includes('shipping')) {
      return "We deliver nationwide! Same-day delivery in Nairobi (KSh 200), 1-3 days for other areas (KSh 350). Free delivery on orders over KSh 3,000. Track your order on our Track Order page.";
    }
    
    if (message.includes('appointment') || message.includes('consultation')) {
      return "Book appointments for pharmacist consultations, lab tests, vaccinations, and health screenings on our Book Appointment page. Available Monday-Saturday. Call 0768103599 for urgent needs.";
    }
    
    if (message.includes('contact') || message.includes('phone') || message.includes('call')) {
      return "Contact us at 0768103599 or email esenapharmacy@gmail.com. Visit our Ruaraka branch at Outering Road Behind Eastmart Supermarket. Hours: Mon-Fri 8AM-8PM, Sat 9AM-6PM, Sun 10AM-4PM.";
    }

    if (message.includes('hours') || message.includes('time') || message.includes('open')) {
      return "We're open Monday-Friday 8AM-8PM, Saturday 9AM-6PM, and Sunday 10AM-4PM. You can order online 24/7! Call 0768103599 during business hours.";
    }

    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return "Prices vary by product. Please browse our Products page or call 0768103599 for current pricing. We offer competitive rates and free delivery on orders over KSh 3,000.";
    }
    
    return "I'm experiencing some technical difficulties right now, but I'm here to help! For immediate assistance, please call us at 0768103599 or visit our website sections: Products, Upload Prescription, Book Appointment, or Contact Us. Our licensed pharmacists are ready to help with your healthcare needs. 💊";
  }

  clearHistory() {
    this.conversationHistory = [];
    try {
      localStorage.removeItem('ivo_conversation_history');
    } catch (error) {
      console.warn('Failed to clear conversation history:', error);
    }
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  // Get conversation statistics
  getStats() {
    return {
      totalMessages: this.conversationHistory.length,
      userMessages: this.conversationHistory.filter(msg => msg.role === 'user').length,
      botMessages: this.conversationHistory.filter(msg => msg.role === 'assistant').length,
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
export const ivoBotService = new IvoBotService();
export default ivoBotService;