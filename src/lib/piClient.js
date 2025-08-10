// file: src/lib/piClient.js
import axios from 'axios';

const base = process.env.PI_API_BASE || 'https://api.minepi.com/v2';
const key = process.env.PI_API_KEY;   // server key
if (!key) throw new Error('❌ PI_API_KEY missing');

const client = axios.create({ baseURL: base, headers: { Authorization: `Key ${key}` } });

export async function getPayment(paymentId) {
  const { data } = await client.get(`/payments/${paymentId}`);
  return data;
}
export async function approvePayment(paymentId) {
  const { data } = await client.post(`/payments/${paymentId}/approve`);
  return data;
}
export async function completePayment(paymentId, txid) {
  const { data } = await client.post(`/payments/${paymentId}/complete`, { txid });
  return data;
}
