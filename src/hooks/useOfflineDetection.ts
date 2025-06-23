
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast({
          title: 'Connection restored',
          description: 'You are back online',
          duration: 3000,
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast({
        title: 'Connection lost',
        description: 'You are currently offline. Some features may not work.',
        variant: 'destructive',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connection periodically
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/favicon.ico', { 
          cache: 'no-store',
          mode: 'no-cors'
        });
        const currentOnlineStatus = response.type !== 'opaque' || navigator.onLine;
        
        if (currentOnlineStatus !== isOnline) {
          if (currentOnlineStatus) {
            handleOnline();
          } else {
            handleOffline();
          }
        }
      } catch {
        if (isOnline) {
          handleOffline();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, wasOffline]);

  return { isOnline, wasOffline };
};
