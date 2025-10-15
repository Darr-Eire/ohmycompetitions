import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  function initPiOnce(where = 'unknown') {
    if (typeof window === 'undefined' || !window.Pi) return;
    alert("no undef 333")
    try {
      window.Pi.init({ version: '2.0', sandbox: false });
      alert("init done")
      window.__piInitDone = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[Pi] init error @ ${where}:`, e?.message || e);
    }
  }

  return (
    <Html lang="en">

      <Head />
      <body>
        <Main />
        <NextScript />
      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => initPiOnce('Script.onLoad')}
      />
      </body>
    </Html>
  );
}