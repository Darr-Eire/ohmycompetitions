import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { PiAuthProvider } from '@context/PiAuthContext';
import Layout from '@components/Layout';

import '@fontsource/orbitron';
import 'styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => (
    <Layout>{page}</Layout>
  ));

  return (
    <SessionProvider session={session}>
      <PiAuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </PiAuthProvider>
    </SessionProvider>
  );
}
