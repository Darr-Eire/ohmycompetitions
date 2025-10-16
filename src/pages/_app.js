// src/pages/_app.js
'use client';

import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import Layout from 'components/Layout';
import { PiAuthProvider } from 'context/PiAuthContext';

const PI_ENV = process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || 'testnet';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <PiAuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      {/* Expose env early so init can choose sandbox correctly */}
      <Script id="pi-env" strategy="afterInteractive">
        {`window.__PI_ENV__ = ${JSON.stringify(PI_ENV)};`}
      </Script>

      {/* Load the Pi SDK once */}
      <Script id="pi-sdk" src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />

      {/* Initialize ONCE and expose a global readiness promise to avoid first-click failures */}
      <Script id="pi-init" strategy="afterInteractive">
        {`
(function () {
  if (!window.__piReadyPromise) {
    window.__piReadyPromise = new Promise((resolve, reject) => {
      const start = Date.now();
      const timeoutMs = 15000;

      function tryInit() {
        try {
          if (window.Pi && typeof window.Pi.init === 'function') {
            const env = (window.__PI_ENV__ || 'testnet').toLowerCase();
            const sandbox = env !== 'mainnet'; // true on testnet/sandbox, false on mainnet
            window.Pi.init({ version: '2.0', sandbox });
            window.__piInitDone = true;
            // confirm key methods exist before resolving
            if (typeof window.Pi.authenticate === 'function') {
              resolve(window.Pi);
              return;
            }
          }
        } catch (e) {
          reject(e);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Pi SDK init timeout'));
        } else {
          requestAnimationFrame(tryInit);
        }
      }

      tryInit();
    });
  }
  // global helper to await readiness anywhere in the app
  window.__readyPi = function () { return window.__piReadyPromise; };
})();
        `}
      </Script>

      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
