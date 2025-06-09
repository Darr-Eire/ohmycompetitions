import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import BuyTicketButton from '@components/BuyTicketButton';
import Link from 'next/link';

const CRYPTO_COMPETITIONS = {
  'crypto-btc': {
    title: 'Win Bitcoin (BTC)',
    prize: '0.01 BTC',
    entryFee: 0.5,
    tradingViewSymbol: 'BINANCE:BTCUSDT',
    date: 'June 2, 2025',
    time: '12:59 AM UTC',
    location: 'Online',
    endsAt: '2025-06-02T00:59:00Z',
  },
  'crypto-eth': {
    title: 'Win Ethereum (ETH)',
    prize: '0.5 ETH',
    entryFee: 0.5,
    tradingViewSymbol: 'BINANCE:ETHUSDT',
    date: 'June 3, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-03T23:59:00Z',
  },
  'crypto-xrp': {
    title: 'Win Ripple (XRP)',
    prize: '1000 XRP',
    entryFee: 0.4,
    tradingViewSymbol: 'BINANCE:XRPUSDT',
    date: 'June 9, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-09T23:59:00Z',
  },
  'crypto-sol': {
    title: 'Win Solana (SOL)',
    prize: '10 SOL',
    entryFee: 0.4,
    tradingViewSymbol: 'BINANCE:SOLUSDT',
    date: 'June 5, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-05T23:59:00Z',
  },
  'crypto-bnb': {
    title: 'Win Binance Coin (BNB)',
    prize: '2 BNB',
    entryFee: 0.4,
    tradingViewSymbol: 'BINANCE:BNBUSDT',
    date: 'June 7, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-07T23:59:00Z',
  },
  'crypto-doge': {
    title: 'Win Dogecoin (DOGE)',
    prize: '10,000 DOGE',
    entryFee: 0.3,
    tradingViewSymbol: 'BINANCE:DOGEUSDT',
    date: 'June 11, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-11T23:59:00Z',
  },
};

export default function CryptoTicketPage() {
  const router = useRouter();
  const { slug } = router.query;
  const comp = CRYPTO_COMPETITIONS[slug];

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!comp) return;

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: comp.tradingViewSymbol,
      width: "100%",
      height: 160,
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      trendLineColor: "#00ff00",
      underLineColor: "rgba(0, 255, 0, 0.2)",
      isTransparent: true,
      autosize: true,
      largeChartUrl: ""
    });

    const container = document.getElementById("tv-mini");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
  }, [comp]);

  if (!router.isReady) return null;

  if (!comp) {
    return (
      <div className="text-white text-center py-10 bg-[#0b0f1a] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Crypto Giveaway Not Found</h1>
        <Link href="/" className="text-blue-400 underline mt-4 inline-block">← Go Back</Link>
      </div>
    );
  }

  const totalPrice = comp.entryFee * quantity;

  return (
    <div className="bg-[#0b0f1a] text-[#e5e7eb] min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto bg-[#111827] p-6 rounded-2xl shadow-2xl">
        <div className="mb-6 rounded-xl overflow-hidden" id="tv-mini" />

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text mb-6">
          {comp.title}
        </h1>

        {comp.imageUrl && (
          <img src={comp.imageUrl} alt={comp.title} className="w-full max-h-60 object-contain rounded-xl mx-auto mb-4 bg-blue-950 p-4" />
        )}

        <div className="text-center space-y-2 mb-4">
          <p><strong>Prize:</strong> {comp.prize}</p>
          <p><strong>Date:</strong> {comp.date}</p>
          <p><strong>Time:</strong> {comp.time}</p>
          <p><strong>Location:</strong> {comp.location}</p>
          <p><strong>Entry Fee:</strong> {comp.entryFee} π</p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-full"
            disabled={quantity <= 1}
          >−</button>
          <span className="text-xl">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-full"
          >+</button>
        </div>

        <p className="text-center text-xl font-bold text-cyan-400 mb-4">
          Total: {totalPrice.toFixed(2)} π
        </p>

        <BuyTicketButton
          competitionSlug={slug}
          entryFee={comp.entryFee}
          quantity={quantity}
        />
      </div>
    </div>
  );
}
