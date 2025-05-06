'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const PiAuthContext = createContext()

export function PiAuthProvider({ children }) {
  const [piUser, setPiUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const scopes = ['username','payments']

  // On mount, restore any existing session
  useEffect(() => {
    if (window.Pi?.getCurrentPioneer) {
      window.Pi.getCurrentPioneer()
        .then(user => {
          if (user) console.log('♻️ Restored Pi session:', user.uid)
          setPiUser(user)
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Login handler
  const login = async () => {
    setLoading(true)
    try {
      const { user } = await window.Pi.authenticate(scopes)
      console.log('✅ Pioneer logged in:', user.uid)
      setPiUser(user)
    } finally {
      setLoading(false)
    }
  }

  // Logout handler (just clears state; Pi’s WebView session may persist)
  const logout = () => setPiUser(null)

  return (
    <PiAuthContext.Provider value={{ piUser, loading, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  )
}

// Hook for easy usage
export function usePiAuth() {
  return useContext(PiAuthContext)
}
