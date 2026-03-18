import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Logs out the admin and redirects to login after a period of inactivity.
 * @param {Function} onTimeout - Called when the idle timeout is reached.
 */
const useIdleTimeout = (onTimeout) => {
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, IDLE_TIMEOUT_MS);
  }, [onTimeout]);

  useEffect(() => {
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer(); // start the timer on mount

    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
};

export default useIdleTimeout;
