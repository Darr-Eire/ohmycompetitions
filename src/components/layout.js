// components/Layout.js
export default function Layout({ children }) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-200 to-blue-500 text-white py-4 px-6">
          <h1 className="text-xl font-bold">My App Header</h1>
        </header>
  
        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>
  
        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-200 to-blue-500 text-white py-4 px-6">
          <p className="text-center text-sm">© 2025 My Company</p>
        </footer>
      </div>
    )
  }
  