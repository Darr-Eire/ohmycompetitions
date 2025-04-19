export {}

declare global {
  interface Window {
    Pi: {
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<{
        accessToken: string
        user: {
          uid: string
          username: string
        }
      }>

      createPayment: (
        paymentData: {
          amount: number
          memo: string
          metadata: Record<string, string | number>
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

