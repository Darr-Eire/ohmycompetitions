import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'OhMyCompetitions',
  description: 'Win Pi giveaways daily!',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Pi SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `Pi.init({ version: "2.0", sandbox: true });`,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-white text-gray-800">
        {children}
      </body>
    </html>
  )
}
