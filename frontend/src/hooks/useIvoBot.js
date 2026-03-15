import { useState, useCallback } from 'react';
import ivoBotService from '../services/ivoBot';

/**
 * Custom hook for managing Ivo Bot interactions
 */
export const useIvoBot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const sendMessage = useCallback(async (message) => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize if needed
      if (!isInitialized) {
        await ivoBotService.initialize();
        setIsInitialized(true);
      }

      const response = await ivoBotService.sendMessage(message);
      return response;
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        message: "I'm having trouble right now. Please try again or call us at 0768103599.",
        timestamp: new Date().toISOString(),
        error: err.message
      };
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const clearHistory = useCallback(() => {
    ivoBotService.clearHistory();
  }, []);

  const getStats = useCallback(() => {
    return ivoBotService.getStats();
  }, []);

  return {
    sendMessage,
    clearHistory,
    getStats,
    isLoading,
    error,
    isInitialized
  };
};

export default useIvoBot;