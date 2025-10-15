// ============================================================================
// PATH: src/lib/pi/PiQuickClient.js
// Exposes named exports used by your page.
// ============================================================================
import { readyPi } from 'lib/piClient';
import PiNetworkService from 'lib/pi/PiBackendIntegration';

export function isSandboxEnv() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet';
}

async function ensurePi() {
  // why: guarantees SDK present + initialized (fixes "Call init() first")
  const Pi = await readyPi({ timeoutMs: 10000 });
  if (!Pi) throw new Error('Pi SDK not ready');
  return Pi;
}

/**
 * Called by Pi.authenticate when a previous payment is pending.
 * Logs and attempts to cancel so the user can retry cleanly.
 */
export async function onIncompletePaymentFound(paymentDTO) {
  const id =
    paymentDTO?.identifier ||
    paymentDTO?.id ||
    paymentDTO?.paymentId ||
    null;

  console.info('[Pi] Incomplete payment detected', {
    id,
    hasId: Boolean(id),
    at: new Date().toISOString(),
  });

  if (!id) {
    console.warn('[Pi] Incomplete payment callback had no identifier.', { paymentDTO });
    return;
  }

  try {
    console.info('[Pi] Cancelling incomplete payment…', { id });
    await PiNetworkService.cancelPiNetworkPayment(id);
    console.info('[Pi] Incomplete payment cancelled.', {
      id,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Pi] Cancel incomplete failed', {
      id,
      error: err?.message || err,
    });
  }
}

export async function getUserAccessToken() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return ans.accessToken;
}

export async function getUserWalletAddress() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return ans.wallet_address;
}

export async function authWithPiNetwork() {
  console.info('[Pi] authWithPiNetwork: entering authenticate()');
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return { username: ans.username, accessToken: ans.accessToken, wallet_address: ans.wallet_address };
}

export async function CreatePayment(
  userUid: string,
  amount: number,
  action: string,
  onPaymentSucceed: Function
): Promise<any> {
  await authWithPiNetwork();
  const paymentResult = await (window as any).Pi.createPayment(
    {
      amount: amount,
      memo: "Pro payment Orbit",
      metadata: { paymentSource: "Orbit" },
    },
    {
      onReadyForServerApproval: async (paymentId: string) => {
        await piNetworkService.approvePiNetworkPayment(paymentId);
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          await piNetworkService.completePiNetworkPayment(paymentId, txid);

          await onPaymentSucceed(); // Call original success callback
        } catch (error) {
          console.error(
            "Error during server completion or Firestore update:",
            error
          );
          // It's important to decide how to handle errors here.
          // If completePiNetworkPayment fails, onPaymentSucceed should likely not be called.
          // If Firestore update fails, the Pi payment was successful, but our DB is out of sync.
          // For now, we'll let the original onError handle Pi errors,
          // and log Firestore errors. The onPaymentSucceed might still be called if Pi part was ok.

          // Re-throwing the error if it's critical, or calling a specific error handler
          // This depends on how errors from onPaymentSucceed are handled by the caller
          if (
            !(error instanceof Error && error.message.includes("Firestore"))
          ) {
            throw error; // Re-throw if not a Firestore error, let Pi SDK handle it.
          }
          // If it is a Firestore error, the Pi payment succeeded. We still call onPaymentSucceed.
          onPaymentSucceed();
        }
      },
      onCancel: async (paymentId: string) => {
        //The payment has been cancelled
      },
      onError: async (error: any, paymentDTO: PaymentDTO) => {
        console.error("Payment error:", error);
        await piNetworkService.cancelPiNetworkPayment(paymentDTO.identifier);
      },
    }
  );
  return paymentResult;
}


// keep a default export too, in case any code imports default
export default {
  CreatePayment,
  authWithPiNetwork,
  getUserAccessToken,
  getUserWalletAddress,
  onIncompletePaymentFound,
  isSandboxEnv,
};
