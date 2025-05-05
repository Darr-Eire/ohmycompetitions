// src/components/Footer.js
'use client'

import Link from 'next/link'
import { SiX } from 'react-icons/si'
import { FaFacebookF, FaInstagram, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-6 mt-auto">
      {/* Back to Home */}
      <div className="mb-6 text-center">
        <Link href="/" legacyBehavior>
          <a className="comp-button inline-block max-w-max mx-auto">
            Back to Home
          </a>
        </Link>
      </div>

      {/* Social Icons */}
      <div className="social-icons flex justify-center gap-6 mb-4">
        <a
          href="https://x.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="hover:text-green-800 transition"
        >
          <SiX size={24} />
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
          className="hover:text-pink-300 transition"
        >
          <FaInstagram size={24} />
        </a>
        <a
          href="https://discord.gg/yourinvite"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          className="hover:text-indigo-300 transition"
        >
          <FaDiscord size={24} />
        </a>
      </div>

      {/* Footer Links */}
      <div className="footer-links flex justify-center gap-6 mb-4 text-sm">
        <Link href="/terms-conditions" legacyBehavior>
          <a className="hover:underline">Terms &amp; Conditions</a>
        </Link>
        <Link href="/privacy-policy" legacyBehavior>
          <a className="hover:underline">Privacy Policy</a>
        </Link>
      </div>

      {/* Copyright */}
      <p className="text-center text-xs">
        &copy; {new Date().getFullYear()} OhMyCompetitions. All rights reserved.
      </p>
    </footer>
)
}
