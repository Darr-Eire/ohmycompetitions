"use client";

import { authWithPiNetwork } from "lib/pi/PiIntegration";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export const PiAuthContext = createContext(null);

// Await the global readiness promise created in _app.js
async function readyPi(timeoutMs = 15000) {
  const w = (typeof window !== "undefined" ? (window as any) : undefined);
  if (!w || typeof w.__readyPi !== "function") {
    throw new Error("Pi SDK not injected yet");
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const killer = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error("Pi ready timeout")), timeoutMs);
  });
  try {
    const Pi = await Promise.race([w.__readyPi(), killer]);
    return Pi;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function PiAuthProvider({ children }: { children: React.ReactNode }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initOnce = useRef(false);

  // restore cached auth (non-blocking)
  useEffect(() => {
    try {
      const token = localStorage.getItem("omc_jwt");
      if (token) setJwt(token);
      const cachedUser = localStorage.getItem("omc_user");
      if (cachedUser) setUser(JSON.parse(cachedUser));
    } catch {}
  }, []);

  // Single source of truth: mark ready after __readyPi() resolves
  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;

    (async () => {
      try {
        await readyPi(); // <-- no local Pi.init here
        setSdkReady(true);
      } catch (e: any) {
        console.error("[Pi] SDK failed to become ready:", e);
        setError(e?.message || "Pi SDK init failed");
        setSdkReady(false);
      }
    })();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure SDK really is ready (defensive)
      await readyPi();

      const result = await authWithPiNetwork();
      const me = result as any;

      if (me) {
        try {
          localStorage.setItem("omc_user", JSON.stringify(me));
          // If you mint your own backend JWT later, set it here:
          // localStorage.setItem("omc_jwt", token);
        } catch {}
        setUser(me);
      }

      return { ok: true, me, token: null };
    } catch (e: any) {
      const raw = e?.message || "Login failed";
      const friendly = /user canceled|user cancelled/i.test(raw)
        ? "Login cancelled by user."
        : raw;
      setError(friendly);
      console.error("[PiAuth] login error:", raw);
      return { ok: false, error: friendly };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("omc_jwt");
      localStorage.removeItem("omc_user");
    } catch {}
    setJwt(null);
    setUser(null);
    setError(null);
  };

  const loginWithPi = login;

  const value = {
    sdkReady,
    user,
    jwt,
    loading,
    error,
    login,
    loginWithPi,
    logout,
  };

  return (
    <PiAuthContext.Provider value={value as any}>
      {children}
    </PiAuthContext.Provider>
  );
}

export const usePiAuth = () => useContext(PiAuthContext);
