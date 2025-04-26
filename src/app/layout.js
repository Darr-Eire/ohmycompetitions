// src/app/layout.js
import '../globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'OhMyCompetitions',
  description: 'Pi Network competition platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Pi widget SDK ― makes window.Pi.authenticate() available */}
        <Script
          src="https://sdk.minepi.com/widget.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">OhMyCompetitions</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow container mx-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-blue-600 text-white p-4">
          <div className="container mx-auto text-center">
            © {new Date().getFullYear()} OhMyCompetitions. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

