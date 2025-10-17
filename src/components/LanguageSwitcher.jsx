// src/components/LanguageSwitcher.jsx
'use client';

import { useState, useEffect } from 'react';
// IMPORTANT: use the safe wrapper, not useTranslation directly
import { useSafeTranslation } from 'hooks/useSafeTranslation'; // or '../hooks/useSafeTranslation' if you don't have a path alias

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
];

export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n, ready } = useSafeTranslation(); // safe: won’t throw before init
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  // keep currentLang in sync once i18n is actually ready
  useEffect(() => {
    if (!i18n || (!ready && !i18n.language)) return;
    const code = i18n.resolvedLanguage || i18n.language || 'en';
    const cur = languages.find(l => l.code === code) || languages[0];
    setCurrentLang(cur);
  }, [i18n, ready, i18n?.language, i18n?.resolvedLanguage]);

  const handleLanguageChange = (langCode) => {
    if (i18n?.changeLanguage) i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // While i18n is booting, render a harmless button (prevents header from disappearing)
  const label = (t && typeof t === 'function') ? t('language', 'Language') : 'Language';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:text-cyan-300 transition-colors rounded-lg hover:bg-cyan-500/10"
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-cyan-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-cyan-300 font-semibold mb-2 px-2">
                {label}
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentLang.code === lang.code
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-white hover:bg-cyan-500/10 hover:text-cyan-300'
                  }`}
                  role="option"
                  aria-selected={currentLang.code === lang.code}
                  type="button"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {currentLang.code === lang.code && (
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
