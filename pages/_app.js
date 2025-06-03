import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { PiAuthProvider } from '@context/PiAuthContext';
import Layout from '@components/Layout';

import '@fontsource/orbitron'; // Font
import 'styles/globals.css'; // ✅ Correct path using "@/" alias

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
