'use client';

import '../styles/globals.css';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/Layout';
import { PiAuthProvider } from '../context/PiAuthContext';

const APP_ID = process.env.NEXT_PUBLIC_PI_APP_ID || '';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  const installed = useRef(false);

  // Install a single readiness promise on window; any module can await it.
  function installReadyPi() {
    if (typeof window === 'undefined') return;
    const w = window;

    if (typeof (w).__readyPi === 'function') return; // already installed

    w.__readyPi = () =>
      new Promise((resolve, reject) => {
        function initNow() {
          try {
            if (!w.Pi) return reject(new Error('SDK missing'));
            if (w.__piInitDone) return resolve(w.Pi); // already init’d

            w.Pi.init({
              version: '2.0',
              sandbox: false,            // MAINNET
              appId: APP_ID || undefined // pass app id if set
            });
            w.__piInitDone = true;
            console.info('[Pi] init OK', { appIdPresent: !!APP_ID, sandbox: false });
            resolve(w.Pi);
          } catch (e) {
            reject(e);
          }
        }

        // If SDK is present, init immediately; otherwise load it, then init.
        if (w.Pi) return initNow();

        const s = document.createElement('script');
        s.src = 'https://sdk.minepi.com/pi-sdk.js';
        s.async = true;
        s.onload = initNow;
        s.onerror = () => reject(new Error('Failed to load Pi SDK'));
        document.head.appendChild(s);

        // Hard timeout
        setTimeout(() => {
          if (!w.Pi) reject(new Error('Pi SDK load timeout'));
        }, 15000);
      });
  }

  useEffect(() => {
    if (installed.current) return;
    installed.current = true;
    installReadyPi();
  }, []);

  return (
    <PiAuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      {/* Preferred preloader (Pi Browser often injects Pi anyway) */}
      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => {
          try { installReadyPi(); } catch {}
        }}
      />

      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
