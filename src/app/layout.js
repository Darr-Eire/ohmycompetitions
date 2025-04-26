// src/app/layout.js
import '../globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">OhMyCompetitions</h1>
          </div>
        </header>

        {/* Main content */}
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
