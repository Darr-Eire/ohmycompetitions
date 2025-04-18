'use client'

import Link from 'next/link'
import { Twitter, Instagram, ShieldCheck, ScrollText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-blue-500 text-white py-6 px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center md:flex-row justify-between">
        {/* Social Links - Left */}
        <div className="flex gap-4 mb-4 md:mb-0">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <ShieldCheck className="w-5 h-5" />
          </a>
        </div>

        {/* Center - Back to Home */}
        <div className="text-sm font-medium mb-4 md:mb-0 text-center w-full md:w-auto">
          <Link href="/" className="hover:underline">
            ← Back to Home
          </Link>
        </div>

        {/* Right - Legal Links */}
        <div className="flex gap-6 text-sm">
          <Link href="/terms" className="hover:underline flex items-center gap-1">
            <ScrollText className="w-4 h-4" />
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:underline flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
