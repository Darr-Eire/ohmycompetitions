// global.d.ts
export {}; // mark this file as a module

declare global {
  interface Window {
    Pi?: {
      authenticate(opts: { version: string; permissions: string[] }): Promise<{
        accessToken: string;
        username: string;
        wallet_address: string;
      }>;
    };
  }
}
