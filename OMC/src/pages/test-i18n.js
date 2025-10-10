// src/pages/test-i18n.js
import { useState } from 'react';
import Footer from '../components/footer';
import FreeCompetitionCard from '../components/FreeCompetitionCard';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

export default function TestI18n() {
  const { t } = useSafeTranslation();
  const [currentLang, setCurrentLang] = useState('en');

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    // In a real app, this would trigger the i18n language change
    console.log('Language changed to:', lang);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">i18n Test Page</h1>
        
        {/* Language Switcher */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Language Switcher</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded ${currentLang === 'en' ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              English
            </button>
            <button 
              onClick={() => changeLanguage('es')}
              className={`px-4 py-2 rounded ${currentLang === 'es' ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              Español
            </button>
            <button 
              onClick={() => changeLanguage('fr')}
              className={`px-4 py-2 rounded ${currentLang === 'fr' ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              Français
            </button>
          </div>
        </div>

        {/* Test Translations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Translation Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800 rounded">
              <p><strong>Back to Home:</strong> {t('back_to_home', 'Back to Home')}</p>
              <p><strong>Terms:</strong> {t('terms', 'Terms')}</p>
              <p><strong>Privacy:</strong> {t('privacy', 'Privacy')}</p>
              <p><strong>Support:</strong> {t('support', 'Support')}</p>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <p><strong>Prize:</strong> {t('prize', 'Prize')}</p>
              <p><strong>Open:</strong> {t('open', 'Open')}</p>
              <p><strong>Closed:</strong> {t('closed', 'Closed')}</p>
              <p><strong>Coming Soon:</strong> {t('coming_soon', 'Coming Soon')}</p>
            </div>
          </div>
        </div>

        {/* Test Components */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Component Test</h2>
          <FreeCompetitionCard 
            comp={{
              startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              ticketsSold: 150,
              totalTickets: 1000,
              slug: 'test-competition'
            }}
            title="Test Competition"
            prize="$1000"
          />
        </div>

        {/* Footer Test */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Footer Test</h2>
          <Footer />
        </div>
      </div>
    </div>
  );
}
