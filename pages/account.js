// pages/account.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Account() {
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
        if (data) {
          setUser(data)
        }
      })
      .catch(() => {
        // On error, bounce back
        router.replace('/')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  if (loading) return <p>Loading…</p>
  if (!user) return null  // we’ve redirected already

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.username}
      </h1>
      <ul className="space-y-2">
        <li>
          <a
            href="/profile"
            className="text-blue-600 hover:underline"
          >
            Your profile
          </a>
        </li>
        <li>
          <a
            href="/settings"
            className="text-blue-600 hover:underline"
          >
            Settings
          </a>
        </li>
        <li>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
              })
              router.replace('/')
            }}
            className="text-red-600 hover:underline"
          >
            Log out
          </button>
        </li>
      </ul>
    </div>
  )
}
