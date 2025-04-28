// src/types/pi-sdk.ts
export interface PaymentCallbacks {
    onReadyForServerApproval(paymentId: string): void;
    onReadyForServerCompletion(paymentId: string, txid: string): void;
    onCancel(paymentId: string): void;
    onError(error: Error, payment?: any): void;
  }
  
  export interface PaymentData {
    amount: number;
    memo: string;
    metadata: Record<string, any>;
  }
  