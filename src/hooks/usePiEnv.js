// src/hooks/usePiEnv.js
import { useEffect, useState } from 'react';

export function usePiEnv() {
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [hasPi, setHasPi] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Detect Pi Browser (client-only, avoids SSR mismatch)
  useEffect(() => {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    const ref = (typeof document !== 'undefined' && document.referrer) || '';
    const winName = (typeof window !== 'undefined' && window.name) || '';
    const isPi =
      /PiBrowser/i.test(ua) ||
      /minepi\.com/i.test(ref) ||
      winName === 'pi_browser';
    setIsPiBrowser(isPi);
  }, []);

  // Track SDK injection + readiness using the global singleton from _app.js
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window;

    // If already injected/initialized, reflect immediately
    if (w.Pi) setHasPi(true);
    if (w.__piInitDone) setIsReady(true);

    let cancelled = false;

    // Best path: await the singleton promise if present
    async function ensureReady() {
      if (typeof w.__readyPi === 'function') {
        try {
          await w.__readyPi();
          if (!cancelled) {
            setHasPi(!!w.Pi);
            setIsReady(true);
          }
          return;
        } catch {
          // fall through to polling
        }
      }
      // Fallback: light polling for late injection (e.g., very early mount)
      let tries = 0;
      const id = setInterval(() => {
        tries += 1;
        if (w.Pi) setHasPi(true);
        if (w.__piInitDone) {
          setIsReady(true);
          clearInterval(id);
        } else if (tries > 80) {
          clearInterval(id); // ~12s max
        }
      }, 150);
      return () => clearInterval(id);
    }

    const cleanup = ensureReady();
    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return { isPiBrowser, hasPi, isReady };
}
