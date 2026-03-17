# Ivo Bot Setup & Troubleshooting Guide

## Quick Setup Checklist

### 1. Install Dependencies
```bash
cd frontend
npm install @google/generative-ai
```

### 2. Environment Configuration
Make sure your `frontend/.env` file contains:
```
REACT_APP_GEMINI_API_KEY=AIzaSyAepR39ud1y8XXlduPKf2C7glOCWSTLr58
```

### 3. Restart Development Server
```bash
npm start
```

## Troubleshooting Steps

### Issue: Chatbot not appearing
**Solutions:**
1. Check browser console for errors
2. Verify IvoBot is imported in App.js (✅ Already done)
3. Clear browser cache and reload
4. Check if component is rendering by looking for the bot button

### Issue: Chatbot appears but doesn't respond
**Solutions:**
1. Check API key in .env file
2. Verify internet connection
3. Check browser console for API errors
4. Test with simple message like "hello"

### Issue: API errors or quota exceeded
**Solutions:**
1. Verify API key is correct and active
2. Check Google Cloud Console for quota limits
3. Wait a few minutes if rate limited
4. Try refreshing the page

## Testing the Bot

### 1. Visual Check
- Look for the bot icon in bottom-right corner (above WhatsApp button)
- Icon should have animated eyes and "AI" badge
- Hover should show tooltip "Chat with Ivo - AI Assistant"

### 2. Functionality Check
- Click the bot icon to open chat window
- Chat window should be larger now (28rem width, 36rem height)
- Send a test message like "hello"
- Bot should respond within 10-15 seconds

### 3. Debug Mode
- Open browser developer tools (F12)
- Look for console logs starting with "IvoBot component mounted"
- Check for any error messages in red

## Current Configuration

### Chat Window Size
- **Desktop:** 28rem width × 36rem height (448px × 576px)
- **Mobile:** Responsive with max-width constraints
- **Position:** Fixed bottom-right, above WhatsApp button

### Features Enabled
- ✅ Gemini AI integration
- ✅ Conversation history (24 hours)
- ✅ Quick action buttons
- ✅ Error handling and fallbacks
- ✅ Glassmorphism design
- ✅ Responsive layout
- ✅ Accessibility features

## Debug Commands

### Check if bot is working:
```javascript
// In browser console
console.log('API Key present:', !!process.env.REACT_APP_GEMINI_API_KEY);
```

### Test bot service directly:
```javascript
// In browser console (if available)
import('./services/ivoBot').then(service => {
  service.default.sendMessage('hello').then(console.log);
});
```

## Common Error Messages

### "Bot service unavailable"
- API key missing or invalid
- Network connectivity issues
- Google API service down

### "I'm having trouble connecting"
- Temporary network issue
- API rate limit reached
- Service initialization failed

### "Quota exceeded" 
- Google API daily/monthly limit reached
- Need to wait or upgrade API plan

## File Locations

- **Component:** `frontend/src/components/IvoBot.js`
- **Service:** `frontend/src/services/ivoBot.js`
- **Hook:** `frontend/src/hooks/useIvoBot.js`
- **Environment:** `frontend/.env`
- **App Integration:** `frontend/src/App.js`

## Support

If issues persist:
1. Check all files are saved
2. Restart development server
3. Clear browser cache
4. Check network connectivity
5. Verify API key is active in Google Cloud Console

The bot should now be working with a larger chat window and better error handling!