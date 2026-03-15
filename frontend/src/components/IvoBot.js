import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import useIvoBot from '../hooks/useIvoBot';

/**
 * Ivo Bot Chat Component
 * AI-powered pharmacy assistant chat interface
 */
const IvoBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Use the custom hook
  const { sendMessage, clearHistory, isLoading } = useIvoBot();

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: "Hello! I'm Ivo, your Esena Pharmacy assistant. How can I help you today? 😊\n\nI can help you with:\n• Finding products and medicines\n• Uploading prescriptions\n• Booking appointments\n• Delivery information\n• General health questions",
        timestamp: new Date().toISOString(),
        showQuickActions: true
      }]);
    }
  }, [messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleQuickAction = (action) => {
    const quickActions = {
      products: "What products do you have available?",
      prescription: "How do I upload my prescription?",
      appointment: "How can I book an appointment?",
      delivery: "What are your delivery options and costs?",
      contact: "What are your contact details and business hours?"
    };

    const message = quickActions[action];
    if (message) {
      setInputMessage(message);
      // Auto-send the message
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const userMessageObj = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    // Add user message
    setMessages(prev => [...prev, userMessageObj]);
    setInputMessage('');

    try {
      // Get bot response using the hook
      const response = await sendMessage(userMessage);
      
      const botMessageObj = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: response.timestamp,
        error: !response.success
      };

      setMessages(prev => [...prev, botMessageObj]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessageObj = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now. Please try again or call us at 0768103599 for immediate assistance.",
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessageObj]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      content: "Chat cleared! How can I help you today? 😊\n\nI can help you with:\n• Finding products and medicines\n• Uploading prescriptions\n• Booking appointments\n• Delivery information\n• General health questions",
      timestamp: new Date().toISOString(),
      showQuickActions: true
    }]);
    clearHistory();
  };

  const formatMessage = (content) => {
    // Convert line breaks to JSX
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed right-6 bottom-44 z-50">
        <button
          onClick={handleToggleChat}
          className="group relative"
          aria-label="Chat with Ivo Bot"
          title="Chat with Ivo - AI Assistant"
        >
          <GlassCard className="p-4 hover:scale-110 transition-all duration-300 shadow-lg" blur="md">
            <div className="flex items-center justify-center">
              {isOpen ? (
                <svg 
                  className="w-7 h-7 text-gray-600 dark:text-gray-300 group-hover:text-glass-blue dark:group-hover:text-blue-400 transition-colors duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Bot face with animated elements */}
                  <div className="relative w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center shadow-inner">
                    {/* Eyes */}
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    {/* Mouth */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Chat bubble indicator */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce">
                    <div className="absolute inset-0.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* "AI" badge */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg">
                    AI
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
          
          {/* Enhanced Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              <div className="font-semibold">💬 Chat with Ivo</div>
              <div className="text-xs opacity-75">AI Pharmacy Assistant</div>
              {/* Arrow */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-800 dark:border-l-gray-700"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed right-4 bottom-60 z-50 w-80 h-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-12rem)]">
          <GlassCard className="h-full flex flex-col" blur="lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-600/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center p-1">
                  <img 
                    src="/ivo-bot-icon.svg" 
                    alt="Ivo Bot" 
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Ivo</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Pharmacy Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearChat}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Clear chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={handleToggleChat}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-glass-blue text-white'
                        : message.error
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-800 dark:text-gray-200 border border-white/30 dark:border-gray-600/30'
                    }`}
                  >
                    {formatMessage(message.content)}
                    
                    {/* Quick Action Buttons */}
                    {message.showQuickActions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleQuickAction('products')}
                          className="px-3 py-1 text-xs bg-glass-blue/20 hover:bg-glass-blue/30 text-glass-blue dark:text-blue-300 rounded-full transition-colors"
                        >
                          🛒 Products
                        </button>
                        <button
                          onClick={() => handleQuickAction('prescription')}
                          className="px-3 py-1 text-xs bg-glass-blue/20 hover:bg-glass-blue/30 text-glass-blue dark:text-blue-300 rounded-full transition-colors"
                        >
                          📋 Prescription
                        </button>
                        <button
                          onClick={() => handleQuickAction('appointment')}
                          className="px-3 py-1 text-xs bg-glass-blue/20 hover:bg-glass-blue/30 text-glass-blue dark:text-blue-300 rounded-full transition-colors"
                        >
                          📅 Appointment
                        </button>
                        <button
                          onClick={() => handleQuickAction('delivery')}
                          className="px-3 py-1 text-xs bg-glass-blue/20 hover:bg-glass-blue/30 text-glass-blue dark:text-blue-300 rounded-full transition-colors"
                        >
                          🚚 Delivery
                        </button>
                        <button
                          onClick={() => handleQuickAction('contact')}
                          className="px-3 py-1 text-xs bg-glass-blue/20 hover:bg-glass-blue/30 text-glass-blue dark:text-blue-300 rounded-full transition-colors"
                        >
                          📞 Contact
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/70 dark:bg-gray-800/70 text-gray-800 dark:text-gray-200 border border-white/30 dark:border-gray-600/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">Ivo is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20 dark:border-gray-600/30">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about medicines, appointments, or health..."
                  className="flex-1 px-3 py-2 bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-glass-blue/50 text-gray-800 dark:text-gray-200 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-3 py-2 bg-glass-blue text-white rounded-lg hover:bg-glass-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
};

export default IvoBot;