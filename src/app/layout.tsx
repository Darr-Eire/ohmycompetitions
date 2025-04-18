import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OhMyCompetitions',
  description: 'Compete, win, and use your Pi!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="flex flex-col min-h-screen">{children}</main>
        <Footer />

        {/* ✅ Removed synchronous script - replace with async if needed */}
        {/* <script src="/some-script.js" async></script> */}
      </body>
    </html>
  )
}
