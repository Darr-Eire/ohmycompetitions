export {}

declare global {
  interface Window {
    Pi?: {
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<unknown>
      createPayment?: unknown // extend as needed
    }
    
  }
}
