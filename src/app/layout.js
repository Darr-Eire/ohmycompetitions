import '../globals.css';

export const metadata = {
  title: 'OhMyCompetitions',
  description: 'Pi Network competition platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
