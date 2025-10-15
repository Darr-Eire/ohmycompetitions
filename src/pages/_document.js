import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  function initPiOnce(where = 'unknown') {
    if (typeof window === 'undefined' || !window.Pi) return;
    alert("no undef 333")
    try {
      window.Pi.init({ version: '2.0', sandbox: false });
      alert("init done")
      window.__piInitDone = true;
    } catch (e:any) {
      // eslint-disable-next-line no-console
      console.error(`[Pi] init error @ ${where}:`, e?.message || e);
    }
  }

  return (
    <Html lang="en">
      <Script
        id="pi-sdk"
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => initPiOnce('Script.onLoad')}
      />

      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}