import { PiAuthProvider } from '@/context/PiAuthContext';

export default function RootLayout({ children }) {
  return (
    <PiAuthProvider>
      {children}
    </PiAuthProvider>
  );
}
