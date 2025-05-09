'use client'

import Link from 'next/link'
import { SiX } from 'react-icons/si'
import { FaFacebookF, FaInstagram, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="footer text-white text-sm">
      {/* Back to Home Button */}
      <div className="max-w-screen-md mx-auto px-4 py-8">
        <Link href="/" legacyBehavior>
     <a className="btn-gradient inline-block text-sm px-3 py-1 rounded-md">Back to Home</a>

        </Link>
      </div>

      {/* Social Icons */}
      <div className="social-icons">
        <a href="https://x.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="X">
          <SiX size={20} />
        </a>
        <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <FaFacebookF size={20} />
        </a>
        <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <FaInstagram size={20} />
        </a>
        <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer" aria-label="Discord">
          <FaDiscord size={20} />
        </a>
      </div>

      {/* Links */}
      <div className="footer-links">
        <Link href="/terms-conditions" legacyBehavior>
          <a>Terms & Conditions</a>
        </Link>
        <Link href="/privacy-policy" legacyBehavior>
          <a>Privacy Policy</a>
        </Link>
      </div>

      {/* Copyright */}
      <p className="mt-4 text-xs text-cyan-200">
        &copy; {new Date().getFullYear()} OhMyCompetitions. All rights reserved.
      </p>
    </footer>
  )
}
