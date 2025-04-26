// PiLoginButton.js
import { fetchWithTimeout } from './fetchWithTimeout.js';

export class PiLoginButton {
  constructor({ apiBaseUrl, container }) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/+$/, ''); // trim trailing slash
    this.container = container;
    this.button = document.createElement('button');
    this.button.textContent = 'Login with Pi';
    this.button.addEventListener('click', () => this.handleLogin());
    this.container.appendChild(this.button);
  }

  async handleLogin() {
    this.setLoading(true);

    try {
      // 1) Kick off login request
      const res = await fetchWithTimeout(`${this.apiBaseUrl}/pi/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }, /* timeout ms */ 10000);

      // 2) Must check HTTP status
      let body;
      if (!res.ok) {
        // parse any JSON error payload
        body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `HTTP ${res.status}`);
      }

      // 3) Parse JSON on success
      body = await res.json();

      // 4) If the API signals an error wrapper
      if (body.error) {
        // Ensure message exists
        const msg = typeof body.error.message === 'string'
          ? body.error.message
          : 'Unknown server error';
        throw new Error(msg);
      }

      // 5) Everything good—redirect or update UI
      window.location.href = body.redirectUrl;
    }
    catch (err) {
      // err is always an Error instance here
      console.error('[PiLoginButton] error:', err);
      alert(`Login failed: ${err.message}`);
    }
    finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    this.button.disabled = isLoading;
    this.button.textContent = isLoading ? 'Loading…' : 'Login with Pi';
  }
}
