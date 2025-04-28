// global.d.ts
export {}

declare global {
  interface Window {
    Pi?: {
      init: (opts: { version: string; sandbox?: boolean }) => void
      authenticate?: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void
      ) => Promise<{ accessToken: string; user: any }>
      createPayment?: (opts: {
        amount: string
        memo: string
        metadata: any
        onReadyForServerApproval: (data: { paymentId: string }) => void
        onReadyForServerCompletion: (data: { paymentId: string; txid: string }) => void
        onCancel: () => void
        onError: (err: Error) => void
        onIncompletePaymentFound: (payment: any) => void
      }) => Promise<void>
      openPayment?: (paymentId: string) => void
    }
  }
}
