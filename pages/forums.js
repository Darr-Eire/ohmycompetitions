// pages/forums.js
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FaThumbsUp,
  FaRegCommentDots,
} from 'react-icons/fa'

export default function Forums() {
  // dummy state; wire up to your real API/DB as you go
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: 'My first competition idea — win NFTs!',
      author: 'alice_pi',
      votes: 12,
      replies: [{ id: 1, author: 'bob_pi', text: 'Love this idea!' }],
    },
  ])
  const [newTopic, setNewTopic] = useState('')

  const addTopic = () => {
    if (!newTopic.trim()) return
    setTopics([
      {
        id: Date.now(),
        title: newTopic,
        author: 'you_pi',
        votes: 0,
        replies: [],
      },
      ...topics,
    ])
    setNewTopic('')
  }

  const voteTopic = id => {
    setTopics(topics.map(t => t.id === id ? { ...t, votes: t.votes + 1 } : t))
  }

  // pick the top-voted pioneer
  const pioneerOfWeek = topics.reduce(
    (max, t) => (t.votes > max.votes ? t : max),
    { votes: -1 }
  )

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* forum card container */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Pioneer of the Week */}
        <div className="max-w-lg mx-auto mb-8 bg-white border-2 border-blue-500 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2 mb-4">
            <FaThumbsUp /> Pioneer of the Week
          </h2>
          {pioneerOfWeek.votes >= 0 ? (
            <div className="flex items-center justify-between">
              <span className="font-medium">@{pioneerOfWeek.author}</span>
              <div className="flex items-center gap-2">
                <span>{pioneerOfWeek.votes} votes</span>
                <button
                  onClick={() => voteTopic(pioneerOfWeek.id)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Vote
                </button>
              </div>
            </div>
          ) : (
            <p>No votes yet — be the first to vote!</p>
          )}
        </div>

        {/* New Topic */}
        <div className="max-w-lg mx-auto mb-8 bg-white border rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FaRegCommentDots /> Start a New Topic
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your competition idea…"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              className="flex-1 border rounded px-3 py-2 focus:outline-blue-400"
            />
            <button
              onClick={addTopic}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Post
            </button>
          </div>
        </div>

        {/* All Topics */}
        <div className="max-w-lg mx-auto space-y-6">
          {topics.map(topic => (
            <div
              key={topic.id}
              className="bg-white border rounded-lg shadow p-6"
            >
              <h4 className="text-md font-bold mb-1">{topic.title}</h4>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">— by @{topic.author}</span>
                <button
                  onClick={() => voteTopic(topic.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
                >
                  <FaThumbsUp /> {topic.votes}
                </button>
              </div>
              {/* show first reply */}
              {topic.replies.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">
                    @{topic.replies[0].author}: {topic.replies[0].text}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* back to home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
