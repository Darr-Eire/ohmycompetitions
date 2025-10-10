'use client'

import { useState } from 'react'

export default function AccountHeader({ user }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
    } catch (err) {
      console.error('Update failed', err)
    }
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Avatar + Info */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Welcome back, {user.name || 'Pioneer'}!
            </h2>
            <p className="text-sm text-gray-200">
              Pi UID: {user.uid || '—'}
            </p>
          </div>
        </div>

        {/* Edit Profile UI */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-gradient px-4 py-2 rounded-full"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-y-2 text-sm text-white w-full md:w-auto">
            <input
              type="text"
              className="bg-white bg-opacity-20 rounded px-2 py-1 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              type="email"
              className="bg-white bg-opacity-20 rounded px-2 py-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
