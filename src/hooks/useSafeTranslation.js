// src/hooks/useSafeTranslation.js
'use client';
import { useCallback } from 'react';

// --- decide once if i18n should be used (env-gated) ---
let rti;
try { rti = require('react-i18next'); } catch { rti = null; }
const I18N_ENABLED =
  process.env.NEXT_PUBLIC_I18N_ENABLED === 'true' &&
  !!rti && typeof rti.useTranslation === 'function';

// --- simple {{var}} interpolator for fallback ---
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{\{\s*([a-zA-Z0-9_.$-]+)\s*\}\}/g, (_m, name) =>
    (vars[name] === undefined || vars[name] === null) ? `{{${name}}}` : String(vars[name])
  );
}

// --- single implementation (named + default will both point here) ---
function useSafeTranslationImpl() {
  if (I18N_ENABLED) {
    const { t: rtiT } = rti.useTranslation();
    const t = useCallback((key, fallbackOrOpts, vars) => {
      if (typeof fallbackOrOpts === 'string') return rtiT(key, { defaultValue: fallbackOrOpts, ...(vars || {}) });
      if (fallbackOrOpts && typeof fallbackOrOpts === 'object') return rtiT(key, fallbackOrOpts);
      return rtiT(key);
    }, [rtiT]);
    return { t };
  }

  const t = useCallback((key, fallbackOrOpts, maybeVars) => {
    let base, vars = maybeVars;
    if (typeof fallbackOrOpts === 'string') {
      base = fallbackOrOpts;
    } else if (fallbackOrOpts && typeof fallbackOrOpts === 'object') {
      base = typeof fallbackOrOpts.defaultValue === 'string'
        ? fallbackOrOpts.defaultValue
        : (typeof key === 'string' ? key : '');
      vars = { ...fallbackOrOpts, ...(maybeVars || {}) };
      if ('defaultValue' in vars) delete vars.defaultValue;
    } else {
      base = typeof key === 'string' ? key : '';
    }
    return interpolate(base, vars);
  }, []);

  return { t };
}

// ✅ export BOTH ways so any import style works
export function useSafeTranslation() { return useSafeTranslationImpl(); }
export default useSafeTranslationImpl;
