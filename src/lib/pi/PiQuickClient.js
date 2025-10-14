// File: src/lib/pi/PiQuickClient.js
// Drop-in API matching the snippet your contact shared.
// Uses your existing readyPi() (env-aware) and our PiBackendIntegration shim above.

import { readyPi } from '../piClient'; // already in your repo
import PiNetworkService from './PiBackendIntegration';

/**
 * Detect whether we’re in sandbox/testnet via env.
 * Your repo’s readyPi() maps sandbox/testnet to "Pi Testnet" under the hood.
 */
function isSandboxEnv() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet';
}

/**
 * Ensure Pi SDK is loaded & initialized with correct network.
 */
async function ensurePi() {
  // Why: reuse your robust initializer that sets the proper network label
  return readyPi({ network: undefined }); // uses resolvePiNetworkLabel() internally
}

/**
 * Optional: handle incomplete payment recovery/cancel.
 * We simply no-op here because your backend manages stuck/incomplete flows.
 */
export async function onIncompletePaymentFound(/* paymentDTO */) {
  // no-op; you can call a cleanup endpoint here if you add one
  return;
}

/**
 * Authenticate and get access token only.
 */
export async function getUserAccessToken() {
  const Pi = await ensurePi();
  // If you really want to force sandbox behavior through SDK flag, uncomment the next line:
  // await Pi.init({ version: '2.0', sandbox: isSandboxEnv() });
  const ans = await Pi.authenticate(
    ['username', 'payments', 'wallet_address'],
    onIncompletePaymentFound
  );
  return ans.accessToken;
}

/**
 * Authenticate and get wallet address.
 */
export async function getUserWalletAddress() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(
    ['username', 'payments', 'wallet_address'],
    onIncompletePaymentFound
  );
  return ans.wallet_address;
}

/**
 * Authenticate and return useful bits.
 */
export async function authWithPiNetwork() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(
    ['username', 'payments', 'wallet_address'],
    onIncompletePaymentFound
  );
  // Keep shape close to what you were sent
  return {
    username: ans.username,
    accessToken: ans.accessToken,
    wallet_address: ans.wallet_address,
  };
}

/**
 * Create a payment on Pi Testnet/Sandbox.
 * @param {number} amount                        Pi amount to charge
 * @param {Function} onPaymentSucceed            callback executed after server completion succeeds
 * @param {Object} [opts]
 * @param {string} [opts.memo="Donation"]        memo shown in wallet
 * @param {Object} [opts.metadata={}]            arbitrary metadata
 */
export async function CreatePayment(
  amount,
  onPaymentSucceed,
  opts = {}
) {
  if (!amount || Number(amount) <= 0) throw new Error('CreatePayment: positive amount required');
  const memo = opts.memo ?? 'Donation';
  const metadata = opts.metadata ?? { source: 'app' };

  const Pi = await ensurePi();
  const { accessToken } = await authWithPiNetwork();

  return Pi.createPayment(
    { amount, memo, metadata },
    {
      onReadyForServerApproval: async (paymentId) => {
        await PiNetworkService.approvePiNetworkPayment(paymentId);
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        await PiNetworkService.completePiNetworkPayment(paymentId, txid, accessToken);
        try { typeof onPaymentSucceed === 'function' && onPaymentSucceed(paymentId, txid); } catch {}
      },
      onCancel: async (_paymentId) => {
        // optional: toast or log
      },
      onError: async (error, paymentDTO) => {
        console.error('Pi payment error:', error, paymentDTO);
        try { await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier); } catch {}
      },
    }
  );
}

export default {
  CreatePayment,
  authWithPiNetwork,
  getUserAccessToken,
  getUserWalletAddress,
  onIncompletePaymentFound,
  isSandboxEnv,
};

