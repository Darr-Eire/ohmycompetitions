// src/global.d.ts
import type { PaymentData, PaymentCallbacks } from './types/pi-sdk';

declare global {
  interface Window {
    Pi?: {
      init(opts: { version: string; sandbox?: boolean }): void;
      createPayment(data: PaymentData, callbacks: PaymentCallbacks): void;
      authenticate?(opts?: any): Promise<any>;
    };
  }
}
export {};
