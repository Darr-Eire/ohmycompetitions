'use client'

import Link from 'next/link'
import { SiX } from 'react-icons/si'
import { FaFacebookF, FaInstagram, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="text-cyan-300 text-xs py-6 px-4 bg-[#0f172a] border-t border-cyan-700">
      {/* Back to Home */}
      <div className="flex justify-center mb-3">
        <Link href="/homepage">
          <span className="btn-gradient px-3 py-1 rounded-md cursor-pointer text-sm">
            Back to Home
          </span>
        </Link>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center items-center gap-3 mb-3">
        <a href="https://x.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="X">
          <SiX size={16} />
        </a>
        <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <FaFacebookF size={16} />
        </a>
        <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <FaInstagram size={16} />
        </a>
        <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer" aria-label="Discord">
          <FaDiscord size={16} />
        </a>
      </div>

      {/* Quick Links */}
      <div className="flex justify-center flex-wrap gap-4 text-cyan-300 mb-2 text-xs">
        <Link href="/terms-conditions">Terms</Link>
        <Link href="/privacy-policy">Privacy</Link>
        <Link href="/help-support">Support</Link>
      </div>

      {/* Copyright */}
      <p className="text-center text-cyan-300 mt-2 text-xs">
        &copy; {new Date().getFullYear()} OhMyCompetitions All rights reserved.
      </p>
    </footer>
  )
}
