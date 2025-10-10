// src/hooks/usePiEnv.js
import { useEffect, useState, useMemo } from 'react';

export function usePiEnv() {
  const [isReady, setIsReady] = useState(false);

  const isPiBrowser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      /PiBrowser/i.test(navigator.userAgent) ||
      document.referrer.includes('minepi.com') ||
      window.name === 'pi_browser'
    );
  }, []);

  useEffect(() => {
    // SDK might be injected late; this marks “client hydrated”
    setIsReady(true);
  }, []);

  const hasPi = typeof window !== 'undefined' && !!window.Pi;

  return { isPiBrowser, hasPi, isReady };
}
