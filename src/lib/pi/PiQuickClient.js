// ============================================================================
// PATH: src/lib/pi/PiQuickClient.js
// Exposes named exports used by your page.
// ============================================================================
import { readyPi } from 'lib/piClient';            // uses your baseUrl alias
import PiNetworkService from 'lib/pi/PiBackendIntegration';

export function isSandboxEnv() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet';
}

async function ensurePi() {
  // readyPi figures out "Pi Testnet" when sandbox env is on
  return readyPi({ network: undefined });
}

export async function onIncompletePaymentFound(paymentDTO) {
  // clear stale pending so user can retry
  try { await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier); } catch {}
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
        // expose ID early to UI
        try { onPaymentId && onPaymentId(paymentId); } catch {}
        await PiNetworkService.approvePiNetworkPayment(paymentId);
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        await PiNetworkService.completePiNetworkPayment(paymentId, txid, accessToken);
        try { typeof onPaymentSucceed === 'function' && onPaymentSucceed(paymentId, txid); } catch {}
      },
      onCancel: async () => {},
      onError: async (error, paymentDTO) => {
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