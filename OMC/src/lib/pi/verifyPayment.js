// New flow uses our status endpoint.
// Return a normalized object so old code can keep working.
export async function verifyPayment(paymentId) {
  const res = await fetch(`/api/pi/payments/${paymentId}/status`);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const json = await res.json(); // {status, txid}
  return {
    found: !!json?.status,
    status: json?.status || 'unknown',
    txid: json?.txid || null,
  };
}
