import { useState, useEffect } from 'react';

export default function useIsOnline(interval = 5000) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkConnection = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      try {
        // Ping a reliable endpoint (no-cors to avoid blocking)
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const timer = setInterval(checkConnection, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { isOnline };
}
