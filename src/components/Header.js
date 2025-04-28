// pages/forums.js
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FaThumbsUp,
  FaRegCommentDots,
  FaDiscord,
  FaTwitter,
  FaFacebookF,
  FaInstagram,
} from 'react-icons/fa'

export default function Forums() {
  // Sample state; replace with real data fetching as needed
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: 'Win rare NFTs with Pi-powered puzzle!',
      author: 'alice_pi',
      votes: 42,
      replies: [{ id: 1, author: 'bob_pi', text: 'This sounds awesome!' }],
    },
    {
      id: 2,
      title: 'Global photo contest 🌍📸',
      author: 'charlie_pi',
      votes: 15,
      replies: [],
    },
  ])
  const [newTopic, setNewTopic] = useState('')

  // Add a new topic at the top
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

  // Vote on a topic
  const voteTopic = id => {
    setTopics(topics.map(t => (t.id === id ? { ...t, votes: t.votes + 1 } : t)))
  }

  // Determine Pioneer of the Week
  const pioneerOfWeek = topics.reduce(
    (max, t) => (t.votes > max.votes ? t : max),
    { votes: -1 }
  )

  return (
    <main className="forums-page">
      <div className="container">
        {/* Pioneer Hero */}
        <section className="card hero-card">
          <h2>
            <FaThumbsUp /> Pioneer of the Week
          </h2>
          {pioneerOfWeek.votes >= 0 ? (
            <div className="hero-content">
              <span className="username">@{pioneerOfWeek.author}</span>
              <button onClick={() => voteTopic(pioneerOfWeek.id)}>
                <FaThumbsUp /> {pioneerOfWeek.votes}
              </button>
            </div>
          ) : (
            <p>No votes yet—be the first to vote!</p>
          )}
        </section>

        {/* New Topic Form */}
        <section className="card form-card">
          <h3>
            <FaRegCommentDots /> Start a New Topic
          </h3>
          <div className="form-row">
            <input
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              placeholder="Your competition idea…"
            />
            <button onClick={addTopic}>Post</button>
          </div>
        </section>

        {/* Topic List */}
        <section className="topic-list">
          {topics.map(topic => (
            <div key={topic.id} className="card topic-card">
              <h4>{topic.title}</h4>
              <div className="topic-meta">
                <span>— by @{topic.author}</span>
                <button onClick={() => voteTopic(topic.id)}>
                  <FaThumbsUp /> {topic.votes}
                </button>
              </div>
              {topic.replies.length > 0 && (
                <div className="reply-snippet">
                  <strong>@{topic.replies[0].author}:</strong>{' '}
                  {topic.replies[0].text}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Community Chat */}
        <section className="card social-card">
          <h3>Join the Conversation</h3>
          <div className="social-icons">
            <a href="#" aria-label="Discord">
              <FaDiscord />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </section>

        {/* Back Home */}
        <div className="back-home">
          <Link href="/" className="btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
