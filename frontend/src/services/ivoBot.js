const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class IvoBotService {
  constructor() {
    this.conversationHistory = [];
    this.loadConversationHistory();
  }

  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('ivo_conversation_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.conversationHistory = parsed.filter(
          msg => new Date(msg.timestamp).getTime() > oneDayAgo
        );
      }
    } catch {
      this.conversationHistory = [];
    }
  }

  saveConversationHistory() {
    try {
      localStorage.setItem('ivo_conversation_history', JSON.stringify(this.conversationHistory));
    } catch {
      // ignore
    }
  }

  async sendMessage(userMessage) {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(`${API_URL}/bot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: this.conversationHistory.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Server error');

      this.conversationHistory.push({
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
      });

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-15);
      }

      this.saveConversationHistory();

      return { success: true, message: data.message, timestamp: data.timestamp };
    } catch (error) {
      console.error('IvoBot error:', error.message);
      return {
        success: false,
        message: "I'm having trouble right now. Please call us at 0768103599 for immediate assistance.",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
    try {
      localStorage.removeItem('ivo_conversation_history');
    } catch {
      // ignore
    }
  }

  getStats() {
    return {
      totalMessages: this.conversationHistory.length,
      userMessages: this.conversationHistory.filter(m => m.role === 'user').length,
      botMessages: this.conversationHistory.filter(m => m.role === 'assistant').length,
    };
  }
}

export const ivoBotService = new IvoBotService();
export default ivoBotService;
