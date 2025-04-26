"use client";

import { useState } from "react";

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    // Ensure Pi SDK is injected in head and initialized
    if (typeof window.Pi?.authenticate !== "function") {
      setError("Pi SDK not available. Open in Pi Browser.");
      setLoading(false);
      return;
    }

    try {
      const auth = await window.Pi.authenticate({
        version: "2.0",
        permissions: ["username", "wallet_address"],
      });

      if (!auth || !auth.accessToken) {
        throw new Error("No access token returned");
      }

      // Call your GET endpoint, pass accessToken in query
      const resp = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(
          auth.accessToken
        )}`,
        {
          method: "GET",
          credentials: "include", // carry the session cookie
        }
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(
          body.error || `Login failed: ${resp.status} ${resp.statusText}`
        );
      }

      const data = await resp.json();
      console.log("Logged in user:", data.user);
      // … your post-login logic here …

    } catch (e: any) {
      console.error("Pi login error:", e);
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading
        ? "Waiting for Pi SDK..."
        : error
        ? error
        : "Login with Pi Network"}
    </button>
  );
}
