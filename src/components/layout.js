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

        {/* Back to Home button */}
        <div className="mt-8 flex justify-center">
          <Link href="/" passHref>
            <button className="comp-button">
              Back to Home
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
