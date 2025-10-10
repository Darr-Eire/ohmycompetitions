'use client';

import '../styles/globals.css';
import { useEffect } from 'react';
import Script from 'next/script';
import Layout from '../components/Layout';
import { PiAuthProvider } from '../context/PiAuthContext';

const APP_ID = process.env.NEXT_PUBLIC_PI_APP_ID;                 // e.g. "ohmycompetitions2304" (TESTNET)
const IS_SANDBOX = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true'; // "true" / "false"

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  // Fallback: if the script tag loaded earlier (cached) and we re-mounted
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi && !window.__piInitDone) {
      try {
        window.Pi.init({
          version: '2.0',
          appId: APP_ID,
          sandbox: IS_SANDBOX,
        });
        window.__piInitDone = true;
        // console.log('[Pi] init via useEffect', { APP_ID, IS_SANDBOX });
      } catch (e) {
        console.error('[Pi] init error (useEffect):', e);
      }
    }
  }, []);

  const handlePiSdkLoad = () => {
    if (!window.__piInitDone && window.Pi) {
      try {
        window.Pi.init({
          version: '2.0',
          appId: APP_ID,
          sandbox: IS_SANDBOX,
        });
        window.__piInitDone = true;
        // console.log('[Pi] init via Script onLoad', { APP_ID, IS_SANDBOX });
      } catch (e) {
        console.error('[Pi] init error (onLoad):', e);
      }
    }
  };

  return (
    <PiAuthProvider>
      {/* Load the Pi SDK once, then init with sandbox flag */}
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
