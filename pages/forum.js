// pages/forum.js
'use client'

import { useState } from 'react'
import Layout from '@/components/layout'
import { FaThumbsUp } from 'react-icons/fa'

export default function ForumPage() {
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: 'My first competition idea – win NFTs!',
      author: 'alice_pi',
      votes: 12,
      comments: [
        { id: 1, author: 'bob_pi', text: 'Love this idea!', votes: 3 },
      ],
    },
    // … more mock topics
  ])
  const [newTitle, setNewTitle] = useState('')
  const [pioneerOfWeek, setPioneerOfWeek] = useState('alice_pi')
  const [pioneerVotes, setPioneerVotes] = useState(42)

  const addTopic = () => {
    if (!newTitle.trim()) return
    setTopics([
      {
        id: Date.now(),
        title: newTitle,
        author: 'you_pi',
        votes: 0,
        comments: [],
      },
      ...topics,
    ])
    setNewTitle('')
  }

  const voteTopic = (id) =>
    setTopics(topics.map(t => t.id === id ? { ...t, votes: t.votes + 1 } : t))

  const voteComment = (topicId, commentId) =>
    setTopics(topics.map(t => t.id === topicId
      ? {
          ...t,
          comments: t.comments.map(c =>
            c.id === commentId ? { ...c, votes: c.votes + 1 } : c
          ),
        }
      : t
    ))

  const votePioneer = () => setPioneerVotes(pioneerVotes + 1)

  return (
    <Layout>
      <main className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        {/* Pioneer of the Week */}
        <section className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">🏅 Pioneer of the Week</h2>
          <p className="text-lg mb-4">
            <strong>{pioneerOfWeek}</strong> with <span className="text-yellow-700">{pioneerVotes}</span> votes!
          </p>
          <button
            onClick={votePioneer}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded"
          >
            <FaThumbsUp /> Vote
          </button>
        </section>

        {/* New Topic Form */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Start a New Topic</h2>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Your competition idea…"
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={addTopic}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Post Topic
          </button>
        </section>

        {/* Topics List */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">All Topics</h2>
          {topics.map(topic => (
            <div key={topic.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{topic.title}</h3>
                <button
                  onClick={() => voteTopic(topic.id)}
                  className="flex items-center gap-1 text-blue-600"
                >
                  <FaThumbsUp /> {topic.votes}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">— by {topic.author}</p>

              {/* Comments */}
              <div className="pl-4 space-y-2">
                {topic.comments.map(c => (
                  <div key={c.id} className="flex justify-between">
                    <p>
                      <span className="font-semibold">{c.author}:</span> {c.text}
                    </p>
                    <button
                      onClick={() => voteComment(topic.id, c.id)}
                      className="flex items-center gap-1 text-green-600"
                    >
                      <FaThumbsUp /> {c.votes}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </Layout>
  )
}
