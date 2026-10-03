import React from "react";
import { TrendingUp, AlertTriangle, Activity, ShieldAlert, Cpu } from "lucide-react";
import { formatUsd } from "../utils/formatters";

interface ScannerStatsProps {
  isFa: boolean;
  totalWhaleInflow: number;
  highConvictionCount: number;
  extremeDumpCount: number;
  totalScanned: number;
  fearGreedIndex: number;
}

export const ScannerStats: React.FC<ScannerStatsProps> = ({
  isFa,
  totalWhaleInflow,
  highConvictionCount,
  extremeDumpCount,
  totalScanned,
  fearGreedIndex,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Stat 1: Total Whale Net Flow */}
      <div 
        id="stat-whale-flow"
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 sm:p-4 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            {isFa ? "جریان خالص نهنگ‌ها (۲۴س)" : "Whale Net Flow (24h)"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">
            +{formatUsd(totalWhaleInflow)}
          </span>
          <span className="text-[10px] text-emerald-500 font-medium">
            {isFa ? "انباشت فعال" : "Net Inflow"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {isFa ? "ردیابی ۵۰۰ کیف‌پول برتر و مارکت‌میکر" : "Tracking Top 500 Whale Wallets"}
        </p>
      </div>

      {/* Stat 2: High Conviction Pump Signals */}
      <div 
        id="stat-pump-signals"
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 sm:p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            {isFa ? "سیگنال‌های پامپ قوی (>۸۵٪)" : "High-Conviction Pumps"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
            <Cpu className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {highConvictionCount} {isFa ? "کوین" : "Coins"}
          </span>
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
            ALPHA
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {isFa ? "انباشت مخفی + واگرایی حجم" : "Volume Divergence + Inflow"}
        </p>
      </div>

      {/* Stat 3: Dump & Liquidation Alerts */}
      <div 
        id="stat-dump-alerts"
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 sm:p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            {isFa ? "هشدارهای دامپ و تخلیه" : "Heavy Dump Risks"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-400">
            {extremeDumpCount} {isFa ? "هشدار" : "Alerts"}
          </span>
          <span className="text-[10px] text-rose-400">
            {isFa ? "انتقال به بایننس/بای‌بیت" : "CEX Inflow Spike"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {isFa ? "ریسک سقوط قیمت و آنلاک توکن" : "Unlocks & Long Squeeze Risk"}
        </p>
      </div>

      {/* Stat 4: Market Sentiment & Total Scanned */}
      <div 
        id="stat-market-sentiment"
        className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 sm:p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            {isFa ? "شاخص ترس و طمع / اسکنر" : "Sentiment / Radar"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400">
            {fearGreedIndex} / 100
          </span>
          <span className="text-[10px] text-zinc-400">
            {fearGreedIndex > 60 ? (isFa ? "طمع شدید" : "Greed") : (isFa ? "خنثی" : "Neutral")}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {isFa ? `${totalScanned} توکن فعال تحت رصد لحظه‌ای` : `${totalScanned} tokens monitored in real-time`}
        </p>
      </div>

    </div>
  );
};
