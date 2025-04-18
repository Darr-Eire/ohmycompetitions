// lib/pi-sdk.ts
export function showPiLogin() {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.authenticate(['username', 'payment'], function (auth) {
        console.log('Authenticated:', auth)
        // You can now store the auth.user and auth.accessToken
      })
    } else {
      alert('Pi SDK not available. Please open in the Pi Browser.')
    }
  }
  