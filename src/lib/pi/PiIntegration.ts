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

/** Await the singleton created in _app.js. */
async function readyPi(timeoutMs = 15000): Promise<any> {
  const w: any = typeof window !== "undefined" ? window : undefined;
  if (!w || typeof w.__readyPi !== "function") {
    throw new Error("Pi SDK not injected yet");
  }
  let t: ReturnType<typeof setTimeout> | undefined;
  const killer = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error("Pi ready timeout")), timeoutMs);
  });
  try {
    const Pi = await Promise.race([w.__readyPi(), killer]);
    return Pi;
  } finally {
    if (t) clearTimeout(t);
  }
}

// Handle incomplete payment
export async function onIncompletePaymentFound(paymentDTO: PaymentDTO) {
  try {
    alert("incomplete payment found " + JSON.stringify(paymentDTO));
    const id = paymentDTO?.identifier;
    const tx = paymentDTO?.transaction?.txid;
    if (id && tx) {
      await piNetworkService.completePiNetworkPayment(id, tx);
      alert("incomplete payment completed.");
    } else if (id) {
      // Optional: cancel to clean server state
      // await piNetworkService.cancelPiNetworkPayment(id);
      console.info("[Pi] Incomplete payment without txid; pending", { id });
    }
  } catch (e) {
    console.error("[Pi] onIncompletePaymentFound error", e);
  }
}

// Access token
export async function getUserAccessToken(): Promise<string> {
  const Pi = await readyPi();
  const answer: AuthenticateAnswer = await Pi.authenticate(
    ["username", "payments", "wallet_address"],
    onIncompletePaymentFound
  );
  return answer.accessToken;
}

// Wallet address
export async function getUserWalletAddress(): Promise<string> {
  const Pi = await readyPi();
  const answer: AuthenticateAnswer = await Pi.authenticate(
    ["username", "payments", "wallet_address"],
    onIncompletePaymentFound
  );
  return answer.wallet_address;
}

// Full auth
export async function authWithPiNetwork(): Promise<{
  username: string;
  data: APIAnswerData;
  accessToken: string;
}> {
  const Pi = await readyPi();
  try {
    alert("auth called new version 2.");
    const answer: AuthenticateAnswer = await Pi.authenticate(
      ["username", "payments", "wallet_address"],
      onIncompletePaymentFound
    );
    alert(JSON.stringify(answer));

    const APIAnswer: AxiosResponse<{ data: APIAnswerData }> = await axios.get(
      "https://api.minepi.com/v2/me",
      { headers: { Authorization: "Bearer " + answer.accessToken } }
    );

    return { ...(APIAnswer.data as any), accessToken: answer.accessToken };
  } catch (error: any) {
    const msg =
      error?.message ||
      (typeof error === "string" ? error : JSON.stringify(error));
    alert("Auth error: " + msg);               // <-- shows the real reason
    console.error("[Pi] authenticate failed:", error);
    throw new Error(msg);
  }
}

// Create payment
export async function CreatePayment(
  userUid: string,
  amount: number,
  action: string,
  onPaymentSucceed: Function
): Promise<any> {
  // Ensure auth (your existing flow)
  await authWithPiNetwork();

  const Pi = await readyPi();

  const paymentResult = await Pi.createPayment(
    {
      amount,
      memo: "Donation to Arcadia", // kept as-is
      metadata: { paymentSource: "Arcadia" },
    },
    {
      onReadyForServerApproval: async (paymentId: string) => {
        await piNetworkService.approvePiNetworkPayment(paymentId);
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        await piNetworkService.completePiNetworkPayment(paymentId, txid);
        try {
          onPaymentSucceed();
        } catch {}
      },
      onCancel: async (_paymentId: string) => {
        // user cancelled
      },
      onError: async (err: any, dto: PaymentDTO) => {
        console.error("Payment error:", err);
        if (dto?.identifier) {
          await piNetworkService.cancelPiNetworkPayment(dto.identifier);
        }
      },
    }
  );
  return paymentResult;
}
