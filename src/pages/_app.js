import React, { ReactElement, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { PiAuthProvider } from '@context/PiAuthContext';
import Layout from '@components/Layout';

import '@fontsource/orbitron';
import 'styles/globals.css';

type NextPageWithLayout = {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = {
  Component: NextPageWithLayout;
  pageProps: {
    session?: any; // Replace with appropriate session type from NextAuth
    [key: string]: any;
  };
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={session}>
      <PiAuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </PiAuthProvider>
    </SessionProvider>
  );
}

