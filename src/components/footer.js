'use client'

import Link from 'next/link'
import { SiX } from 'react-icons/si'
import { FaFacebookF, FaInstagram, FaDiscord } from 'react-icons/fa'
import { useSafeTranslation } from '../hooks/useSafeTranslation'

export default function Footer() {
  const { t } = useSafeTranslation();

  return (
    <footer className="text-cyan-300 text-xs py-6 px-4 bg-[#0f172a] border-t border-cyan-700">
      {/* Back to Home */}
<div className="flex justify-center mb-3">
  <Link href="/homepage" className="btn-gradient px-3 py-1 rounded-md cursor-pointer text-sm">
    {t('back_to_home', 'Back to Home')}
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
        <Link href="/terms-conditions">{t('terms', 'Terms')}</Link>
        <Link href="/privacy-policy">{t('privacy', 'Privacy')}</Link>
        <Link href="/help-support">{t('support', 'Support')}</Link>
      </div>

      {/* Copyright */}
      <p className="text-center text-cyan-300 mt-2 text-xs">
        &copy; {new Date().getFullYear()} {t('copyright', 'OhMyCompetitions All rights reserved.')}
      </p>
    </footer>
  )
}
