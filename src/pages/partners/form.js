// pages/partners/form.js
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PartnerFormPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    website: '',
    description: '',
    sponsorshipIdea: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire up to your backend or email service
    console.log('Partner request:', form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="page py-10 px-4">
        <div className="competition-card max-w-xl mx-auto p-6">
          <div className="competition-top-banner text-2xl text-center">
            🙏 Thank You!
          </div>
          <p className="mt-4 text-center">
            We’ve received your request and will be in touch soon.
          </p>
          <div className="text-center mt-6">
            <Link href="/">
              <a className="view-more-button px-6 py-2"> Back to Home</a>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page py-10 px-4">
      <div className="competition-card max-w-xl mx-auto p-6">
        <div className="competition-top-banner text-2xl text-center">
          🤝 Become a Partner
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Your Name */}
          <div>
            <label htmlFor="name" className="block mb-1 font-semibold">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Website / DApp */}
          <div>
            <label htmlFor="website" className="block mb-1 font-semibold">
              Your DApp / Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              required
              value={form.website}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Brief Description */}
          <div>
            <label htmlFor="description" className="block mb-1 font-semibold">
              Brief Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Giveaway / Sponsorship Idea */}
          <div>
            <label
              htmlFor="sponsorshipIdea"
              className="block mb-1 font-semibold"
            >
              Giveaway / Sponsorship Idea
            </label>
            <textarea
              id="sponsorshipIdea"
              name="sponsorshipIdea"
              rows={3}
              required
              value={form.sponsorshipIdea}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="view-more-button px-6 py-2"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
