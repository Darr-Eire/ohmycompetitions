'use client';

import '../styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/Layout';
import { PiAuthProvider } from '../context/PiAuthContext';

const APP_ID = process.env.NEXT_PUBLIC_PI_APP_ID;
const IS_SANDBOX = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi && !window.__piInitDone) {
      try {
        window.Pi.init({ version: '2.0', appId: APP_ID, sandbox: IS_SANDBOX });
        window.__piInitDone = true;
      } catch (e) {
        console.error('[Pi] init error (useEffect):', e);
      }
    }
  }, []);

  const handlePiSdkLoad = () => {
    if (!window.__piInitDone && window.Pi) {
      try {
        window.Pi.init({ version: '2.0', appId: APP_ID, sandbox: IS_SANDBOX });
        window.__piInitDone = true;
      } catch (e) {
        console.error('[Pi] init error (onLoad):', e);
      }
    }
  };

  return (
    <PiAuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={handlePiSdkLoad}
      />

      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
