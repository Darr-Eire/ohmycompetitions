import React, { ReactNode, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { PiAuthProvider } from '@context/PiAuthContext';
import Layout from '@components/Layout';
import { useRouter } from 'next/router';
import 'styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [piLoaded, setPiLoaded] = useState(false);

  useEffect(() => {
    const loadPiSdk = () => {
      if (document.getElementById('pi-sdk')) return;
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.id = 'pi-sdk';
      script.onload = () => setPiLoaded(true);
      document.body.appendChild(script);
    };

    loadPiSdk();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!piLoaded) return;

      const response = await fetch('/api/auth/status');
      const data = await response.json();

      if (!data.isAuthenticated) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [piLoaded, router]);

  if (!piLoaded) {
    return <div>Loading Pi SDK...</div>;
  }

  return (
    <SessionProvider session={pageProps.session}>
      <PiAuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PiAuthProvider>
    </SessionProvider>
  );
}

export default MyApp;
