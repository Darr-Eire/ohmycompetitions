'use client'

import { useEffect, useState } from 'react'

export default function ForumThreadList() {
  const [threads, setThreads] = useState([])

  useEffect(() => {
    fetch('/api/forums')
      .then(res => res.json())
      .then(setThreads)
  }, [])

  if (!threads.length) {
    return (
      <div className="text-white bg-white bg-opacity-10 p-6 rounded-2xl text-center">
        No threads posted yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map(thread => (
        <div
          key={thread._id}
          className="bg-white bg-opacity-10 p-4 rounded-2xl text-white shadow"
        >
          <div className="text-sm text-gray-300 mb-1">
            {new Date(thread.createdAt).toLocaleString()} • {thread.category}
          </div>
          <h3 className="text-lg font-bold">{thread.title}</h3>
          {thread.body && <p className="text-sm mt-1">{thread.body}</p>}
        </div>
      ))}
    </div>
  )
}
