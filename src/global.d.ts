// Ensure this file is treated as a module
export {};

interface PaymentCallbacks {
  /** Called when payment is ready for server-side approval */
  onReadyForServerApproval: (paymentId: string) => void;
  /** Called when payment is ready for server-side completion */
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  /** Called if the user cancels the payment */
  onCancel: (paymentId: string) => void;
  /** Called on error; may include partial payment info */
  onError: (error: Error, payment?: any) => void;
}

interface PaymentData {
  /** Amount to charge (in Pi) */
  amount: number;
  /** A memo or description for the payment */
  memo: string;
  /** Any additional metadata */
  metadata: Record<string, any>;
}

declare global {
  interface Window {
    /** Pi Browser SDK namespace */
    Pi?: {
      /**
       * Initialize the SDK
       * @param opts.version SDK version string
       * @param opts.sandbox optional sandbox flag
       */
      init: (opts: { version: string; sandbox?: boolean }) => void;

      /**
       * Kick off a Pi payment
       * @param data payment amount, memo, metadata
       * @param callbacks lifecycle callbacks
       */
      createPayment: (data: PaymentData, callbacks: PaymentCallbacks) => void;
    };
  }
}
