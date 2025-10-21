// =========================================
// File: src/components/Layout.jsx  (use your file, only minimal edits)
// =========================================
'use client';

import Header from './Header';
import Footer from './footer';
import MobileNav from './MobileNav';
import { useSafeTranslation } from '../hooks/useSafeTranslation';
import '@fontsource/orbitron';

export default function Layout({ children }) {
  const { t } = useSafeTranslation();

  return (
    <div className="layout font-orbitron text-white">
      <Header />

      <div className="w-full bg-cyan-300 text-[#0f172a] font-bold text-sm py-2 px-4 whitespace-nowrap overflow-hidden">
        <div className="animate-marquee">
          {t('layout_marquee_text', 'OhMyCompetitions is all about building with Pi Network for the Pi community. Our launch month competitions are zero profit — designed to build trust, celebrate early winners and give back to Pioneers. All prizes go directly to you. Add us on Pi Profile: darreire2020 & Lyndz2020. Join, win and help shape the future of Pi together!')}
        </div>
      </div>

      {/* NOTE: exact padding equals nav height + safe-area */}
      <main
        className="content pt-6 px-2 min-h-screen space-y-16 mobile-nav-spacer"
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          backgroundAttachment: 'fixed',
        }}
      >
        {children}
      </main>

      {/* Footer also gets the spacer so it never sits under the nav */}
      <div className="mobile-nav-spacer">
        <Footer />
      </div>

      <MobileNav />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(e){
                  console.log('SW register failed', e);
                });
              });
            }
          `,
        }}
      />
    </div>
  );
}
