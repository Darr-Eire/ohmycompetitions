// src/components/Layout.js
'use client'

import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />

      <main
        className="content pt-8 pb-12 px-4 min-h-screen space-y-16"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  )
}
