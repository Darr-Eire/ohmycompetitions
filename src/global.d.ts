/* eslint-disable @typescript-eslint/no-explicit-any */

export {}

declare global {
  interface Window {
    Pi: {
      authenticate: (
        scopes: string[],
        callback: (authResult: any) => void
      ) => void
      createPayment?: (
        paymentData: any,
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void
          onReadyForServerCompletion: (paymentId: string, txid: string) => void
          onCancel: () => void
          onError: (error: Error) => void
        }
      ) => void
    }
  }
}
