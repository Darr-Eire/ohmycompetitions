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
  // relies on your readyPi() to pick Testnet when sandbox
  return readyPi({ network: undefined });
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
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return { username: ans.username, accessToken: ans.accessToken, wallet_address: ans.wallet_address };
}

/**
 * Create a Pi payment.
 * @param {number} amount
 * @param {(paymentId:string, txid?:string)=>void} onPaymentSucceed
 * @param {{ memo?:string, metadata?:object, onPaymentId?:(paymentId:string)=>void }} [opts]
 */
export async function CreatePayment(amount, onPaymentSucceed, opts = {}) {
  if (!amount || Number(amount) <= 0) throw new Error('CreatePayment: positive amount required');

  const memo = opts.memo ?? 'Donation';
  const metadata = opts.metadata ?? { source: 'app' };
  const onPaymentId = typeof opts.onPaymentId === 'function' ? opts.onPaymentId : null;

  const Pi = await ensurePi();
  const { accessToken } = await authWithPiNetwork();

  return Pi.createPayment(
    { amount, memo, metadata },
    {
      onReadyForServerApproval: async (paymentId) => {
        try {
          onPaymentId && onPaymentId(paymentId); // early surface
          console.info('[Pi] onReadyForServerApproval', { paymentId });
        } catch {}
        await PiNetworkService.approvePiNetworkPayment(paymentId);
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.info('[Pi] onReadyForServerCompletion', { paymentId, txid });
        await PiNetworkService.completePiNetworkPayment(paymentId, txid, accessToken);
        try { typeof onPaymentSucceed === 'function' && onPaymentSucceed(paymentId, txid); } catch {}
      },
      onCancel: async (paymentId) => {
        console.warn('[Pi] Payment cancelled by user', { paymentId });
      },
      onError: async (error, paymentDTO) => {
        console.error('[Pi] Payment error', { error: error?.message || error, paymentDTO });
        try { await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier); } catch {}
        throw error;
      },
    }
  );
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
