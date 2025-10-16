'use client';
import { useEffect, useMemo, useState } from 'react';

/**
 * Detect Pi Browser on the client, without crashing SSR/SSG.
 * Exports BOTH a named and default function to satisfy all import styles.
 */
export function usePiEnv() {
  const [isReady, setIsReady] = useState(false);

  // Compute only on client; guard every browser API
  const isPiBrowser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
      const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
      const winName = typeof window !== 'undefined' ? window.name || '' : '';
      return /PiBrowser/i.test(ua) || ref.includes('minepi.com') || winName === 'pi_browser';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Marks hydration done; SDK may be injected later by _document/_app
    setIsReady(true);
  }, []);

  // Do NOT read window.Pi during SSR; only after hydration.
  const hasPi = typeof window !== 'undefined' && !!window.Pi;

  return { isPiBrowser, hasPi, isReady };
}

// Provide default export too, so imports like `import usePiEnv from ...` work.
export default usePiEnv;
