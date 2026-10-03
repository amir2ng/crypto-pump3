import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink, 
  Wallet, 
  Layers, 
  ArrowRightLeft, 
  Shield, 
  Filter,
  Check,
  Search,
  X
} from "lucide-react";
import { WhaleTransaction } from "../types";
import { formatUsd, formatPrice, getChainBadge } from "../utils/formatters";

interface WhaleTransactionFeedProps {
  transactions: WhaleTransaction[];
  isFa: boolean;
  onFilterToken?: (symbol: string) => void;
}

const STABLECOIN_SET = new Set([
  "USDT", "USDC", "DAI", "BUSD", "FDUSD", "TUSD", "USDE", "USDD", "PYUSD", 
  "FRAX", "GUSD", "LUSD", "CRVUSD", "USDP", "MIM", "USD0", "USDJ", "BSC-USD", 
  "CUSD", "EURC", "EURT", "EURS", "XAUT", "PAXG", "USDX", "SUSD", "ALUSD", 
  "OUSD", "DOLA", "FEI", "USTC", "HUSD", "DJED"
]);

function isStablecoinSymbol(sym?: string, name?: string): boolean {
  if (!sym) return false;
  const s = sym.trim().toUpperCase();
  if (STABLECOIN_SET.has(s)) return true;
  if (["USDT", "USDC", "USDD", "USDE", "USDP", "USDJ", "USD0", "TUSD", "BUSD", "FDUSD", "PYUSD", "CUSD", "CRVUSD", "ALUSD", "SUSD", "OUSD"].includes(s)) return true;
  if (s.startsWith("USD") || s.endsWith("USD") || s.startsWith("EUR") || s.endsWith("EUR")) return true;
  if (name) {
    const n = name.toLowerCase();
    if (n.includes("tether") || n.includes("usd coin") || n.includes("stablecoin") || n.includes("ethena usde") || n.includes("paypal usd") || n.includes("trueusd")) return true;
  }
  return false;
}

export const WhaleTransactionFeed: React.FC<WhaleTransactionFeedProps> = ({
  transactions,
  isFa,
  onFilterToken,
}) => {
  const [filterAction, setFilterAction] = React.useState<string>("ALL");
  const [minThresholdUsd, setMinThresholdUsd] = React.useState<number>(1000000);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  // STRICT FILTER: Always filter to transactions >= $1,000,000 USD and EXCLUDE ALL STABLECOINS
  const filteredTxs = transactions.filter((tx) => {
    if (isStablecoinSymbol(tx.tokenSymbol, tx.tokenName)) return false;
    const val = typeof tx.valueUsd === "number" ? tx.valueUsd : 0;
    if (val < 1000000) return false;
    if (val < minThresholdUsd) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesSymbol = tx.tokenSymbol.toLowerCase().includes(q);
      const matchesName = (tx.tokenName || "").toLowerCase().includes(q);
      const matchesWallet = (tx.walletLabel || "").toLowerCase().includes(q);
      const matchesHash = tx.hash.toLowerCase().includes(q);
      if (!matchesSymbol && !matchesName && !matchesWallet && !matchesHash) {
        return false;
      }
    }

    if (filterAction === "ALL") return true;
    if (filterAction === "BUY") return tx.action === "BUY" || tx.action === "CEX_WITHDRAW";
    if (filterAction === "SELL") return tx.action === "SELL" || tx.action === "CEX_DEPOSIT";
    return tx.action === filterAction;
  });

  // Extract unique coins available in feed for quick filtering
  const availableCoins = React.useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      if (!isStablecoinSymbol(t.tokenSymbol, t.tokenName) && (t.valueUsd || 0) >= 1000000) {
        const sym = t.tokenSymbol.toUpperCase();
        map.set(sym, (map.get(sym) || 0) + 1);
      }
    });
    return Array.from(map.keys()).slice(0, 10);
  }, [transactions]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "BUY":
        return {
          label: isFa ? "خرید مستقیم نهنگ" : "WHALE BUY",
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: <ArrowUpRight className="h-3 w-3 text-emerald-400" />
        };
      case "SELL":
        return {
          label: isFa ? "فروش / دامپ" : "WHALE SELL",
          color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          icon: <ArrowDownRight className="h-3 w-3 text-rose-400" />
        };
      case "CEX_WITHDRAW":
        return {
          label: isFa ? "خروج از صرافی (انباشت)" : "CEX OUTFLOW",
          color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
          icon: <ArrowRightLeft className="h-3 w-3 text-cyan-400" />
        };
      case "CEX_DEPOSIT":
        return {
          label: isFa ? "واریز به صرافی (ریسک فروش)" : "CEX INFLOW",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: <ArrowRightLeft className="h-3 w-3 text-amber-400" />
        };
      case "LP_ADD":
        return {
          label: isFa ? "تزریق نقدینگی DEX" : "LP INJECTION",
          color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          icon: <Layers className="h-3 w-3 text-purple-400" />
        };
      default:
        return {
          label: action,
          color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
          icon: <Wallet className="h-3 w-3" />
        };
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-md">
      
      {/* Header & Filter options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            {isFa ? "رادار زنده تراکنش‌های نهنگ‌ها (آنچین)" : "Live Whale On-Chain Transactions Feed"}
          </h2>
          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
            {isFa ? "فقط بالای ۱ میلیون دلار ($1M+)" : "Whales > $1,000,000"}
          </span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
            {filteredTxs.length} {isFa ? "تراکنش کلان" : "Whale Txs"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Threshold Selector */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <button
              onClick={() => setMinThresholdUsd(1000000)}
              className={`rounded px-2 py-0.5 font-medium transition-all ${
                minThresholdUsd === 1000000 ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              $1M+
            </button>
            <button
              onClick={() => setMinThresholdUsd(2000000)}
              className={`rounded px-2 py-0.5 font-medium transition-all ${
                minThresholdUsd === 2000000 ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              $2M+
            </button>
            <button
              onClick={() => setMinThresholdUsd(4000000)}
              className={`rounded px-2 py-0.5 font-medium transition-all ${
                minThresholdUsd === 4000000 ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              $4M+
            </button>
          </div>

          {/* Action filter pill buttons */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterAction("ALL")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                filterAction === "ALL" ? "bg-zinc-800 text-emerald-400 border border-zinc-700" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isFa ? "همه" : "All"}
            </button>
            <button
              onClick={() => setFilterAction("BUY")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                filterAction === "BUY" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isFa ? "خرید و انباشت" : "Buys"}
            </button>
            <button
              onClick={() => setFilterAction("SELL")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                filterAction === "SELL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isFa ? "فروش و دامپ" : "Sells"}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Search in Top 100 Coins & Quick Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 pb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFa ? "جستجو در ۱۰۰ ارز برتر (نماد، کیف‌پول، هش)..." : "Search Top 100 coins (symbol, wallet, hash)..."}
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Quick Coin Chips */}
        {availableCoins.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
            <span className="text-zinc-500 text-[10px] hidden sm:inline mr-1">
              {isFa ? "کوین‌های داغ:" : "Hot:"}
            </span>
            {availableCoins.slice(0, 7).map((sym) => {
              const isSelected = searchQuery.toUpperCase() === sym;
              return (
                <button
                  key={sym}
                  onClick={() => setSearchQuery(isSelected ? "" : sym)}
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-black border-emerald-400"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="mt-3 divide-y divide-zinc-800/50 max-h-[480px] overflow-y-auto pr-1">
        {filteredTxs.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm">
            {isFa 
              ? "در حال حاضر تراکنش نهنگ جدیدی با ارزش بالای ۱ میلیون دلار در این فیلتر ثبت نشده است." 
              : "No whale transactions found matching the >$1,000,000 threshold."}
          </div>
        ) : filteredTxs.map((tx) => {
          const actionBadge = getActionBadge(tx.action);
          const chainBadge = getChainBadge(tx.chain);
          const isBuy = tx.action === "BUY" || tx.action === "CEX_WITHDRAW" || tx.action === "LP_ADD";

          return (
            <div
              key={tx.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 hover:bg-zinc-800/30 px-2 rounded-xl transition-colors"
            >
              {/* Left: Whale identification & token */}
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${actionBadge.color}`}>
                  {actionBadge.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      onClick={() => onFilterToken && onFilterToken(tx.tokenSymbol)}
                      className="text-sm font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {tx.tokenSymbol}
                    </span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-medium border ${chainBadge.color}`}>
                      {chainBadge.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${actionBadge.color}`}>
                      {actionBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-300">
                        {tx.walletLabel}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <button
                        onClick={() => handleCopyHash(tx.hash)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1"
                        title="Copy Hash"
                      >
                        {tx.hash.length > 18 ? `${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}` : tx.hash}
                        {copiedHash === tx.hash ? <Check className="h-3 w-3 text-emerald-400" /> : null}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Value, Volume & Verifiable Explorer / DexScreener Links */}
                <div className="flex items-center sm:items-end justify-between sm:flex-col gap-1.5 pl-12 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                      {isBuy ? "+" : "-"}{formatUsd(tx.valueUsd)}
                    </span>

                    {/* Verifiable Explorer Link */}
                    {tx.explorerUrl && (
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={isFa ? `مشاهده رکورد تراکنش در اکسپلورر (${tx.chain})` : `Verify Tx on ${tx.chain} explorer`}
                        className="inline-flex items-center gap-1 rounded bg-zinc-800/90 hover:bg-emerald-500/20 border border-zinc-700/80 hover:border-emerald-500/40 text-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold transition-all"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        <span>{isFa ? "اکسپلورر" : "Tx Explorer"}</span>
                      </a>
                    )}

                    {/* DexScreener Live Pair Link */}
                    {tx.dexScreenerUrl && (
                      <a
                        href={tx.dexScreenerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={isFa ? "مشاهده نمودار زنده در DexScreener" : "View on DexScreener"}
                        className="inline-flex items-center gap-1 rounded bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 px-1.5 py-0.5 text-[10px] font-semibold transition-all"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        <span>DexScreener</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>{(tx.amountTokens || 0).toLocaleString()} {tx.tokenSymbol}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">{tx.timeAgoText || "just now"}</span>
                  </div>
                </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
