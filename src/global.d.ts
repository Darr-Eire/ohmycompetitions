// global.d.ts
export {}; // ensure this file is treated as a module

type AuthResult = {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
};

declare global {
  interface Window {
    Pi?: {
      init: (opts: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void
      ) => Promise<AuthResult>;
      // …any other Pi methods you use…
    };
  }
}
