'use client'

import Link from 'next/link'
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
} from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="text-center bg-blue-600 text-white py-6 mt-12">
      {/* Back to Home */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-block bg-white text-blue-600 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100 transition"
        >
          ← Back to Home
        </Link>
      </div>
{/* Copyright */}
      <p className="text-sm">&copy; {new Date().getFullYear()} OhMyCompetitions</p>
      {/* Social Icons */}
      <div className="social-icons flex justify-center gap-6 mb-4">
        <a
          href="https://twitter.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="hover:text-blue-300 transition"
        >
          <FaTwitter size={24} />
        </a>
        <a
          href="https://facebook.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="hover:text-blue-300 transition"
        >
          <FaFacebookF size={24} />
        </a>
        <a
          href="https://instagram.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:text-blue-300 transition"
        >
          <FaInstagram size={24} />
        </a>
        <a
          href="https://discord.gg/yourinvite"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          className="hover:text-blue-300 transition"
        >
          <FaDiscord size={24} />
        </a>
      </div>

   
      <div className="footer-links flex justify-center gap-6 mb-4">
        <Link href="/terms-conditions" className="hover:underline">
          Terms &amp; Conditions
        </Link>
        <Link href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>

      
    </footer>
  )
}

