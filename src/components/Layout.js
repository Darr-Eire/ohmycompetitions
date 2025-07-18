'use client';

import Header from './Header';
import Footer from './footer';
import '@fontsource/orbitron'; // ✅ Orbitron font

export default function Layout({ children }) {
  return (
    <div className="layout font-orbitron text-white">
      {/* Sticky Header */}
      <Header />

      {/* Global Marquee (optional, remove if homepage only) */}
      <div className="w-full bg-cyan-300 text-[#0f172a] font-bold text-sm py-2 px-4 whitespace-nowrap overflow-hidden">
        <div className="animate-marquee">
          OhMyCompetitions is all about building with Pi Network for the Pi community. Our launch month competitions are zero profit — designed to build trust, celebrate early winners, and give back to Pioneers. All prizes go directly to you. Add us on Pi Profile: darreire2020 & Lyndz2020. Join, win and help shape the future of Pi together!
        </div>
      </div>

      {/* Main content area */}
      <main
        className="content pt-6 pb-8 px-2 min-h-screen space-y-16"
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          backgroundAttachment: 'fixed',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
