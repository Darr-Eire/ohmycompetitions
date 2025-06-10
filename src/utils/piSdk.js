export async function loginWithPi() {
  try {
    const scopes = ['username', 'payments'];
    const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

    console.log('✅ Authenticated:', authResult);

    // ✅ Critical fix: Save full user with .uid
    localStorage.setItem('piUser', JSON.stringify(authResult.user));

    await fetch('/api/auth/pi-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: authResult.accessToken }),
    });

    return authResult;
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
}
