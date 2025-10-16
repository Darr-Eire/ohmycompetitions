"use client";
import { authWithPiNetwork } from "@lib/pi/PiIntegration";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export const PiAuthContext = createContext(null);

async function waitForPiSDK(maxMs = 8000) {
  const start = Date.now();
  while (typeof window === "undefined" || !window.Pi) {
    if (Date.now() - start > maxMs) throw new Error("Pi SDK not loaded");
    await new Promise((r) => setTimeout(r, 120));
  }
  return window.Pi;
}
async function ensurePiInit({ sandbox = false, network = "Pi Testnet" } = {}) {
  const Pi = await waitForPiSDK();
  if (!(window as any).__piInitDone) {
    await Pi.init({ version: "2.0", sandbox: false });
    (window as any).__piInitDone = true;
  }
  return Pi;
}

export function PiAuthProvider({ children }: { children: React.ReactNode }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initOnce = useRef(false);
  function initPiOnce(where = "unknown") {
    if (typeof window === "undefined" || !window.Pi) return;
    alert("no undef 3");
    try {
      window.Pi.init({ version: "2.0", sandbox: false });
      alert("init done");

      // eslint-disable-next-line no-console
      console.info(`[Pi] init OK @ ${where}`, {
        sandbox: false,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
    }
  }
  useEffect(() => {
    try {
      const token = localStorage.getItem("omc_jwt");
      if (token) setJwt(token as any);
      const cachedUser = localStorage.getItem("omc_user");
      if (cachedUser) setUser(JSON.parse(cachedUser));
    } catch {}
  }, []);

  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;
    (async () => {
      try {
        await ensurePiInit({ sandbox: false });
        setSdkReady(true);
      } catch (e: any) {
        console.error("[Pi] init failed:", e);
        setError(e.message || "Pi SDK init failed");
      }
    })();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authWithPiNetwork();

      const me = result as any;
      if (me) {
        try {
          localStorage.setItem("omc_user", JSON.stringify(me));
        } catch {}
        setUser(me);
      }
      // optional JWT if you mint one later
      return { ok: true, me, token: null };
    } catch (e: any) {
      const raw = e?.message || "Login failed";
      const friendly = /user canceled/i.test(raw)
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

  const loginWithPi = login; // alias for your Header
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
