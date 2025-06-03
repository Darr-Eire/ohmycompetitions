// src/components/Layout.js
'use client'

import Header from './Header'
import Footer from './footer'
import '@fontsource/orbitron' // ✅ Import Orbitron font

export default function Layout({ children }) {
  return (
    <div className="layout font-orbitron text-white">
      <Header />

      <main
  className="content pt-20 pb-12 px-4 min-h-screen space-y-16"
  style={{
    backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          backgroundAttachment: 'fixed',
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  )
}
