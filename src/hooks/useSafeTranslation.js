// src/hooks/useSafeTranslation.js
'use client';

import { useCallback } from 'react';

// Try to load react-i18next once (compile-time constant),
// but do NOT vary hook calls per render.
let rti;
try {
  // Optional dependency – if missing or not initialized, we'll fall back.
  rti = require('react-i18next');
} catch (_) {
  rti = null;
}

export function useSafeTranslation() {
  // Use react-i18next if it's available AND doesn't throw.
  if (rti && typeof rti.useTranslation === 'function') {
    try {
      // Important: this hook call happens on **every** render, not conditionally.
      const { t } = rti.useTranslation();
      if (typeof t === 'function') return { t };
    } catch {
      // fall through to the fallback below
    }
  }

  // Stable fallback translator: t('key', 'Default text') → returns default text.
  const t = useCallback((key, defaultTextOrOpts) => {
    if (typeof defaultTextOrOpts === 'string') return defaultTextOrOpts;
    if (defaultTextOrOpts && typeof defaultTextOrOpts.defaultValue === 'string') {
      return defaultTextOrOpts.defaultValue;
    }
    return typeof key === 'string' ? key : '';
  }, []);

  return { t };
}
