// src/pages/_document.tsx (or .js)
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  // IMPORTANT: Keep this tiny loader as the *only* place that injects/initializes the Pi SDK.
  const loader = `
(function () {
  if (typeof window === "undefined") return;
  var w = window;
  // If we’ve already set up the singleton, do nothing.
  if (typeof w.__readyPi === "function") return;

  // Create a single readiness promise that everyone can await.
  w.__readyPi = (function () {
    let done = false;
    let cachedPi = null;

    return function __readyPiInternal() {
      if (done && cachedPi) return Promise.resolve(cachedPi);

      return new Promise(function (resolve, reject) {
        function initIfPossible() {
          try {
            if (w.Pi && typeof w.Pi.init === "function") {
              // Mainnet by default; set your App ID from env if present.
              w.Pi.init({
                version: "2.0",
                sandbox: false,
                appId: ${JSON.stringify(process.env.NEXT_PUBLIC_PI_APP_ID || "")}
              });
              done = true;
              cachedPi = w.Pi;
              resolve(w.Pi);
              return true;
            }
          } catch (e) {
            reject(e);
            return true;
          }
          return false;
        }

        // If the SDK is already on the page and can be inited, do it.
        if (initIfPossible()) return;

        // Otherwise inject the SDK script once.
        var existing = document.getElementById("pi-sdk-singleton");
        if (!existing) {
          var s = document.createElement("script");
          s.id = "pi-sdk-singleton";
          s.src = "https://sdk.minepi.com/pi-sdk.js";
          s.async = true;
          s.onload = function () {
            if (!initIfPossible()) reject(new Error("Pi SDK loaded but Pi.init unavailable"));
          };
          s.onerror = function () {
            reject(new Error("Failed to load Pi SDK"));
          };
          document.head.appendChild(s);
        } else {
          // If it exists but hasn't fired yet, wait for it to load
          existing.addEventListener("load", function () {
            if (!initIfPossible()) reject(new Error("Pi SDK loaded but Pi.init unavailable"));
          });
          existing.addEventListener("error", function () {
            reject(new Error("Failed to load Pi SDK"));
          });
        }
      });
    };
  })();
})();
  `.trim();

  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />

        {/* Portal mount for modals (kept server-rendered to avoid event blockers) */}
        <div id="modal-root" className="relative z-[10000]" />

        <NextScript />
        {/* Expose window.__readyPi() and inject the SDK once */}
        <script dangerouslySetInnerHTML={{ __html: loader }} />
      </body>
    </Html>
  );
}
