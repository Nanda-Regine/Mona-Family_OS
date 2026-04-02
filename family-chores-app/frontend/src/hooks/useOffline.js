import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect online/offline status.
 * Returns: { isOnline, wasOffline }
 * - isOnline: current network status
 * - wasOffline: true if the connection was just restored (useful for triggering syncs)
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const prevOnline = useRef(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      if (!prevOnline.current) {
        setWasOffline(true);
        // Reset wasOffline flag after a short delay
        setTimeout(() => setWasOffline(false), 5000);
      }
      prevOnline.current = true;
    }

    function handleOffline() {
      setIsOnline(false);
      prevOnline.current = false;
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

export default useOffline;
