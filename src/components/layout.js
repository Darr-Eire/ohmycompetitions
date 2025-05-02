// src/components/Layout.js
'use client'

import Link from 'next/link'
import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />

      <main className="content">
        {children}

      </main>

      <Footer />
    </div>
  )
}
