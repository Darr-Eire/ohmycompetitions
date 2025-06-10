import axios from 'axios';
import StellarSdk from 'stellar-sdk';
import dotenv from 'dotenv';
dotenv.config();

const PI_API_KEY = process.env.PI_API_KEY;
const STELLAR_SECRET = process.env.STELLAR_SECRET;
const STELLAR_PUBLIC = process.env.STELLAR_PUBLIC;

const server = new StellarSdk.Server('https://api.testnet.minepi.com'); // Switch to mainnet if needed
const networkPassphrase = 'Pi Testnet'; // Use 'Pi Network' for mainnet

const axiosClient = axios.create({
  baseURL: 'https://api.minepi.com/v2',
  timeout: 10000,
  headers: {
    Authorization: `Key ${PI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Sends Pi to a user (A2U Payment Flow)
 * @param {Object} options
 * @param {string} options.uid - UID of the recipient in Pi Network
 * @param {string|number} options.amount - Amount of Pi to send
 * @param {string} options.memo - Memo for the transaction (also acts as paymentId)
 * @param {Object} [options.metadata={}] - Optional metadata to attach
 * @returns {Object} Result { success: boolean, txid?, paymentId?, error? }
 */
export async function sendPiReward({ uid, amount, memo, metadata = {} }) {
  try {
    // 1. Create A2U payment intent
    const createRes = await axiosClient.post(`/payments`, {
      uid,
      amount,
      memo,
      metadata,
    });

    const { identifier: paymentId, recipient: recipientAddress } = createRes.data;
    if (!paymentId || !recipientAddress) throw new Error('Missing recipient info from Pi API');

    // 2. Load developer account and set transaction parameters
    const account = await server.loadAccount(STELLAR_PUBLIC);
    const fee = await server.fetchBaseFee();
    const timebounds = await server.fetchTimebounds(180); // 3-minute expiry window

  
 // 3. Build Stellar transaction
const transaction = new StellarSdk.TransactionBuilder(account, {
  fee,
  timebounds,
  networkPassphrase,
})
  .addOperation(
    StellarSdk.Operation.payment({
      destination: recipientAddress,
      asset: StellarSdk.Asset.native(),
      amount: amount.toString(),
    })
  )
  .addMemo(StellarSdk.Memo.text(paymentId))
  .build();

