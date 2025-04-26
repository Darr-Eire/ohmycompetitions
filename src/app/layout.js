// src/app/layout.js
import '../globals.css';
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Pi SDK must live here */}
        <Script
          src="https://sdk.minepi.com/widget.js"
          strategy="beforeInteractive"
        />
      </head>
      <body> … </body>
    </html>
  );
}
