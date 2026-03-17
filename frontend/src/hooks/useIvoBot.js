import { useState, useCallback } from 'react';
import ivoBotService from '../services/ivoBot';

const useIvoBot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ivoBotService.sendMessage(message);
      return response;
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        message: "I'm having trouble right now. Please call us at 0768103599.",
        timestamp: new Date().toISOString(),
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    ivoBotService.clearHistory();
  }, []);

  const getStats = useCallback(() => ivoBotService.getStats(), []);

  return { sendMessage, clearHistory, getStats, isLoading, error };
};

export default useIvoBot;
