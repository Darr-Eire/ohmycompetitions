import { readyPi } from '../piClient';

// Minimal API used by BuyTicketButton or other callers
export async function ensurePi() {
  return readyPi('Pi Testnet');
}

// Optional helpers mirroring old names
export async function authenticate(scopes = ['payments','username','roles']) {
  const Pi = await ensurePi();
  return Pi.authenticate(scopes);
}

export async function createPayment(args) {
  const Pi = await ensurePi();
  return Pi.createPayment(args);
}
