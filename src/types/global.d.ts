export {}

declare global {
  interface Window {
    Pi: {
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<any>

      createPayment: (
        paymentData: {
          amount: string
          memo: string
          metadata: object
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void
          onReadyForServerCompletion: (paymentId: string, txid: string) => void
          onCancel: (paymentId: string) => void
          onError: (error: Error) => void
        }
      ) => void
    }
  }
}
