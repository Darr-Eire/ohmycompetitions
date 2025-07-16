import { useEffect, useRef } from 'react';

export default function TradingViewWidget({ symbol = "COINBASE:BTCUSD" }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "220",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ minHeight: '220px' }} />;
}
