// PATH: src/lib/pi/PiIntegration.ts
import axios, { AxiosResponse } from "axios";
import { PiNetworkService } from "./PiBackendIntegration";

interface PaymentDTO {
  identifier: string;
  transaction?: { txid?: string };
}
interface AuthenticateAnswer {
  accessToken: string;
  username: string;
  wallet_address: string;
}
interface APIAnswerData {
  username: string;
  userUid: string;
}

const piNetworkService = PiNetworkService.connect();

/** Await the singleton Pi SDK readiness promise exposed by _app.js */
async function readyPi(timeoutMs = 15000): Promise<any> {
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

/** Small helper so backend calls inside SDK callbacks never hard-block UI */
async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const killer = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms);
  });
  try {
    const res = await Promise.race([p, killer]);
    return res as T;
  } finally {
    if (t) clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Incomplete payment handler
// ---------------------------------------------------------------------------
export async function onIncompletePaymentFound(paymentDTO: PaymentDTO) {
  try {
    console.info("[Pi] Incomplete payment found:", paymentDTO);
    const paymentId = paymentDTO?.identifier;
    const txid = paymentDTO?.transaction?.txid;

    if (paymentId && txid) {
      // Don’t let this block auth indefinitely.
      await withTimeout(
        piNetworkService.completePiNetworkPayment(paymentId, txid),
        8000,
        "completePiNetworkPayment"
      );
      alert("incomplete payment completed.");
    } else if (paymentId) {
      // Optionally cancel to clean state (commented to preserve your flow)
      // await withTimeout(piNetworkService.cancelPiNetworkPayment(paymentId), 8000, "cancelPiNetworkPayment");
      console.info("[Pi] Incomplete payment had no txid; left pending", { paymentId });
    }
  } catch (e) {
    console.error("[Pi] Error in onIncompletePaymentFound", e);
    // Intentionally swallow so authenticate can still finish
  }
}

// ---------------------------------------------------------------------------
// Public helpers (API kept identical)
// ---------------------------------------------------------------------------
export async function getUserAccessToken(): Promise<string> {
  const Pi = await readyPi();
  const answer: AuthenticateAnswer = await Pi.authenticate(
    ["username", "payments", "wallet_address"],
    onIncompletePaymentFound
  );
  return answer.accessToken;
}

export async function getUserWalletAddress(): Promise<string> {
  const Pi = await readyPi();
  const answer: AuthenticateAnswer = await Pi.authenticate(
    ["username", "payments", "wallet_address"],
    onIncompletePaymentFound
  );
  return answer.wallet_address;
}

export async function authWithPiNetwork(): Promise<{
  username: string;
  data: APIAnswerData;
  accessToken: string;
}> {
  const Pi = await readyPi();
  try {
    alert("auth called new version 2.");
    console.time("[PiAuth] authenticate");
    // Add an auth watchdog so the UI never hangs forever
    const authWatchdog = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("authenticate timeout after 25s")), 25000)
    );

    const answer: AuthenticateAnswer = await Promise.race([
      Pi.authenticate(["username", "payments", "wallet_address"], onIncompletePaymentFound),
      authWatchdog,
    ]) as AuthenticateAnswer;

    console.timeEnd("[PiAuth] authenticate");
    alert(JSON.stringify(answer));

    console.time("[PiAuth] /v2/me");
    const APIAnswer: AxiosResponse<{ data: APIAnswerData }> = await withTimeout(
      axios.get("https://api.minepi.com/v2/me", {
        headers: { Authorization: "Bearer " + answer.accessToken, Accept: "application/json" },
        timeout: 12000,
      }),
      15000,
      "GET /v2/me"
    );
    console.timeEnd("[PiAuth] /v2/me");

    // Keep exact return shape you already consume
    return { ...(APIAnswer.data as any), accessToken: answer.accessToken };
  } catch (error: any) {
    console.error("[PiAuth] Error", error);
    alert(error?.message === "authenticate timeout after 25s" ? "Auth timed out" : "error during auth");
    throw new Error("Error while authenticating");
  }
}

export async function CreatePayment(
  userUid: string,
  amount: number,
  action: string,
  onPaymentSucceed: Function
): Promise<any> {
  // Keep your flow: force login before payment
  await authWithPiNetwork();

  const Pi = await readyPi();

  const paymentResult = await Pi.createPayment(
    {
      amount,
      memo: "Donation to Arcadia", // left as-is per your request
      metadata: { paymentSource: "Arcadia" },
    },
    {
      onReadyForServerApproval: async (paymentId: string) => {
        await withTimeout(
          piNetworkService.approvePiNetworkPayment(paymentId),
          10000,
          "approvePiNetworkPayment"
        );
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        await withTimeout(
          piNetworkService.completePiNetworkPayment(paymentId, txid),
          10000,
          "completePiNetworkPayment"
        );
        try { onPaymentSucceed(); } catch {}
      },
      onCancel: async (_paymentId: string) => {
        // user cancelled; no-op
      },
      onError: async (error: any, paymentDTO: PaymentDTO) => {
        console.error("Payment error:", error);
        if (paymentDTO?.identifier) {
          await withTimeout(
            piNetworkService.cancelPiNetworkPayment(paymentDTO.identifier),
            8000,
            "cancelPiNetworkPayment"
          ).catch(() => {});
        }
      },
    }
  );

  return paymentResult;
}
