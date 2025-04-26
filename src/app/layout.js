// src/app/layout.js
import '../globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Header, content, footer… */}
        {children}
      </body>
    </html>
  );
}
