import React, { ReactElement, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { PiAuthProvider } from '@context/PiAuthContext';
import Layout from '@components/Layout';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import 'styles/globals.css';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Example auth check
      const response = await fetch('/api/auth/status');
      const data = await response.json();

      if (!data.isAuthenticated) {
        router.push('/login'); // or your Pi login initiation
      }
    };

    checkAuth();
  }, [router]);

  return <Component {...pageProps} />;
}  