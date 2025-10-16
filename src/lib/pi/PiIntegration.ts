// PATH: src/lib/pi/PiIntegration.ts (or .js if that's what you use)
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

/**
 * Local helper: await the singleton Pi SDK readiness promise exposed by _app.js.
 * This is the ONLY change your other files needed to avoid first-load failures.
 */
async function readyPi(timeoutMs = 15000): Promise<any> {
  // Cast window to any to avoid TS complaining about __readyPi
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


// Function to handle incomplete payment found
export async function onIncompletePaymentFound(paymentDTO: PaymentDTO) {
  try {
    alert("incomplete payment found " + JSON.stringify(paymentDTO));
    const paymentId = paymentDTO?.identifier;
    const txid = paymentDTO?.transaction?.txid;

    if (paymentId && txid) {
      await piNetworkService.completePiNetworkPayment(paymentId, txid);
      alert("incomplete payment completed.");
    } else if (paymentId) {
      // no tx yet; nothing to complete—optionally cancel on server to clean state
      // await piNetworkService.cancelPiNetworkPayment(paymentId);
      console.info("[Pi] Incomplete payment without txid; left pending.", { paymentId });
    }
  } catch (e) {
    console.error("[Pi] Error handling incomplete payment", e);
  }
}

// Function to get user access token
export async function getUserAccessToken(): Promise<string> {
  const Pi = await readyPi();
  try {
    const answer: AuthenticateAnswer = await Pi.authenticate(
      ["username", "payments", "wallet_address"],
      onIncompletePaymentFound
    );
    return answer.accessToken;
  } catch (error) {
    throw error;
  }
}

// Function to get user wallet address
export async function getUserWalletAddress(): Promise<string> {
  const Pi = await readyPi();
  try {
    const answer: AuthenticateAnswer = await Pi.authenticate(
      ["username", "payments", "wallet_address"],
      onIncompletePaymentFound
    );
    return answer.wallet_address;
  } catch (error) {
    throw error;
  }
}

// Function to authenticate with Pi Network
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
      {
        headers: {
          Authorization: "Bearer " + answer.accessToken,
        },
      }
    );

    // Keep exact return shape you already consume
    return { ...(APIAnswer.data as any), accessToken: answer.accessToken };
  } catch (error) {
    console.log(error);
    alert("error during auth");
    throw new Error("Error while authenticating");
  }
}

// Function to create a payment
export async function CreatePayment(
  userUid: string,
  amount: number,
  action: string,
  onPaymentSucceed: Function
): Promise<any> {
  // Ensure user is authenticated first (kept your flow)
  await authWithPiNetwork();

  const Pi = await readyPi();

  const paymentResult = await Pi.createPayment(
    {
      amount: amount,
      memo: "Donation to Arcadia", // left as-is per your request
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
        } catch (_) {}
      },
      onCancel: async (_paymentId: string) => {
        // user cancelled; nothing to do (left as-is)
      },
      onError: async (error: any, paymentDTO: PaymentDTO) => {
        console.error("Payment error:", error);
        if (paymentDTO?.identifier) {
          await piNetworkService.cancelPiNetworkPayment(paymentDTO.identifier);
        }
      },
    }
  );
  return paymentResult;
}
