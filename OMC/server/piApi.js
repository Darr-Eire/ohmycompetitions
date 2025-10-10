// server/piApi.js
import axios from 'axios';

const API_BASE = process.env.PI_API_BASE || 'https://api.minepi.com/v2';
const isSandbox =
  process.env.NEXT_PUBLIC_PI_SANDBOX === 'true' || process.env.PI_ENV === 'testnet';

const APP_ID =
  (isSandbox ? process.env.PI_APP_ID_TESTNET : process.env.PI_APP_ID) ||
  process.env.PI_APP_ID;

const API_KEY =
  (isSandbox ? process.env.PI_API_KEY_TESTNET : process.env.PI_API_KEY) ||
  process.env.PI_API_KEY;

export async function fetchMe(accessToken) {
  if (!accessToken) throw new Error('No access token');
  if (!API_KEY) throw new Error('Missing API key');
  if (!APP_ID) throw new Error('Missing App ID');

  const res = await axios.get(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,  // <-- token from Pi.authenticate()
      'X-API-KEY': API_KEY,                    // <-- your app’s API key
      'X-App-Id': APP_ID,                      // <-- your app id (ohmycompetitions6217)
    },
    validateStatus: () => true,
  });

  if (res.status !== 200) {
    const err = new Error(`Pi /me ${res.status}`);
    err.response = res;
    throw err;
  }
  return res.data;
}
