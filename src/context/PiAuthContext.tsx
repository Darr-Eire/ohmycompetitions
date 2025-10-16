"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { authWithPiNetwork } from "lib/pi/PiIntegration";

type Me = {
  username?: string;
  [k: string]: any;
};

type Ctx = {
  sdkReady: boolean;
  user: Me | null;
  jwt: string | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<{ ok: boolean; me?: Me; token?: string | null; error?: string }>;
  loginWithPi: () => Promise<{ ok: boolean; me?: Me; token?: string | null; error?: string }>;
  logout: () => void;
};

export const PiAuthContext = createContext<Ctx | null>(null);

/** Wait up to `timeoutMs` for window.__readyPi to appear, then resolve it. */
async function readyPi(timeoutMs = 15000): Promise<any> {
  const start = Date.now();
  while (true) {
    const w = typeof window !== "undefined" ? (window as any) : undefined;
    if (w && typeof w.__readyPi === "function") {
      return await w.__readyPi(); // resolves to window.Pi after Pi.init
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("Pi SDK not injected yet");
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}

export function PiAuthProvider({ children }: { children: React.ReactNode }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState<Me | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initOnce = useRef(false);

  // Restore local cache (non-blocking)
  useEffect(() => {
    try {
      const token = localStorage.getItem("omc_jwt");
      if (token) setJwt(token);
      const cachedUser = localStorage.getItem("omc_user");
      if (cachedUser) setUser(JSON.parse(cachedUser));
    } catch {}
  }, []);

  // Become ready once __readyPi() resolves
  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;
    (async () => {
      try {
        await readyPi();      // <- blocks until the SDK is really usable
        setSdkReady(true);
        setError(null);
        console.info("[PiAuth] SDK ready ✅");
      } catch (e: any) {
        console.error("[PiAuth] SDK failed to become ready:", e);
        setError(e?.message || "Pi SDK init failed");
        setSdkReady(false);
      }
    })();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      await readyPi(); // defensive
      const result = await authWithPiNetwork(); // your existing helper
      const me = (result as any) ?? null;

      if (me) {
        try {
          localStorage.setItem("omc_user", JSON.stringify(me));
          // If you mint a backend token, persist it here:
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

  const value: Ctx = {
    sdkReady,
    user,
    jwt,
    loading,
    error,
    login,
    loginWithPi: login,
    logout,
  };

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>;
}

export const usePiAuth = () => {
  const ctx = useContext(PiAuthContext);
  if (!ctx) throw new Error("usePiAuth must be used within PiAuthProvider");
  return ctx;
};
