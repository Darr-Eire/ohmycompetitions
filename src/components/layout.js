// src/components/Layout.js
'use client'

import Link from 'next/link'
import { useState } from 'react'
import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    // Pi login logic (handled separately)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // Pi logout logic (handled separately)
    setIsLoggedIn(false)
  }

  return (
    <div className="layout">
      <Header
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="content">
        {children}
{/* Back to Home button */}
<div className="mt-8 flex justify-center">

</div>


      </main>

      <Footer />
    </div>
  )
}

