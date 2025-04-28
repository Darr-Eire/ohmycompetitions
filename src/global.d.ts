declare interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

declare interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

declare global {
  interface Window {
    Pi?: {
      init: (opts: { version: string; sandbox?: boolean }) => void;
      createPayment: (data: PaymentData, callbacks: PaymentCallbacks) => void;
    };
  }
}
