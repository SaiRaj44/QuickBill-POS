import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { INACTIVITY_TIMEOUT } from '../config/constants';
import { logout, updateLastActivity, getLastActivity } from '../services/auth/authService';

interface UseInactivityOptions {
  timeout?: number;
  onLock: () => void;
  enabled?: boolean;
}

export const useInactivity = ({
  timeout = INACTIVITY_TIMEOUT,
  onLock,
  enabled = true,
}: UseInactivityOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
    onLock();
  }, [onLock]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    clearTimer();
    updateLastActivity();
    
    timerRef.current = setTimeout(() => {
      lock();
    }, timeout);
  }, [enabled, timeout, clearTimer, lock]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    resetTimer();
  }, [resetTimer]);

  // Check if should be locked on mount (app was in background)
  useEffect(() => {
    const checkLockStatus = async () => {
      if (!enabled) return;
      
      const lastActivity = await getLastActivity();
      if (lastActivity) {
        const elapsed = Date.now() - lastActivity;
        if (elapsed > timeout) {
          lock();
        } else {
          resetTimer();
        }
      } else {
        resetTimer();
      }
    };

    checkLockStatus();
    
    return clearTimer;
  }, [enabled, timeout, resetTimer, clearTimer, lock]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (!enabled) return;

      if (nextAppState === 'active') {
        // App came to foreground - check if should be locked
        const lastActivity = await getLastActivity();
        if (lastActivity) {
          const elapsed = Date.now() - lastActivity;
          if (elapsed > timeout) {
            lock();
          } else {
            resetTimer();
          }
        }
      } else if (nextAppState === 'background') {
        // App went to background - update last activity
        updateLastActivity();
        clearTimer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, timeout, resetTimer, clearTimer, lock]);

  return {
    resetTimer,
    isLocked,
    unlock,
    lock,
  };
};

export default useInactivity;
