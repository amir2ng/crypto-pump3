import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Maximize2, RefreshCw, BarChart2, ShieldCheck, Zap } from "lucide-react";

interface TradingViewChartProps {
  symbol: string;
  chain?: string;
  isFa?: boolean;
  theme?: "dark" | "light";
  height?: number | string;
  defaultInterval?: string;
}

// Map tokens to their standard TradingView spot / perpetual symbols
const SYMBOL_MAP: Record<string, string> = {
  PEPE: "BINANCE:PEPEUSDT",
  SOL: "BINANCE:SOLUSDT",
  SUI: "BINANCE:SUIUSDT",
  NEAR: "BINANCE:NEARUSDT",
  WIF: "BINANCE:WIFUSDT",
  FET: "BINANCE:FETUSDT",
  TIA: "BINANCE:TIAUSDT",
  RENDER: "BINANCE:RENDERUSDT",
  VIRTUAL: "MEXC:VIRTUALUSDT",
  POPCAT: "BINANCE:POPCATUSDT",
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  BNB: "BINANCE:BNBUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  XRP: "BINANCE:XRPUSDT",
  ADA: "BINANCE:ADAUSDT",
  AVAX: "BINANCE:AVAXUSDT",
  LINK: "BINANCE:LINKUSDT",
  BONK: "BINANCE:BONKUSDT",
  BRETT: "BYBIT:BRETTUSDT",
  AERO: "COINBASE:AEROUSD",
  DEGEN: "BYBIT:DEGENUSDT",
  PENDLE: "BINANCE:PENDLEUSDT",
  JTO: "BINANCE:JTOUSDT",
  RAY: "BINANCE:RAYUSDT",
  INJ: "BINANCE:INJUSDT",
  TAO: "BINANCE:TAOUSDT",
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  chain = "ethereum",
  isFa = true,
  theme = "dark",
  height = 420,
  defaultInterval = "60",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interval, setIntervalState] = useState<string>(defaultInterval);
  const [tvSymbol, setTvSymbol] = useState<string>(
    SYMBOL_MAP[symbol.toUpperCase()] || `BINANCE:${symbol.toUpperCase()}USDT`
  );
  const [exchange, setExchange] = useState<string>("BINANCE");

  useEffect(() => {
    const cleanSym = symbol.toUpperCase();
    const mapped = SYMBOL_MAP[cleanSym] || `BINANCE:${cleanSym}USDT`;
    setTvSymbol(mapped);
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const widgetConfig = {
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1", // 1 = Candles
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(9, 9, 11, 1)",
      gridColor: "rgba(39, 39, 42, 0.4)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "Volume@tv-basicstudies"
      ],
      container_id: "tradingview_advanced_widget"
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    containerRef.current.appendChild(script);
  }, [tvSymbol, interval, theme]);

  const handleExchangeChange = (newEx: string) => {
    setExchange(newEx);
    const cleanSym = symbol.toUpperCase();
    setTvSymbol(`${newEx}:${cleanSym}USDT`);
  };

  const tradingViewDirectUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>TradingView: {tvSymbol}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {["BINANCE", "BYBIT", "COINBASE", "MEXC"].map((ex) => (
              <button
                key={ex}
                onClick={() => handleExchangeChange(ex)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  exchange === ex 
                    ? "bg-zinc-800 text-cyan-400 border border-zinc-700 font-bold" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe selector & direct link */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {[
              { label: "1m", val: "1" },
              { label: "5m", val: "5" },
              { label: "15m", val: "15" },
              { label: "1h", val: "60" },
              { label: "4h", val: "240" },
              { label: "1D", val: "D" },
            ].map((tf) => (
              <button
                key={tf.val}
                onClick={() => setIntervalState(tf.val)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition ${
                  interval === tf.val
                    ? "bg-cyan-600 text-white shadow-sm font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <a
            href={tradingViewDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            title="مشاهده مستقیم در TradingView"
          >
            <span>{isFa ? "باز کردن در TradingView" : "Open TV"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* TradingView Widget Container */}
      <div 
        className="w-full relative bg-zinc-950"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        <div 
          ref={containerRef} 
          id="tradingview_advanced_widget"
          className="tradingview-widget-container h-full w-full"
        />
      </div>

      {/* Footer Info & Disclaimers */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-t border-zinc-800 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-zinc-300 font-mono">
            {isFa ? "داده‌های زنده لحظه‌ای مستقیم از سرورهای TradingView" : "Live real-time feed direct from TradingView"}
          </span>
        </div>
        <div className="text-zinc-500">
          {isFa ? "کندل‌های زنده + حجم معاملات + اندیکاتور RSI" : "Live Candles + Volume + RSI"}
        </div>
      </div>
    </div>
  );
};
