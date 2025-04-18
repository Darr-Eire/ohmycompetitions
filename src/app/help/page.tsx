import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8 text-black">
        <h1 className="text-3xl font-bold text-black text-center mb-4">
          🆘 Help & Support
        </h1>

        <section>
          <h2 className="text-xl font-semibold text-black mb-2">📖 Frequently Asked Questions</h2>
          <ul className="space-y-4">
            <li>
              <strong>How do I enter a giveaway?</strong><br />
              Browse available competitions, click "Enter Now", choose how many tickets you'd like to buy, and pay using your Pi wallet inside the Pi Browser.
            </li>
            <li>
              <strong>How does Pi payment work?</strong><br />
              We use Pi Network's SDK to securely request a transaction. You'll confirm payment in the Pi Browser.
            </li>
            <li>
              <strong>Is it free to join?</strong><br />
              Some giveaways are free, others may require a small Pi entry fee like 0.314π. It will be clearly shown.
            </li>
            <li>
              <strong>How are winners selected?</strong><br />
              Winners are randomly selected after the competition ends. Some draws may be live-streamed!
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-2">🔧 Troubleshooting</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>If Pi login isn't working, try refreshing in the Pi Browser and log in again.</li>
            <li>Make sure you're using the latest version of Pi Browser.</li>
            <li>If a page isn't loading, check your internet connection or try again later.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-2">📬 Contact Support</h2>
          <p>
            Still need help? We're here for you.
          </p>
          <ul className="mt-2 space-y-1 underline">
            <li>Email: <a href="mailto:support@ohmycompetitions.com" className="text-blue-700">support@ohmycompetitions.com</a></li>
            <li>Pi Chat: <span className="text-blue-700">@OhMySupport</span></li>
            <li>Telegram: <a href="https://t.me/ohmycompetitions" target="_blank" className="text-blue-700">t.me/ohmycompetitions</a></li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
