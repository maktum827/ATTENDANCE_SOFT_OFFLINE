// hooks/useInternetAccess.js
import { useState, useEffect } from 'react';

const checkInternetAccess = async () => {
  try {
    await fetch('https://www.google.com', { mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
};

export default function useInternetAccess(interval = 10000) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const updateStatus = async () => {
      const online = await checkInternetAccess();
      if (mounted) setIsConnected(online);
    };

    updateStatus(); // Initial check
    const id = setInterval(updateStatus, interval); // Repeat

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [interval]);

  return isConnected;
}
