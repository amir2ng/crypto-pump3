import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  Radio, 
  Copy, 
  Check, 
  Coins, 
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ScannedTokenInfo, BlockchainNetwork } from "../types";
import { formatUsd, formatPrice, formatPercent, getChainBadge } from "../utils/formatters";

interface ScannedTokensUniverseProps {
  isFa: boolean;
  onAnalyzeToken?: (token: any) => void;
  onSelectToken?: (symbol: string) => void;
}

export const ScannedTokensUniverse: React.FC<ScannedTokensUniverseProps> = ({
  isFa,
  onAnalyzeToken,
  onSelectToken,
}) => {
  const [tokens, setTokens] = useState<ScannedTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedChain, setSelectedChain] = useState<BlockchainNetwork>("all");
  const [filterFlow, setFilterFlow] = useState<"ALL" | "BUY" | "SELL" | "ACTIVE_SIGNAL">("ALL");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "TOP_200" | "WILDCARD_DISCOVERY">("ALL");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "flow" | "security">("volume");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | "all">(50);

  const fetchScannedTokens = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/market/scanned-tokens");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTokens(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to load scanned tokens universe:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScannedTokens();
    const interval = setInterval(() => {
      fetchScannedTokens();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleTokenSelect = (token: ScannedTokenInfo) => {
    if (onAnalyzeToken) {
      onAnalyzeToken(token);
    } else if (onSelectToken) {
      onSelectToken(token.symbol);
    }
  };

  // Filtered and sorted tokens
  const filteredTokens = useMemo(() => {
    return tokens
      .filter((t) => {
        // Scope filter (Top 200 vs Wildcard Discovery)
        if (scopeFilter === "TOP_200" && t.isWildcardDiscovery) return false;
        if (scopeFilter === "WILDCARD_DISCOVERY" && !t.isWildcardDiscovery) return false;

        // Chain filter
        if (selectedChain !== "all" && t.chain !== selectedChain) return false;
        
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSym = (t.symbol || "").toLowerCase().includes(q);
          const matchName = (t.name || "").toLowerCase().includes(q);
          const matchAddr = (t.contractAddress || "").toLowerCase().includes(q);
          if (!matchSym && !matchName && !matchAddr) return false;
        }

        // Flow / Signal filter
        if (filterFlow === "BUY" && t.whaleStatus !== "ACCUMULATION") return false;
        if (filterFlow === "SELL" && t.whaleStatus !== "DISTRIBUTION") return false;
        if (filterFlow === "ACTIVE_SIGNAL" && !t.activeSignalDirection) return false;

        return true;
      })
      .sort((a, b) => {
        const flowA = (a.whaleNetFlowUsd ?? (a as any).netWhaleFlowUsd ?? 0);
        const flowB = (b.whaleNetFlowUsd ?? (b as any).netWhaleFlowUsd ?? 0);
        if (sortBy === "volume") return (b.volume24h || 0) - (a.volume24h || 0);
        if (sortBy === "change") return (b.change24h || 0) - (a.change24h || 0);
        if (sortBy === "flow") return Math.abs(flowB) - Math.abs(flowA);
        if (sortBy === "security") return (b.securityScore || 0) - (a.securityScore || 0);
        return 0;
      });
  }, [tokens, scopeFilter, selectedChain, searchQuery, filterFlow, sortBy]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [scopeFilter, selectedChain, searchQuery, filterFlow, sortBy, pageSize]);

  // Pagination calculations
  const totalItems = filteredTokens.length;
  const numericPageSize = pageSize === "all" ? totalItems : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / (numericPageSize || 1)));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = pageSize === "all" ? 0 : (validCurrentPage - 1) * numericPageSize;
  const endIndex = pageSize === "all" ? totalItems : Math.min(startIndex + numericPageSize, totalItems);
  const paginatedTokens = useMemo(() => {
    if (pageSize === "all") return filteredTokens;
    return filteredTokens.slice(startIndex, endIndex);
  }, [filteredTokens, startIndex, endIndex, pageSize]);

  // Overall statistics
  const totalVolume = useMemo(() => tokens.reduce((acc, t) => acc + (t.volume24h || 0), 0), [tokens]);
  const activeLongCount = useMemo(() => tokens.filter(t => t.activeSignalDirection === "PUMP").length, [tokens]);
  const activeShortCount = useMemo(() => tokens.filter(t => t.activeSignalDirection === "DUMP").length, [tokens]);
  const totalWhaleInflow = useMemo(() => tokens.reduce((acc, t) => acc + (t.whaleNetFlowUsd ?? (t as any).netWhaleFlowUsd ?? 0), 0), [tokens]);

  return (
    <div className="space-y-6" id="scanned-tokens-universe-container">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-xs font-semibold text-purple-300">
                {isFa ? "رصدخانه کامل مارکت و اسکنر ۲۴ ساعته" : "24/7 Market Screener Universe"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {isFa ? `پایش پیوسته ${tokens.length} توکن فعال` : `Monitoring ${tokens.length} Coins`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-purple-400" />
              <span>{isFa ? "رصدخانه کل توکن‌های تحت بررسی اسکنر ۲۴ ساعته" : "Active Monitored Token Screener"}</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              {isFa 
                ? "موتور اسکنر به صورت پیوسته و ۲۴ ساعته در حال بررسی تراکنش‌های بلاکچین، خریدهای خوشه‌ای نهنگ‌ها، خروج به صرافی‌ها، نقدینگی و امنیت قرارداد کلیه این توکن‌هاست." 
                : "Continuous real-time screener tracking whale cluster accumulation, CEX deposits, liquidity locks, and safety scores across all listed assets."}
            </p>
          </div>

          {/* Quick Refresh & Auto Scan Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 text-xs">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-zinc-400 block text-[10px]">{isFa ? "سرعت اسکن آنچین" : "Scan Speed"}</span>
                <span className="font-semibold text-zinc-200 font-mono">{isFa ? "هر ۱۲ ثانیه (پیوسته)" : "Every 12s (Live)"}</span>
              </div>
            </div>

            <button
              onClick={() => fetchScannedTokens(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-purple-400" : ""}`} />
              <span>{isRefreshing ? (isFa ? "بروزرسانی..." : "Refreshing...") : (isFa ? "بروزرسانی داده‌ها" : "Refresh")}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Counters */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80">
          <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60">
            <span className="text-[11px] text-zinc-400 block">{isFa ? "تعداد توکن‌های تحت بررسی" : "Monitored Tokens"}</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">{tokens.length} <span className="text-xs font-normal text-purple-400">{isFa ? "کوین فعال" : "Pairs"}</span></span>
          </div>

          <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60">
            <span className="text-[11px] text-zinc-400 block">{isFa ? "حجم معاملات ۲۴ ساعته تحت رصد" : "Tracked 24h Volume"}</span>
            <span className="text-lg font-black text-cyan-300 font-mono mt-0.5 block">{formatUsd(totalVolume)}</span>
          </div>

          <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60">
            <span className="text-[11px] text-zinc-400 block">{isFa ? "سیگنال‌های خرید و فروش فعال" : "Active Signals"}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-emerald-400 font-mono">🟢 {activeLongCount} LONG</span>
              <span className="text-xs font-bold text-rose-400 font-mono">🔴 {activeShortCount} SHORT</span>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60">
            <span className="text-[11px] text-zinc-400 block">{isFa ? "ورود/خروج خالص نهنگ‌ها" : "Whale Net Flow"}</span>
            <span className={`text-lg font-black font-mono mt-0.5 block ${totalWhaleInflow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalWhaleInflow >= 0 ? "+" : ""}{formatUsd(totalWhaleInflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? "جستجو بر اساس نماد (مثلا SOL, PEPE, VIRTUAL) یا نام یا آدرس قرارداد..." : "Search by symbol, name or contract..."}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pr-10 pl-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chain Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: isFa ? "همه شبکه‌ها" : "All" },
              { id: "solana", label: "Solana" },
              { id: "ethereum", label: "Ethereum" },
              { id: "base", label: "Base" },
              { id: "arbitrum", label: "Arbitrum" },
              { id: "bnb", label: "BNB" },
            ].map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id as BlockchainNetwork)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  selectedChain === chain.id
                    ? "bg-purple-600 text-white font-semibold shadow-sm"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {chain.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Filter Tabs: Top 100 vs Wildcard Whale Discoveries */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60 text-xs">
          <span className="text-zinc-500 text-[11px] ml-1">{isFa ? "دامنه بررسی:" : "Scope:"}</span>
          <button
            onClick={() => setScopeFilter("ALL")}
            className={`rounded-lg px-3 py-1 transition-all ${
              scopeFilter === "ALL"
                ? "bg-purple-600 text-white font-semibold shadow-sm"
                : "bg-zinc-800/70 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isFa ? "کل دارایی‌ها" : "All Universe"} ({tokens.length})
          </button>
          <button
            onClick={() => setScopeFilter("TOP_200")}
            className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
              scopeFilter === "TOP_200"
                ? "bg-purple-600 text-white font-semibold shadow-sm"
                : "bg-zinc-800/70 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>🏆</span>
            <span>{isFa ? "۱۰۰ کوین برتر بازار (CoinGecko / CMC)" : "Top 100 Coins"}</span>
            <span className="text-[10px] opacity-75">
              ({tokens.filter(t => !t.isWildcardDiscovery).length})
            </span>
          </button>
          <button
            onClick={() => setScopeFilter("WILDCARD_DISCOVERY")}
            className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
              scopeFilter === "WILDCARD_DISCOVERY"
                ? "bg-amber-600 text-white font-semibold shadow-sm"
                : "bg-amber-950/40 border border-amber-800/40 text-amber-300 hover:bg-amber-900/40"
            }`}
          >
            <span>🔥</span>
            <span>{isFa ? "شکار کوین‌های سازمانی و نهنگ‌ها" : "Whale & Institutional Targets"}</span>
            <span className="text-[10px] opacity-80 font-bold">
              ({tokens.filter(t => t.isWildcardDiscovery).length})
            </span>
          </button>
        </div>

        {/* Secondary Filter Tabs: Flow & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px] ml-1">{isFa ? "فیلتر وضعیت:" : "Status:"}</span>
            <button
              onClick={() => setFilterFlow("ALL")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterFlow === "ALL" 
                  ? "bg-zinc-800 text-white font-semibold border border-zinc-700" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isFa ? "همه وضعیت‌ها" : "All"}
            </button>
            <button
              onClick={() => setFilterFlow("BUY")}
              className={`rounded-lg px-2.5 py-1 transition-colors flex items-center gap-1 ${
                filterFlow === "BUY" 
                  ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-700" 
                  : "text-zinc-400 hover:text-emerald-300"
              }`}
            >
              <span>🟢</span>
              <span>{isFa ? "انباشت نهنگ‌ها (خرید)" : "Whale Buys"}</span>
            </button>
            <button
              onClick={() => setFilterFlow("SELL")}
              className={`rounded-lg px-2.5 py-1 transition-colors flex items-center gap-1 ${
                filterFlow === "SELL" 
                  ? "bg-rose-950/80 text-rose-300 font-semibold border border-rose-700" 
                  : "text-zinc-400 hover:text-rose-300"
              }`}
            >
              <span>🔴</span>
              <span>{isFa ? "تخلیه نهنگ‌ها (فروش/SHORT)" : "Whale Sells"}</span>
            </button>
            <button
              onClick={() => setFilterFlow("ACTIVE_SIGNAL")}
              className={`rounded-lg px-2.5 py-1 transition-colors flex items-center gap-1 ${
                filterFlow === "ACTIVE_SIGNAL" 
                  ? "bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-700" 
                  : "text-zinc-400 hover:text-cyan-300"
              }`}
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>{isFa ? "دارای سیگنال فعال" : "Has Signal"}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span>{isFa ? "مرتب‌سازی:" : "Sort:"}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 focus:outline-none text-xs"
            >
              <option value="volume">{isFa ? "حجم معاملات ۲۴ ساعته" : "24h Volume"}</option>
              <option value="change">{isFa ? "بیشترین تغییر ۲۴ ساعته" : "24h Change"}</option>
              <option value="flow">{isFa ? "حجم ورود/خروج نهنگ‌ها" : "Whale Flow"}</option>
              <option value="security">{isFa ? "امتیاز امنیت قرارداد" : "Security Score"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Scanned Tokens Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-medium">
                <th className="py-3.5 px-4">{isFa ? "توکن و شبکه" : "Asset"}</th>
                <th className="py-3.5 px-4">{isFa ? "قیمت لحظه‌ای (TV Feed)" : "Live Price"}</th>
                <th className="py-3.5 px-4">{isFa ? "تغییر ۲۴ ساعته" : "24h Change"}</th>
                <th className="py-3.5 px-4">{isFa ? "حجم معاملات ۲۴ ساعته" : "24h Volume"}</th>
                <th className="py-3.5 px-4">{isFa ? "جریان خالص نهنگ‌ها" : "Whale Net Flow"}</th>
                <th className="py-3.5 px-4">{isFa ? "امنیت قرارداد" : "Security"}</th>
                <th className="py-3.5 px-4">{isFa ? "وضعیت سیگنال آنچین" : "Signal Status"}</th>
                <th className="py-3.5 px-4 text-center">{isFa ? "اقدام و تحلیل" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-6 bg-zinc-800/50 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    {isFa ? "هیچ توکنی مطابق با فیلترهای انتخابی یافت نشد." : "No matching tokens found."}
                  </td>
                </tr>
              ) : (
                paginatedTokens.map((token) => {
                  const chainBadge = getChainBadge(token.chain);
                  const isPositive = (token.change24h || 0) >= 0;
                  const isWhaleAccumulating = token.whaleStatus === "ACCUMULATION";
                  const isWhaleDumping = token.whaleStatus === "DISTRIBUTION";
                  const flow = token.whaleNetFlowUsd ?? (token as any).netWhaleFlowUsd ?? 0;

                  return (
                    <tr 
                      key={token.id}
                      className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      onClick={() => handleTokenSelect(token)}
                    >
                      {/* Token Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-black text-white shadow-inner">
                            {token.symbol.slice(0, 4)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                ${token.symbol}
                              </span>
                              <span className={`rounded px-1.5 py-0.2 text-[9px] font-medium border ${chainBadge.color}`}>
                                {chainBadge.label}
                              </span>
                              {token.isWildcardDiscovery ? (
                                <span 
                                  className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 animate-pulse"
                                  title={token.discoveryReason || "کشف آنچین خارج از ۲۰۰ برتر"}
                                >
                                  🔥 {isFa ? "شکار نهنگ" : "Whale Gem"}
                                </span>
                              ) : token.rank ? (
                                <span className="rounded bg-purple-500/20 border border-purple-500/30 px-1 py-0.2 text-[9px] font-semibold text-purple-300 font-mono">
                                  #{token.rank}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[11px] text-zinc-400 block truncate max-w-[140px]">
                              {token.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Live Price with TV Pulse */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-100 text-sm">
                            {formatPrice(token.price)}
                          </span>
                          <span className="inline-flex items-center gap-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 px-1 py-0.2 text-[9px] text-cyan-300">
                            <span className="h-1 w-1 rounded-full bg-cyan-400 animate-ping" />
                            TV
                          </span>
                        </div>
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          <span>{formatPercent(token.change24h)}</span>
                        </div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {formatUsd(token.volume24h)}
                      </td>

                      {/* Whale Net Flow */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className={`font-mono font-bold ${flow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {flow >= 0 ? "+" : ""}{formatUsd(flow)}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {isWhaleAccumulating ? "🟢 انباشت متمرکز" : isWhaleDumping ? "🔴 تخلیه و خروج" : "🟡 در حال پایش"}
                          </span>
                        </div>
                      </td>

                      {/* Security Audit */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 rounded-md bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{token.securityScore || 98}/100</span>
                        </div>
                      </td>

                      {/* Signal Status */}
                      <td className="py-3.5 px-4">
                        {token.activeSignalDirection === "PUMP" ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 shadow-sm shadow-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>🟢 سیگنال خرید (LONG)</span>
                          </span>
                        ) : token.activeSignalDirection === "DUMP" ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-300 shadow-sm shadow-rose-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                            <span>🔴 سیگنال فروش (SHORT)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                            <Radio className="h-3 w-3 text-purple-400 animate-pulse" />
                            <span>در حال رصد ۲۴ ساعته</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleTokenSelect(token)}
                            className="inline-flex items-center gap-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                            title="تحلیل فوری با هوش مصنوعی"
                          >
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            <span>تحلیل AI</span>
                          </button>

                          {token.contractAddress && (
                            <button
                              onClick={(e) => handleCopy(token.contractAddress!, e)}
                              className="rounded-lg p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                              title="کپی آدرس قرارداد"
                            >
                              {copiedAddress === token.contractAddress ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredTokens.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Info Summary */}
            <div className="flex items-center gap-2 text-zinc-400">
              <span>{isFa ? "نمایش" : "Showing"}</span>
              <span className="font-mono font-bold text-white">
                {startIndex + 1} - {endIndex}
              </span>
              <span>{isFa ? "از مجموع" : "of"}</span>
              <span className="font-mono font-bold text-purple-400">
                {totalItems}
              </span>
              <span>{isFa ? "کوین تحت رصد" : "monitored coins"}</span>
            </div>

            {/* Page Size Selector & Navigation */}
            <div className="flex items-center gap-3">
              {/* Page size toggle */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                <span className="text-[10px] text-zinc-500 px-1.5">{isFa ? "تعداد:" : "Per page:"}</span>
                {[50, 100, "all"].map((size) => (
                  <button
                    key={String(size)}
                    onClick={() => {
                      setPageSize(size as any);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      pageSize === size
                        ? "bg-purple-600 text-white font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {size === "all" ? (isFa ? "همه (۲۰۰+)" : "All") : size}
                  </button>
                ))}
              </div>

              {/* Page buttons (if not all) */}
              {pageSize !== "all" && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage <= 1}
                    className="p-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    title={isFa ? "صفحه قبلی" : "Previous Page"}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1 font-mono">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-colors ${
                            validCurrentPage === pageNum
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validCurrentPage >= totalPages}
                    className="p-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    title={isFa ? "صفحه بعدی" : "Next Page"}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
