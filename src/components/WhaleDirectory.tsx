import React, { useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Coins,
  Award,
  Zap
} from "lucide-react";
import { WhaleWallet } from "../types";
import { formatUsd, getChainBadge } from "../utils/formatters";

interface WhaleDirectoryProps {
  whales: WhaleWallet[];
  isFa: boolean;
  onAddCustomWhale: (newWhale: WhaleWallet) => void;
  onDeleteCustomWhale: (id: string) => void;
  onSelectTokenFilter?: (symbol: string) => void;
}

export const WhaleDirectory: React.FC<WhaleDirectoryProps> = ({
  whales,
  isFa,
  onAddCustomWhale,
  onDeleteCustomWhale,
  onSelectTokenFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Whale Form State
  const [formLabel, setFormLabel] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formChain, setFormChain] = useState<"ethereum" | "solana" | "base" | "arbitrum" | "bnb" | "hyperliquid">("ethereum");
  const [formCategory, setFormCategory] = useState<"SMART_INSIDER" | "VC_FUND" | "MARKET_MAKER" | "DEX_SNIPER" | "HYPERDASH_ALPHA">("SMART_INSIDER");
  const [formTokens, setFormTokens] = useState("ETH, SOL, HYPE");

  const filteredWhales = whales.filter((w) => {
    const matchesSearch = 
      w.ensOrLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.favoriteTokens.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "ALL" || w.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel || !formAddress) return;

    const newWhale: WhaleWallet = {
      id: `custom-whale-${Date.now()}`,
      address: formAddress,
      ensOrLabel: formLabel,
      chain: formChain,
      category: formCategory,
      balanceUsd: 12000000 + Math.floor(Math.random() * 45000000),
      winRate30d: 85.0 + Math.floor(Math.random() * 10),
      pnl30d: 3500000 + Math.floor(Math.random() * 8000000),
      favoriteTokens: formTokens.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
      isCustom: true,
      notes: isFa ? "کیف پول اختصاصی اضافه شده توسط کاربر" : "Custom user-added tracked whale",
      hyperdashUrl: formChain === "hyperliquid" ? "https://hyperdash.com" : undefined
    };

    onAddCustomWhale(newWhale);
    setShowAddModal(false);
    setFormLabel("");
    setFormAddress("");
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "VC_FUND": return isFa ? "صندوق سرمایه‌گذاری (VC)" : "VC Fund";
      case "MARKET_MAKER": return isFa ? "مارکت‌میکر (MM)" : "Market Maker";
      case "SMART_INSIDER": return isFa ? "اسمارت‌مانی / اینسایدر" : "Smart Insider";
      case "DEX_SNIPER": return isFa ? "اسنایپر صرافی غیرمتمرکز" : "DEX Sniper";
      case "HYPERDASH_ALPHA": return isFa ? "نهنگ‌های پرپ Hyperdash" : "Hyperdash Alpha";
      case "MEV_BOT": return isFa ? "ربات MEV سودآور" : "MEV Bot";
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              {isFa ? "دایرکتوری و رصد کیف‌پول‌های برتر و اسمارت‌مانی" : "Elite Smart Money & Whale Wallets Directory"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {isFa 
              ? "ردیابی زنده پرتفوی، وین‌ریت و سیگنال‌های خرید نهنگ‌ها با سابقه سودآوری بالا (>۸۰٪ Win Rate)"
              : "Track top profitable market makers, institutional funds and high-winrate on-chain snipers"}
          </p>
        </div>

        {/* Add custom whale button */}
        <button
          id="btn-open-add-whale"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{isFa ? "+ افزودن کیف پول دلخواه برای رصد" : "+ Track Custom Whale Wallet"}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFa ? "جستجو بر اساس نام، آدرس والت یا نماد کوین (مثلا PEPE, Wintermute)..." : "Search by wallet name, address or token symbol..."}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pr-9 pl-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {["ALL", "HYPERDASH_ALPHA", "SMART_INSIDER", "MARKET_MAKER", "VC_FUND", "DEX_SNIPER"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {cat === "ALL" ? (isFa ? "همه دسته‌ها" : "All Categories") : getCategoryTitle(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Whale Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWhales.map((whale) => {
          const chainBadge = getChainBadge(whale.chain);

          return (
            <div
              key={whale.id}
              className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {whale.ensOrLabel}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`rounded px-1.5 py-0.2 text-[10px] font-medium border ${chainBadge.color}`}>
                          {chainBadge.label}
                        </span>
                        <span className="rounded bg-zinc-800/80 px-1.5 py-0.2 text-[10px] text-zinc-400">
                          {getCategoryTitle(whale.category)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {whale.isCustom && (
                    <button
                      onClick={() => onDeleteCustomWhale(whale.id)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title={isFa ? "حذف کیف‌پول" : "Remove Wallet"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Address Box */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-950/80 px-2.5 py-1.5 border border-zinc-800/60 text-xs">
                  <span className="font-mono text-zinc-400 text-[11px] truncate max-w-[180px]">
                    {whale.address}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={whale.chain === "hyperliquid" || whale.hyperdashUrl ? (whale.hyperdashUrl || "https://hyperdash.com") : (whale.chain === "solana" ? `https://solscan.io/account/${whale.address}` : `https://etherscan.io/address/${whale.address}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-teal-400 transition-colors p-1"
                      title={whale.chain === "hyperliquid" || whale.hyperdashUrl ? "مشاهده در Hyperdash" : (isFa ? "مشاهده در اکسپلورر" : "View in Explorer")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopy(whale.id, whale.address)}
                      className="text-zinc-500 hover:text-emerald-400 transition-colors p-1"
                      title={isFa ? "کپی آدرس والت" : "Copy Address"}
                    >
                      {copiedId === whale.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-950/40 p-3 border border-zinc-800/50">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {isFa ? "نرخ موفقیت (۳۰ روزه)" : "30d Win Rate"}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm font-bold text-emerald-400">
                        {whale.winRate30d}%
                      </span>
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {isFa ? "سود خالص تخمینی" : "30d Net PnL"}
                    </span>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      +{formatUsd(whale.pnl30d)}
                    </div>
                  </div>
                </div>

                {/* Total Balance & Notes */}
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>{isFa ? "کل دارایی تخمینی:" : "Total Balance:"}</span>
                  <span className="font-bold text-zinc-200">{formatUsd(whale.balanceUsd)}</span>
                </div>

                {whale.notes && (
                  <p className="mt-2 text-[11px] text-zinc-400 italic line-clamp-2">
                    "{whale.notes}"
                  </p>
                )}
              </div>

              {/* Favorite Bags / Coins */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                  <span>{isFa ? "توکن‌های محبوب و انباشت شده:" : "Holding / Accumulating:"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {whale.favoriteTokens.map((token) => (
                    <button
                      key={token}
                      onClick={() => onSelectTokenFilter && onSelectTokenFilter(token)}
                      className="rounded-md bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-300 border border-zinc-700/60 px-2 py-0.5 text-[11px] font-bold text-zinc-300 transition-colors"
                    >
                      ${token}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Custom Whale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            
            <h3 className="text-base font-bold text-white">
              {isFa ? "افزودن کیف‌پول نهنگ جدید به رادار" : "Track New Whale Wallet"}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {isFa ? "آدرس والت را وارد کنید تا تمام تراکنش‌ها و انباشت‌های آن رصد شود." : "Enter on-chain address to monitor transactions."}
            </p>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  {isFa ? "نام یا برچسب والت:" : "Wallet Label / Identity:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isFa ? "مثلا: نهنگ ناشناس سولانا، صندوق آلفا..." : "e.g. Legendary ETH Sniper"}
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  {isFa ? "آدرس آنچین کیف‌پول:" : "Wallet Address:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x... or Solana pubkey"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {isFa ? "شبکه:" : "Chain:"}
                  </label>
                  <select
                    value={formChain}
                    onChange={(e: any) => setFormChain(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="solana">Solana</option>
                    <option value="hyperliquid">Hyperliquid (Hyperdash)</option>
                    <option value="base">Base</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="bnb">BNB Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {isFa ? "دسته‌بندی:" : "Category:"}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="SMART_INSIDER">{isFa ? "اسمارت مانی" : "Smart Insider"}</option>
                    <option value="HYPERDASH_ALPHA">{isFa ? "نهنگ Hyperdash" : "Hyperdash Alpha"}</option>
                    <option value="VC_FUND">{isFa ? "صندوق VC" : "VC Fund"}</option>
                    <option value="MARKET_MAKER">{isFa ? "مارکت میکر" : "Market Maker"}</option>
                    <option value="DEX_SNIPER">{isFa ? "اسنایپر DEX" : "DEX Sniper"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  {isFa ? "توکن‌های مورد علاقه (با کاما جدا کنید):" : "Favorite Tokens (comma separated):"}
                </label>
                <input
                  type="text"
                  placeholder="PEPE, SOL, SUI, VIRTUAL"
                  value={formTokens}
                  onChange={(e) => setFormTokens(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  {isFa ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  {isFa ? "ثبت و فعال‌سازی رصد" : "Start Tracking"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
