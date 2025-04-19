// src/types/global.d.ts
export {}

declare global {
  interface Window {
    Pi: {
      authenticate: any
      createPayment: (
        paymentData: {
          amount: number
          memo: string
          metadata: any
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void
          onReadyForServerCompletion: (paymentId: string, txid: string) => void
          onCancel: (paymentId: string) => void
          onError: (error: Error, payment?: any) => void
        }
      ) => void
    }
  }
}
