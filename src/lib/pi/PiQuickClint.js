// ============================================================================
// PATH: src/lib/pi/PiQuickClient.js
// Exposes named exports used by your page.
// ============================================================================
import { readyPi } from 'lib/piClient';
import { PiNetworkService } from 'lib/pi/PiBackendIntegration';


export function isSandboxEnv() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet';
}

async function ensurePi() {
  // guarantees SDK present + initialized (fixes "Call init() first")
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

/**
 * @param {string} userUid
 * @param {number} amount
 * @param {string} action
 * @param {(payment?: any) => Promise<void>|void} onPaymentSucceed
 */
export async function CreatePayment(userUid, amount, action, onPaymentSucceed) {
  // ensure auth context is fresh (and triggers onIncompletePaymentFound if needed)
  await authWithPiNetwork();

  const Pi = await ensurePi();

  const paymentResult = await Pi.createPayment(
    {
      amount,
      memo: action || 'OMC payment',
      metadata: { paymentSource: 'OMC', userUid, action },
    },
    {
      onReadyForServerApproval: async (paymentId) => {
        try {
          await PiNetworkService.approvePiNetworkPayment(paymentId);
        } catch (e) {
          console.error('[Pi] approvePiNetworkPayment failed', e);
          throw e;
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        try {
          await PiNetworkService.completePiNetworkPayment(paymentId, txid);
          if (typeof onPaymentSucceed === 'function') {
            await onPaymentSucceed();
          }
        } catch (error) {
          console.error('[Pi] completePiNetworkPayment failed', error);
          // If server completion failed, cancel to unlock user flow
          try {
            await PiNetworkService.cancelPiNetworkPayment(paymentId);
          } catch (e2) {
            console.error('[Pi] cancel after completion failure also failed', e2);
          }
          throw error;
        }
      },
      onCancel: async (paymentId) => {
        console.warn('[Pi] Payment cancelled by user', { paymentId });
        // optional: notify backend
        try {
          if (paymentId) await PiNetworkService.cancelPiNetworkPayment(paymentId);
        } catch (e) {
          console.error('[Pi] cancelPiNetworkPayment (onCancel) failed', e);
        }
      },
      onError: async (error, paymentDTO) => {
        const id =
          paymentDTO?.identifier ||
          paymentDTO?.id ||
          paymentDTO?.paymentId ||
          null;
        console.error('[Pi] Payment error', { error, id, paymentDTO });
        if (id) {
          try {
            await PiNetworkService.cancelPiNetworkPayment(id);
          } catch (e) {
            console.error('[Pi] cancelPiNetworkPayment (onError) failed', e);
          }
        }
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
