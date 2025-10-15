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
  const initedRef = useRef(false);

  const tryInit = (where) => {
    if (typeof window === 'undefined') return;
    const Pi = window.Pi;
    if (!Pi || initedRef.current) return;
    try {
      Pi.init({ version: '2.0', appId: APP_ID, sandbox: isSandbox() });
      initedRef.current = true;
      window.__piInitDone = true;
      console.info(`[Pi] init OK @ ${where}`, { sandbox: isSandbox(), appId: !!APP_ID });
    } catch (e) {
      console.error(`[Pi] init error @ ${where}:`, e?.message || e);
    }
  };

  useEffect(() => {
    // 1) If Pi already injected by Pi Browser
    tryInit('useEffect(preloaded)');

    // 2) Safety net: if SDK didn’t load yet, inject raw <script> after 1s
    const t = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.Pi) {
        const existing = document.querySelector('script[src*="sdk.minepi.com/pi-sdk.js"]');
        if (!existing) {
          const s = document.createElement('script');
          s.src = 'https://sdk.minepi.com/pi-sdk.js';
          s.async = true;
          s.onload = () => tryInit('manual script onload');
          s.onerror = () => console.error('[Pi] SDK script failed to load');
          document.head.appendChild(s);
        }
      }
    }, 1000);

    // 3) Retry init a few times in case of iframe timing
    let tries = 0;
    const tick = setInterval(() => {
      if (initedRef.current) { clearInterval(tick); return; }
      tryInit(`retry#${++tries}`);
      if (tries >= 10) clearInterval(tick);
    }, 500);

    return () => { clearTimeout(t); clearInterval(tick); };
  }, []);

  return (
    <PiAuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      {/* Primary load path */}
      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => tryInit('Script.onLoad')}
      />

      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}