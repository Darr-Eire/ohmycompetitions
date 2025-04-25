// lib/pi.js

import { Pi } from '@pinetwork-js/sdk';  // Use the published @pinetwork-js/sdk package :contentReference[oaicite:0]{index=0}

let initialized = false;

/**
 * Initialize the Pi SDK (once) and return the Pi singleton.
 */
export function getPi() {
  if (!initialized) {
    Pi.init({ version: '2.0' });         // Initialize with the matching version :contentReference[oaicite:1]{index=1}
    initialized = true;
  }
  return Pi;
}

/**
 * Kick off a Pi Browser authentication flow.
 * Returns an auth object when the user approves.
 */
export async function verifyPiLogin() {
  const sdk = getPi();
  // In-browser auth – prompts user and resolves with { id, username, token, ... }
  const auth = await sdk.authenticate(['payments'], () => {});  // Uses the JS SDK’s authenticate method :contentReference[oaicite:2]{index=2}
  return auth;
}

/**
 * Create a payment request and await server‐approval callback.
 * Resolves with the paymentId once the user signs.
 */
export function createPiPayment({ amount, memo, metadata }) {
  const sdk = getPi();
  return new Promise((resolve, reject) => {
    sdk.createPayment(
      {
        amount: parseFloat(amount),
        memo,                // e.g. "Ticket purchase"
        metadata,            // e.g. { competitionId, userId }
      },
      {
        onReadyForServerApproval(paymentId) {
          resolve(paymentId);
        },
        onError(error) {
          reject(error);
        },
      }
    );
  });
}
