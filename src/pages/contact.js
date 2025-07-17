'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('Sending...')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await res.json()
      if (res.ok) {
        setStatus('✅ Message sent successfully!')
        setForm({ name: '', email: '', message: '' })
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (err) {
      setStatus(`❌ ${err.message}`)
    }
  }
  return (
    <main className="app-background min-h-screen text-white px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
      <div className="flex justify-center">
  <h1 className="btn-gradient text-2xl font-bold py-2 px-6 rounded-full shadow-md text-center">
    📬 Contact Us
  </h1>
</div>

        <p className="mb-6 text-center">
          Have a question, feedback, or need help? Fill out the form below or email us at <span className="underline">ohmycompetitions@gmail.com</span>.
        </p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-2 rounded bg-white bg-opacity-20 placeholder-white"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full px-4 py-2 rounded bg-white bg-opacity-20 placeholder-white"
          />
          <textarea
            rows="5"
            placeholder="Your Message"
            className="w-full px-4 py-2 rounded bg-white bg-opacity-20 placeholder-white"
          ></textarea>
          <button
            type="submit"
            className="btn-gradient w-full py-2 text-lg rounded font-semibold"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  )
}
