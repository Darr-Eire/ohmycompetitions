// src/pages/api/pi/ping-me.js
import { fetchMe } from '../../../../server/piApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { accessToken } = req.body || {};

  try {
    const me = await fetchMe(accessToken);
    return res.status(200).json({ ok: true, me });
  } catch (err) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data || err?.message;
    return res.status(status).json({ ok: false, error: data });
  }
}
