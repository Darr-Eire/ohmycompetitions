// File: src/lib/pi/PiQuickClient.js
// Wire onIncompletePaymentFound so Pi cancels stale payment before starting a new one.

import { readyPi } from '../piClient';
import PiNetworkService from './PiBackendIntegration';

function isSandboxEnv() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet';
}

async function ensurePi() {
  return readyPi({ network: undefined }); // why: your readyPi picks "Pi Testnet" from env
}

export async function onIncompletePaymentFound(paymentDTO) {
  try {
    await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier);
  } catch (e) {
    console.warn('cancel on incomplete failed', e);
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

export async function CreatePayment(amount, onPaymentSucceed, opts = {}) {
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
      onCancel: async () => {},
      onError: async (error, paymentDTO) => {
        // why: if error comes from another pending, try to cancel it so next attempt can proceed
        try { await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier); } catch {}
        throw error;
      },
    }
  );
}

export default { CreatePayment, authWithPiNetwork, getUserAccessToken, getUserWalletAddress, onIncompletePaymentFound, isSandboxEnv };
