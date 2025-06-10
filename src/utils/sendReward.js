// sendReward.js

import axios from 'axios';
import StellarSdk from 'stellar-sdk';
import dotenv from 'dotenv';
dotenv.config();

const PI_API_KEY = process.env.PI_API_KEY;
const STELLAR_SECRET = process.env.STELLAR_SECRET;
const STELLAR_PUBLIC = process.env.STELLAR_PUBLIC;

const server = new StellarSdk.Server('https://api.testnet.minepi.com'); // Use testnet
const networkPassphrase = 'Pi Testnet'; // Use "Pi Network" for mainnet

const axiosClient = axios.create({
  baseURL: 'https://api.minepi.com/v2',
  timeout: 10000,
  headers: {
    Authorization: `Key ${PI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function sendPiReward({ uid, amount, memo, metadata = {} }) {
  try {
    // 1. Request payment intent from Pi backend
    const createRes = await axiosClient.post(`/payments`, {
      amount,
      memo,
      metadata,
      uid,
    });

    const paymentId = createRes.data.identifier;
    const recipientAddress = createRes.data.recipient;
    if (!paymentId || !recipientAddress) throw new Error('Missing recipient info');

    // 2. Load developer account and fee
    const account = await server.loadAccount(STELLAR_PUBLIC);
    const fee = await server.fetchBaseFee();
    const timebounds = await server.fetchTimebounds(180); // 3 min expiry

    // 3. Build transaction
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

    // 4. Sign transaction
    const keypair = StellarSdk.Keypair.fromSecret(STELLAR_SECRET);
    transaction.sign(keypair);

    // 5. Submit transaction to Pi blockchain
    const submitResult = await server.submitTransaction(transaction);
    const txid = submitResult.id;

    // 6. Notify Pi server of completion
    const completeRes = await axiosClient.post(`/payments/${paymentId}/complete`, {
      txid,
    });

    console.log('✅ Pi sent successfully:', { paymentId, txid });
    return { success: true, paymentId, txid };
  } catch (err) {
    console.error('❌ A2U Payment failed:', err.response?.data || err.message || err);
    return { success: false, error: err };
  }
}
