// pages/competitions/everyday-pioneer.js
'use client'

import { useState, useEffect } from 'react'
import Header from '../../src/components/Header'
import Footer from '../../src/components/footer'

export default function EverydayPioneer() {
  // (other state and effects omitted for brevity)

  const handleClickTest = () => {
    console.log('Button clicked!')  // <-- you should see this in the console
  }

  return (
    <>
      <Header />

      <main>
        <button
          type="button"
          onClick={handleClickTest}
          className="px-4 py-2 bg-pi-purple text-white rounded"
        >
          Test Button
        </button>
      </main>

      <Footer />
    </>
  )
}
