// src/global.d.ts
export {};

declare global {
  interface Window {
    Pi?: {
      authenticate: (
        opts: { version: string; permissions: string[] }
      ) => Promise<{ accessToken: string }>;
    };
  }
}
