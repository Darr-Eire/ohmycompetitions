'use client';
import { useEffect, useMemo, useState } from 'react';

/**
 * Detect Pi Browser on the client, without crashing SSR/SSG.
 * Exports BOTH a named and default function to satisfy all import styles.
 */
// ... keep your existing functions defined above ...

export {
  onIncompletePaymentFound,
  getUserAccessToken,
  getUserWalletAddress,
  authWithPiNetwork,
  CreatePayment,
};

// Also export a default object so either import style works
export default {
  onIncompletePaymentFound,
  getUserAccessToken,
  getUserWalletAddress,
  authWithPiNetwork,
  CreatePayment,
};


// Provide default export too, so imports like `import usePiEnv from ...` work.
export default usePiEnv;
