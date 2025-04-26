// src/app/layout.js
export const metadata = {
    title: 'OhMyCompetitions',
    description: 'A Pi-powered competitions platform',
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head />
        <body>
          {children}
        </body>
      </html>
    );
  }
  