// Formatters and helper functions for crypto data

export function formatUsd(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "$0.00";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return "$0.00";
  if (price === 0) return "$0.00";
  if (price < 0.0001) {
    return `$${price.toFixed(8)}`;
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0.00%";
  const prefix = val > 0 ? "+" : "";
  return `${prefix}${val.toFixed(2)}%`;
}

export function getChainBadge(chain: string) {
  switch (chain.toLowerCase()) {
    case "solana":
      return { label: "Solana", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" };
    case "ethereum":
      return { label: "Ethereum", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
    case "base":
      return { label: "Base", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" };
    case "arbitrum":
      return { label: "Arbitrum", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" };
    case "bnb":
      return { label: "BNB Chain", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    case "hyperliquid":
      return { label: "Hyperliquid (Hyperdash)", color: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
    default:
      return { label: chain, color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" };
  }
}

export function getSignalConfig(type: string, isFa: boolean) {
  switch (type) {
    case "EXTREME_PUMP":
      return {
        label: isFa ? "پامپ شدید (قوی)" : "EXTREME PUMP",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20 shadow-sm",
        glowColor: "border-emerald-500/40 bg-emerald-950/10",
        icon: "TrendingUp",
        direction: "PUMP",
        persianDesc: "احتمال جهش صعودی پرشتاب"
      };
    case "HIGH_PUMP":
      return {
        label: isFa ? "سیگنال صعودی" : "HIGH PUMP",
        badgeColor: "bg-green-500/20 text-green-300 border-green-500/40",
        glowColor: "border-green-500/30 bg-green-950/10",
        icon: "ArrowUpRight",
        direction: "PUMP",
        persianDesc: "ورود سرمایه نهادی مستمر"
      };
    case "EXTREME_DUMP":
      return {
        label: isFa ? "خطر ریزش شدید" : "EXTREME DUMP",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20 shadow-sm",
        glowColor: "border-rose-500/40 bg-rose-950/10",
        icon: "TrendingDown",
        direction: "DUMP",
        persianDesc: "تخلیه سنگین به صرافی‌ها"
      };
    case "HIGH_DUMP":
      return {
        label: isFa ? "سیگنال نزولی" : "DUMP RISK",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
        glowColor: "border-red-500/30 bg-red-950/10",
        icon: "ArrowDownRight",
        direction: "DUMP",
        persianDesc: "تضعیف حمایت اردرهای خرید"
      };
    case "STEALTH_ACCUMULATION":
      return {
        label: isFa ? "انباشت مخفی نهنگ" : "STEALTH ACCUMULATION",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        glowColor: "border-cyan-500/30 bg-cyan-950/10",
        icon: "Sparkles",
        direction: "PUMP",
        persianDesc: "خرید بی‌صدا قبل از حرکت"
      };
    case "LIQUIDATION_SQUEEZE":
      return {
        label: isFa ? "شورت اسکوییز" : "SHORT SQUEEZE",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        glowColor: "border-amber-500/30 bg-amber-950/10",
        icon: "Zap",
        direction: "PUMP",
        persianDesc: "فشار فاندینگ ریت منفی"
      };
    case "MULTI_WHALE_ACCUMULATION":
      return {
        label: isFa ? "خرید همزمان چند نهنگ (امن)" : "MULTI-WHALE CLUSTER",
        badgeColor: "bg-emerald-400/25 text-emerald-200 border-emerald-400/60 shadow-emerald-500/30 shadow-md",
        glowColor: "border-emerald-400/60 bg-emerald-950/25",
        icon: "Users",
        direction: "PUMP",
        persianDesc: "انباشت چند کیف‌پول با امنیت تایید شده"
      };
    case "WHALE_DISTRIBUTION_DUMP":
      return {
        label: isFa ? "تخلیه سنگین نهنگ (فروش / SHORT)" : "WHALE DUMP (SHORT)",
        badgeColor: "bg-rose-500/25 text-rose-200 border-rose-500/60 shadow-rose-500/30 shadow-md",
        glowColor: "border-rose-500/50 bg-rose-950/25",
        icon: "TrendingDown",
        direction: "DUMP",
        persianDesc: "تخلیه اردرها و واریز سنگین به صرافی‌ها"
      };
    case "SMART_MONEY_EXIT":
      return {
        label: isFa ? "خروج پول هوشمند (هشدار ریزش)" : "SMART MONEY EXIT",
        badgeColor: "bg-red-500/25 text-red-200 border-red-500/50 shadow-red-500/20 shadow-sm",
        glowColor: "border-red-500/40 bg-red-950/20",
        icon: "ArrowDownRight",
        direction: "DUMP",
        persianDesc: "سیو سود و بسته شدن پوزیشن‌های نهادی"
      };
    default:
      return {
        label: type,
        badgeColor: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
        glowColor: "border-zinc-700 bg-zinc-900/30",
        icon: "Activity",
        direction: "NEUTRAL",
        persianDesc: "نوسان عادی"
      };
  }
}
