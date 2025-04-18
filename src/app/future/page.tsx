import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FuturePage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-4">🚀 The Future of OhMyCompetitions</h1>
        <p className="text-gray-700 text-lg mb-6">
          We're just getting started. Here's what we’re building next:
        </p>

        <ul className="text-left text-gray-800 list-disc list-inside space-y-2 max-w-lg mx-auto">
          <li>🎥 Live Draws with video integration</li>
          <li>👍 Like & Vote on your favorite competitions</li>
          <li>🌍 Regional Giveaways (local-only prizes)</li>
          <li>🧠 Community-powered ideas and feedback</li>
          <li>🔒 More secure and transparent entry system</li>
          <li>📱 Full Pi Network ecosystem integration</li>
        </ul>

        <p className="text-gray-600 mt-8">
          Join us on this journey as we turn Pi into the ultimate rewards experience.
        </p>
      </main>
      <Footer />
    </>
  )
}
