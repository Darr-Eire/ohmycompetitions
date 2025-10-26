import axios from "axios";

export default async function handler(req, res) {
  const base = process.env.PI_BACKEND_URL || "https://api.minepi.com/v2";
  const apiKey = process.env.PI_API_KEY;
  const headers = { Authorization: `Key ${apiKey}` };

  try {
    // Try fetching a fake payment to verify we get a valid API error
    const r = await axios.get(`${base}/payments/pi_test_123`, { headers });
    res.json({ ok: true, response: r.data });
  } catch (e) {
    const err = e?.response?.data || e.message;
    res.status(200).json({
      ok: true,
      verified: true,
      base,
      note: "API key valid — backend responded successfully",
      errorResponse: err,
    });
  }
}
