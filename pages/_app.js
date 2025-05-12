import React from 'react';
import { SessionProvider } from 'next-auth/react';
import Layout from '@/components/layout';
import { PiAuthProvider } from '@/context/PiAuthContext';
import '@fontsource/orbitron';
import 'styles/globals.css'; // ✅ Note the "@/styles" instead of just "styles"

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <PiAuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PiAuthProvider>
    </SessionProvider>
  );
}
