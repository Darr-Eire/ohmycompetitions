// pages/account.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          // Not logged in → back to home
          router.replace('/')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) setUser(data)
      })
      .catch(() => {
        router.replace('/')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.replace('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading your account…</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user.username}!
      </h1>

      <ul className="space-y-4 mb-8">
        <li>
          <a
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            📊 Your Dashboard
          </a>
        </li>
        <li>
          <a
            href="/settings"
            className="text-blue-600 hover:underline"
          >
            ⚙️ Account Settings
          </a>
        </li>
        <li>
          <a
            href="/competitions"
            className="text-blue-600 hover:underline"
          >
            🎉 Browse Competitions
          </a>
        </li>
      </ul>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Log out
      </button>
    </div>
  )
}
