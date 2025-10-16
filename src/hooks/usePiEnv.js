'use client';
import { useEffect, useMemo, useState } from 'react';

export function usePiEnv() {
  const [isReady, setIsReady] = useState(false);

  const isPiBrowser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
    return /PiBrowser/i.test(ua) || ref.includes('minepi.com') || window.name === 'pi_browser';
  }, []);

  useEffect(() => {
    setIsReady(true); // client hydrated
  }, []);

  const hasPi = typeof window !== 'undefined' && !!window.Pi;

  return { isPiBrowser, hasPi, isReady };
}

// support BOTH: `import { usePiEnv } ...` and `import usePiEnv ...`
export default usePiEnv;
