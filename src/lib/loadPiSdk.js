// src/lib/loadPiSdk.js
let loadingPromise = null;

export async function loadPiSdk() {
  if (typeof window === "undefined") return null;

  // Already loaded → return immediately
  if (window.Pi) return window.Pi;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js"; // Official CDN
    script.async = true;

    script.onload = () => {
      if (window.Pi) {
        console.log("✅ Pi SDK loaded successfully from CDN");
        resolve(window.Pi);
      } else {
        reject(new Error("❌ Pi SDK script loaded but Pi object missing"));
      }
    };

    script.onerror = () => {
      reject(new Error("❌ Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}
