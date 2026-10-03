import React from "react";
import { 
  Radar, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Bot, 
  Wallet, 
  HelpCircle, 
  Bell, 
  Globe, 
  Zap,
  Sliders,
  Layers
} from "lucide-react";
import { BlockchainNetwork } from "../types";

interface NavbarProps {
  isFa: boolean;
  setIsFa: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  isScanning: boolean;
  onManualScan: () => void;
  activeTab: "radar" | "universe" | "telegram" | "whales" | "terminal" | "methods";
  setActiveTab: (tab: "radar" | "universe" | "telegram" | "whales" | "terminal" | "methods") => void;
  selectedNetwork: BlockchainNetwork;
  setSelectedNetwork: (net: BlockchainNetwork) => void;
  onOpenSettings: () => void;
  unreadAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isFa,
  setIsFa,
  soundEnabled,
  setSoundEnabled,
  isScanning,
  onManualScan,
  activeTab,
  setActiveTab,
  selectedNetwork,
  setSelectedNetwork,
  onOpenSettings,
  unreadAlertCount,
}) => {
  const networks: { id: BlockchainNetwork; label: string; icon?: string }[] = [
    { id: "all", label: isFa ? "همه شبکه‌ها" : "All Networks" },
    { id: "ethereum", label: "Ethereum" },
    { id: "solana", label: "Solana" },
    { id: "base", label: "Base" },
    { id: "arbitrum", label: "Arbitrum" },
    { id: "bnb", label: "BNB Chain" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Live Status */}
          <div className="flex items-center gap-3">
            <div 
              id="brand-logo"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              onClick={() => setActiveTab("radar")}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                <Radar className="h-5 w-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  {isFa ? "رادار هوشمند نهنگ‌ها" : "WhalePulse"}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  AI V3.7
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {isFa 
                  ? "کشف کوین‌های مستعد پامپ و دامپ با رهگیری کیف‌پول‌های برتر" 
                  : "Smart Money On-Chain Breakout Scanner"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800/80">
            <button
              id="tab-radar"
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "radar"
                  ? "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              {isFa ? "رادار سیگنال‌ها" : "Signals Radar"}
            </button>

            <button
              id="tab-universe"
              onClick={() => setActiveTab("universe")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "universe"
                  ? "bg-indigo-950/80 text-indigo-300 shadow-sm border border-indigo-700/60"
                  : "text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800/50"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              {isFa ? "کل کوین‌های تحت رصد" : "Token Universe"}
            </button>

            <button
              id="tab-telegram"
              onClick={() => setActiveTab("telegram")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all relative ${
                activeTab === "telegram"
                  ? "bg-cyan-950/80 text-cyan-300 shadow-sm border border-cyan-700/60"
                  : "text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50"
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isFa ? "ربات تلگرام ۲۴ ساعته" : "Telegram Bot 24/7"}</span>
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            <button
              id="tab-whales"
              onClick={() => setActiveTab("whales")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "whales"
                  ? "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              {isFa ? "کیف پول نهنگ‌ها" : "Whale Directory"}
            </button>

            <button
              id="tab-terminal"
              onClick={() => setActiveTab("terminal")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "terminal"
                  ? "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              {isFa ? "ترمینال AI" : "AI Terminal"}
            </button>

            <button
              id="tab-methods"
              onClick={() => setActiveTab("methods")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "methods"
                  ? "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {isFa ? "متدولوژی" : "How It Works"}
            </button>
          </nav>

          {/* Action Tools: Scan, Audio, Language, Settings */}
          <div className="flex items-center gap-2">
            {/* LBank Exchange Registration Link */}
            <a
              href="https://www.lbank.com/ref/4Z8UE"
              target="_blank"
              rel="noopener noreferrer"
              title={isFa ? "ثبت‌نام و افتتاح حساب در صرافی ال‌بانک (تخفیف کارمزد)" : "Join LBank Exchange (Fee Discount)"}
              className="hidden md:flex items-center gap-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2.5 py-1.5 text-xs font-bold text-amber-300 transition-all hover:scale-105 shadow-sm"
            >
              <span>{isFa ? "صرافی LBank ⚡" : "LBank Exchange"}</span>
            </a>

            {/* Live Scan Trigger */}
            <button
              id="btn-manual-scan"
              onClick={onManualScan}
              disabled={isScanning}
              title={isFa ? "اسکن فوری بازار" : "Scan Market Now"}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden sm:inline">
                {isScanning ? (isFa ? "در حال اسکن..." : "Scanning...") : (isFa ? "اسکن زنده" : "Live Scan")}
              </span>
            </button>

            {/* Sound Mute/Unmute */}
            <button
              id="btn-toggle-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? (isFa ? "غیرفعال‌سازی صدا" : "Mute Sound") : (isFa ? "فعال‌سازی صدا" : "Enable Sound")}
              className={`rounded-lg p-2 text-xs transition-colors border ${
                soundEnabled 
                  ? "bg-zinc-900 border-zinc-700 text-emerald-400" 
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Alert & Bot Settings */}
            <button
              id="btn-alert-settings"
              onClick={onOpenSettings}
              title={isFa ? "تنظیمات ربات و هشدارها" : "Bot & Alert Settings"}
              className="relative rounded-lg p-2 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            >
              <Sliders className="h-4 w-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              id="btn-toggle-language"
              onClick={() => setIsFa(!isFa)}
              title="تغییر زبان / Switch Language"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isFa ? "EN" : "فا"}</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-zinc-900 text-[11px] overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-1 py-1 px-2 rounded-md whitespace-nowrap ${activeTab === "radar" ? "text-emerald-400 font-semibold bg-zinc-900" : "text-zinc-400"}`}
          >
            <Zap className="h-3.5 w-3.5" />
            {isFa ? "سیگنال‌ها" : "Signals"}
          </button>
          <button
            onClick={() => setActiveTab("universe")}
            className={`flex items-center gap-1 py-1 px-2 rounded-md whitespace-nowrap ${activeTab === "universe" ? "text-indigo-400 font-semibold bg-zinc-900" : "text-zinc-400"}`}
          >
            <Layers className="h-3.5 w-3.5" />
            {isFa ? "کل توکن‌ها" : "Universe"}
          </button>
          <button
            onClick={() => setActiveTab("telegram")}
            className={`flex items-center gap-1 py-1 px-2 rounded-md whitespace-nowrap ${activeTab === "telegram" ? "text-cyan-400 font-semibold bg-zinc-900" : "text-zinc-400"}`}
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400" />
            {isFa ? "ربات تلگرام" : "Telegram"}
          </button>
          <button
            onClick={() => setActiveTab("whales")}
            className={`flex items-center gap-1 py-1 px-2 rounded-md whitespace-nowrap ${activeTab === "whales" ? "text-emerald-400 font-semibold bg-zinc-900" : "text-zinc-400"}`}
          >
            <Wallet className="h-3.5 w-3.5" />
            {isFa ? "نهنگ‌ها" : "Whales"}
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1 py-1 px-2 rounded-md whitespace-nowrap ${activeTab === "terminal" ? "text-emerald-400 font-semibold bg-zinc-900" : "text-zinc-400"}`}
          >
            <Zap className="h-3.5 w-3.5" />
            {isFa ? "ترمینال" : "AI"}
          </button>
          <button
            onClick={() => setActiveTab("methods")}
            className={`flex items-center gap-1 py-1 px-2 rounded-md whitespace-nowrap ${activeTab === "methods" ? "text-emerald-400 font-semibold bg-zinc-900" : "text-zinc-400"}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {isFa ? "روش‌ها" : "Methods"}
          </button>
        </div>

        {/* Network Filter Bar */}
        {activeTab === "radar" && (
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-zinc-900 scrollbar-none">
            <span className="text-[11px] font-medium text-zinc-500 whitespace-nowrap">
              {isFa ? "فیلتر شبکه:" : "Network:"}
            </span>
            <div className="flex items-center gap-1.5">
              {networks.map((net) => (
                <button
                  key={net.id}
                  id={`filter-net-${net.id}`}
                  onClick={() => setSelectedNetwork(net.id)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all whitespace-nowrap ${
                    selectedNetwork === net.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {net.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
