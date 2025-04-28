// src/global.d.ts
export {}; 

import type { PaymentData, PaymentCallbacks } from './types/pi-sdk';

declare global {
  interface Window {
    Pi?: {
      init(opts: { version: string; sandbox?: boolean }): void;

      /**
       * Ask the user to grant scopes.
       * @param scopes array of scope names, e.g. ['payments']
       * @param onIncompletePaymentFound optional callback for any pending payment
       */
      authenticate(
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void
      ): Promise<any>;

      createPayment(data: PaymentData, callbacks: PaymentCallbacks): void;
    };
  }
}
