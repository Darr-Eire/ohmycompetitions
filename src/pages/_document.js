// File: src/pages/_document.js
// NOTE: This is a server component. Do NOT add 'use client' here.
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  // Keep a single Pi SDK loader; everyone else should await window.__readyPi()
  const loader = `
(function () {
  if (typeof window === "undefined") return;
  var w = window;
  if (typeof w.__readyPi === "function") return;

  w.__readyPi = (function () {
    let done = false;
    let cachedPi = null;
    return function() {
      if (done) return Promise.resolve(cachedPi);
      return new Promise(function (resolve) {
        if (w.Pi) { done = true; cachedPi = w.Pi; resolve(w.Pi); return; }
        var s = document.createElement("script");
        s.src = "https://sdk.minepi.com/pi-sdk.js";
        s.async = true;
        s.onload = function () { done = true; cachedPi = w.Pi; resolve(w.Pi); };
        document.head.appendChild(s);
      });
    };
  })();
})();
  `.trim();

  return (
    <Html lang="en" className="h-full">
      <Head>
        {/* Single, canonical viewport with safe-area support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
        />
        <meta name="theme-color" content="#000814" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Optional font preload (safe) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        />
      </Head>

      <body className="h-full bg-[#000814] text-[#E6F5FF]">
        <Main />
        <NextScript />
        {/* Inject the Pi SDK loader once, after NextScript */}
        <script dangerouslySetInnerHTML={{ __html: loader }} />
      </body>
    </Html>
  );
}
