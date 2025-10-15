'use client';

import '../styles/globals.css';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/Layout';
import { PiAuthProvider } from '../context/PiAuthContext';

const APP_ID = process.env.NEXT_PUBLIC_PI_APP_ID || '';
function isSandbox() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  const flag = String(process.env.NEXT_PUBLIC_PI_SANDBOX || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet' || flag === 'true' || flag === '1';
}

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  const initDoneRef = useRef(false);

  function initPiOnce(where = 'unknown') {
    if (typeof window === 'undefined' || !window.Pi || initDoneRef.current) return;
    alert("no undef")
    try {
      window.Pi.init({ version: '2.0', sandbox: isSandbox(), appId: APP_ID });
      initDoneRef.current = true;
      window.__piInitDone = true;
      // eslint-disable-next-line no-console
      console.info(`[Pi] init OK @ ${where}`, { sandbox: isSandbox(), appIdPresent: !!APP_ID });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[Pi] init error @ ${where}:`, e?.message || e);
    }
  }

  useEffect(() => {
    // If Pi Browser already injected window.Pi, init immediately.
    if (typeof window !== 'undefined' && window.Pi) initPiOnce('useEffect(preloaded)');
  }, []);

  return (
    <PiAuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      {/* Load SDK as early as possible in the client */}
      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => initPiOnce('Script.onLoad')}
      />

      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}