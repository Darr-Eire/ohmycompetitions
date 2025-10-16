"use client";
import { useState, useEffect } from "react";
import { usePiAuth } from "../context/PiAuthContext";

export default function PiLoginButton({ onSuccess }) {
  const { sdkReady, loginWithPi, loading, error } = usePiAuth();
  const [label, setLabel] = useState("Loading Pi SDK…");

  useEffect(() => {
    setLabel(sdkReady ? (loading ? "Logging in…" : "Login with Pi") : "Loading Pi SDK…");
  }, [sdkReady, loading]);

  const handleClick = async () => {
    if (!sdkReady || loading) return;
    const res = await loginWithPi();
    if (res.ok && typeof onSuccess === "function") onSuccess(res.me);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!sdkReady || loading}
        className="neon-button px-3 py-2 text-sm w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {label}
      </button>
      {error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null}
    </>
  );
}
