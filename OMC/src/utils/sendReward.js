export async function sendPiReward({ uid, amount, memo, metadata = {} }) {
  try {
    // Request payment intent
    const createRes = await axiosClient.post(`/payments`, {
      uid,
      amount,
      memo,
      metadata,
    });

    const { identifier: paymentId, recipient: recipientAddress } = createRes.data;
    if (!paymentId || !recipientAddress) throw new Error('Missing recipient info');

    const account = await server.loadAccount(STELLAR_PUBLIC);
    const fee = await server.fetchBaseFee();
    const timebounds = await server.fetchTimebounds(180);

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

    const keypair = StellarSdk.Keypair.fromSecret(STELLAR_SECRET);
    transaction.sign(keypair);

    const submitResult = await server.submitTransaction(transaction);
    const txid = submitResult.id;

    await axiosClient.post(`/payments/${paymentId}/complete`, { txid });

    console.log('✅ Pi sent successfully:', { paymentId, txid });
    return { success: true, paymentId, txid };

  } catch (err) {
    console.error('❌ A2U Payment failed:', err.response?.data || err.message || err);
    return { success: false, error: err.response?.data || err.message || err };
  }
}
