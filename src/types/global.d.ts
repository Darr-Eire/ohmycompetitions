export {}

declare global {
  interface PiUser {
    uid: string
    username: string
  }

  interface PiAuthResult {
    accessToken: string
    user: PiUser
  }

  interface PiPayment {
    identifier: string
    amount: number
    memo: string
    metadata: Record<string, string>
    to_address: string
  }

  interface PiPaymentCallbacks {
    onReadyForServerApproval: (paymentId: string) => void
    onReadyForServerCompletion: (paymentId: string, txid: string) => void
    onCancel: (paymentId: string) => void
    onError: (error: Error, payment?: PiPayment) => void
  }

  interface Window {
    Pi: {
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: PiPayment) => void
      ) => Promise<PiAuthResult>
      createPayment: (
        paymentData: PiPayment,
        callbacks: PiPaymentCallbacks
      ) => void
    }
  }
}
