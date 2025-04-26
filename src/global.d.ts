// src/global.d.ts

interface PiAuthResponse {
    accessToken: string;
    username?: string;
    wallet_address?: string;
  }
  
  interface PiSDK {
    authenticate(opts: { version: string; permissions: string[] }): Promise<PiAuthResponse>;
  }
  
  declare global {
    interface Window {
      Pi?: PiSDK;
    }
  }
  