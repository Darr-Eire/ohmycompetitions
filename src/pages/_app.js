// File: src/pages/_app.js
'use client';

import { Analytics } from '@vercel/analytics/next';
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

  // Why: install a single readiness promise; avoid duplicate <script> tags.
  function installReadyPi() {
    if (typeof window === 'undefined') return;
    const w = window;

    if (typeof w.__readyPi === 'function') return; // already installed

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
            // console.info('[Pi] init OK', { appIdPresent: !!APP_ID, sandbox: false });
            resolve(w.Pi);
          } catch (e) {
            reject(e);
          }
        }

        // If SDK is present, init immediately; otherwise ensure a single loader tag.
        if (w.Pi) return initNow();

        // De-dupe: if Next/Script already added it, don't add a second one.
        const existing = document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]');
        if (!existing) {
          const s = document.createElement('script');
          s.src = 'https://sdk.minepi.com/pi-sdk.js';
          s.async = true;
          s.onload = initNow;
          s.onerror = () => reject(new Error('Failed to load Pi SDK'));
          document.head.appendChild(s);
        }

        // If a script tag exists (from Next/Script), wait for it to load.
        if (existing) {
          existing.addEventListener('load', initNow, { once: true });
          existing.addEventListener('error', () => reject(new Error('Failed to load Pi SDK')), {
            once: true
          });
        }

        // Hard timeout fallback
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
        {/* Canonical viewport lives in _app per Next docs (no _document warning) */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
        />
      </Head>

      {/* Preferred preloader; onLoad reuses the same readiness promise */}
      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => {
          try {
            installReadyPi();
          } catch {
            /* no-op */
          }
        }}
      />

      {getLayout(<Component {...pageProps} />)}
      <Analytics />
    </PiAuthProvider>
  );
}
