// PATH: src/pages/index.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from "react-icons/fa6";
import { authWithPiNetwork, CreatePayment } from "@lib/pi/PiIntegration";

export default function IndexPage() {
  const [sdkReady, setSdkReady] = useState(false);
  const [busyAuth, setBusyAuth] = useState(false);
  const [busyPay, setBusyPay] = useState(false);

  const features = [
    { icon: "🔄", text: "Daily Competitions", href: "/competitions/daily" },
    { icon: "🚀", text: "Launch Week", href: "/competitions/launch-week" },
    { icon: "🎁", text: "Pi Giveaways", href: "/competitions/pi" },
    { icon: "🏆", text: "Pi Stages", href: "/battles" },
    { icon: "🎮", text: "Mini Games", href: "/try-your-luck" },
    { icon: "❓", text: "Mystery Features", href: "" },
  ];

  // Use the value that _app.js placed on window; fallback to envs if needed.
// Use the value that _app.js placed on window; fallback to envs if needed.
const isSandboxLike = (() => {
  if (typeof window !== "undefined" && (window as any)["__PI_ENV__"] != null) {
    return String((window as any)["__PI_ENV__"]).toLowerCase() !== "mainnet";
  }
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || "testnet")
    .toLowerCase()
    .trim();
  return raw !== "mainnet";
})();


  // Helper to await the singleton readiness promise that _app.js created
 // Helper to await the singleton readiness promise that _app.js created
async function readyPi(timeoutMs = 15000) {
  if (typeof window === "undefined" || typeof (window as any)["__readyPi"] !== "function") {
    throw new Error("Pi SDK not injected yet");
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const killer = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error("Pi ready timeout")), timeoutMs);
  });
  try {
    const Pi = await Promise.race([(window as any)["__readyPi"](), killer]);
    return Pi;
  } finally {
    if (timer) clearTimeout(timer);
  }
}


  useEffect(() => {
    let alive = true;
    readyPi().then(() => alive && setSdkReady(true)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const testPiPayment = async () => {
    try {
      setBusyPay(true);
      await readyPi();
      // Your helper handles the actual payment; we just ensure SDK is ready first.
      await CreatePayment("", 10, "First test", () => {
        // keep your UI feedback pattern
        alert("Thanking you for your payment to OMC");
      });
    } catch (e) {
      console.error("Payment error", e);
      alert("Payment failed to start");
    } finally {
      setBusyPay(false);
    }
  };

  const testAuth = async () => {
    try {
      setBusyAuth(true);
      await readyPi();
      await authWithPiNetwork(); // keeps your existing integration
    } catch (e) {
      console.error("Auth error", e);
      alert("Auth failed");
    } finally {
      setBusyAuth(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a1024] text-white px-2 py-0 overflow-y-auto">
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-8">
        {/* Main Box */}
        <div className="bg-[#0f1b33] border border-cyan-400 rounded-3xl p-6 shadow-[0_0_30px_#00f0ff88] flex flex-col gap-5">
          {/* Title + Tagline */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide leading-tight">
              Oh My Competitions
            </h1>
            <p className="text-white text-sm mt-1">
              Built by Pioneers. For Pioneers. All Powered by Pi.
            </p>
          </div>

          {/* About OMC Section */}
          <div className="bg-[#0a1024]/90 border border-cyan-600 rounded-lg px-4 py-4 shadow-[0_0_20px_#00fff055] text-sm leading-relaxed">
            <h2 className="text-base font-bold text-cyan-300 mb-2 text-center">
              What is Oh My Competitions
            </h2>
            <p className="text-white">
              OMC is a decentralized platform where Pioneers compete in fun,
              fair competitions using Pi as currency. Every experience is
              powered by Pi.
            </p>
            <ul className="list-disc pl-5 mt-3 text-cyan-200 space-y-1">
              <li>🔁 Peer-to-peer Pi transactions</li>
              <li>🎫 Unique, trackable ticket IDs</li>
              <li>🤝 Giftable tickets and Pi vouchers</li>
              <li>🎉 Multiple winners, real rewards</li>
            </ul>
          </div>

          <Link
            href="/tutorial"
            className="text-center block mx-auto text-sm text-cyan-300 underline hover:text-cyan-100"
          >
            View Tutorial
          </Link>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-1 text-sm">
            {features.map((f, i) => (
              <Link
                key={i}
                href={f.href}
                className="flex items-center gap-2 px-3 py-2 bg-[#0a1024] border border-cyan-500 rounded-md shadow-[0_0_8px_#00f0ff33] hover:border-cyan-300 transition"
              >
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </Link>
            ))}
          </div>

          {/* CTA & Dev Buttons */}
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/homepage?welcome=1"
              className="pulse-button block w-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-md text-center text-base"
            >
              Let’s Go
            </Link>

            <button
              onClick={testPiPayment}
              disabled={!sdkReady || busyPay}
              className={`pulse-button block w-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-md text-center text-base ${
                (!sdkReady || busyPay) ? "opacity-60 cursor-not-allowed" : ""
              }`}
              aria-busy={busyPay}
              title={sdkReady ? "Test Pi payment" : "Loading Pi SDK…"}
            >
              {sdkReady ? (busyPay ? "Starting payment…" : "Test Pi payment") : "Loading Pi SDK…"}
            </button>

            <button
              onClick={testAuth}
              disabled={!sdkReady || busyAuth}
              className={`pulse-button block w-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-md text-center text-base ${
                (!sdkReady || busyAuth) ? "opacity-60 cursor-not-allowed" : ""
              }`}
              aria-busy={busyAuth}
              title={sdkReady ? "Test Pi auth" : "Loading Pi SDK…"}
            >
              {sdkReady ? (busyAuth ? "Authorizing…" : "Test Pi Auth") : "Loading Pi SDK…"}
            </button>

            {/* Dev quick link (why: fast access to payment test page; shown only on non-mainnet) */}
            {isSandboxLike && (
              <Link
                href="/dev/pi-quick-test"
                className="block w-full text-center text-xs text-cyan-300 underline hover:text-cyan-100"
              >
                Pi Dev: Quick Test
              </Link>
            )}
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 text-2xl">
          <Link href="https://twitter.com" target="_blank">
            <FaXTwitter className="hover:text-cyan-400 transition" />
          </Link>
          <Link href="https://facebook.com" target="_blank">
            <FaFacebookF className="hover:text-cyan-400 transition" />
          </Link>
          <Link href="https://discord.com" target="_blank">
            <FaDiscord className="hover:text-cyan-400 transition" />
          </Link>
          <Link href="https://instagram.com" target="_blank">
            <FaInstagram className="hover:text-cyan-400 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Keep simple (no TS types here)
IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
};
