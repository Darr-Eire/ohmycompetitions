import '../globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* your header here */}
        {children}
        {/* your footer here */}
      </body>
    </html>
  );
}
