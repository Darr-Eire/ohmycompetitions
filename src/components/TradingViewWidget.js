function TradingViewWidget({ symbol = "COINBASE:BTCUSD" }) {
  const symbolMap = {
    "COINBASE:BTCUSD": "bitcoin",
    "COINBASE:ETHUSD": "ethereum",
    "COINBASE:XRPUSD": "xrp",
    "COINBASE:SOLUSD": "solana",
    "BINANCE:BNBUSDT": "binance-coin",
    "BINANCE:DOGEUSDT": "dogecoin",
  };

  // You can adjust these mappings to match exactly as needed

  const cryptoName = symbolMap[symbol] || "bitcoin";

  return (
    <iframe
      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${cryptoName}&symbol=${symbol}&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc/UTC`}
      style={{ width: "100%", height: "220px", border: "none" }}
      allowTransparency={true}
      scrolling="no"
    />
  );
}
