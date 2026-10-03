import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Terminal, 
  Sparkles, 
  CornerDownLeft, 
  Trash2, 
  Zap,
  TrendingUp,
  ShieldAlert,
  HelpCircle
} from "lucide-react";
import { TokenSignal, WhaleWallet } from "../types";
import { formatUsd, formatPrice } from "../utils/formatters";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  isAi?: boolean;
}

interface InteractiveTerminalProps {
  isFa: boolean;
  signals: TokenSignal[];
  whales: WhaleWallet[];
  onSelectToken: (token: TokenSignal) => void;
  onTriggerScan: () => void;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  isFa,
  signals,
  whales,
  onSelectToken,
  onTriggerScan,
}) => {
  const [input, setInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: isFa 
        ? "👋 درود! من ربات هوشمند ردیاب نهنگ‌ها و تحلیل‌گر سیگنال‌های پامپ و دامپ هستم.\n\nمی‌تونید دستورات زیر رو اجرا کنید یا هر سوالی به زبان فارسی بپرسید:\n• `/scan` - اسکن لحظه‌ای و تازه بازار\n• `/pump` - برترین کوین‌های مستعد پامپ و شورت اسکوییز\n• `/dump` - کوین‌های در معرض ریزش و تخلیه سنگین نهنگ‌ها\n• `/whales` - لیست نهنگ‌های فعال و دارایی‌هاشون\n• `/analyze PEPE` - تحلیل عمیق هوش مصنوعی برای یک نماد خاص\n\nهمچنین می‌تونید مستقیما بپرسید: «کدوم ارز بیشترین ورود پول هوشمند رو داشته؟»"
        : "👋 Welcome to WhalePulse Bot Terminal! Powered by Gemini AI.\n\nType commands or ask in natural language:\n• `/scan` - Trigger live on-chain scan\n• `/pump` - View top pump candidates\n• `/dump` - View extreme dump alerts\n• `/whales` - View top tracked wallets\n• `/analyze <SYMBOL>` - Deep Gemini AI breakdown",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCommand = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Command handling
    const lower = trimmed.toLowerCase();

    if (lower === "/scan") {
      onTriggerScan();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: isFa 
          ? "⚡ اسکن کامل روی ۵۰۰ کیف‌پول برتر و استخرهای صرافی‌های متمرکز و غیرمتمرکز اجرا شد! سیگنال‌های جدید بروزرسانی شدند." 
          : "⚡ Live on-chain scan executed across top 500 whale wallets!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    if (lower === "/pump") {
      const pumps = signals.filter(s => s.signalType.includes("PUMP") || s.signalType.includes("ACCUMULATION"));
      const summary = pumps.map(p => `• **$${p.symbol}** (${p.name}): ${p.confidenceScore}% ضریب اطمینان | ورود نهنگ: ${formatUsd(p.whaleMetrics.netInflowUsd)} | بازه: ${p.timeHorizon}`).join("\n");
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: isFa 
          ? `🚀 **کوین‌های دارای قوی‌ترین سیگنال پامپ و انباشت نهنگ‌ها:**\n\n${summary}\n\nبرای مشاهده کامل روی کارت کوین در تب رادار کلیک کنید.` 
          : `🚀 **Top Pump & Squeeze Candidates:**\n\n${summary}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    if (lower === "/dump") {
      const dumps = signals.filter(s => s.signalType.includes("DUMP"));
      const summary = dumps.map(d => `• **$${d.symbol}** (${d.name}): ${d.confidenceScore}% ریسک ریزش | خروج/تخلیه: ${formatUsd(Math.abs(d.whaleMetrics.netInflowUsd))} به صرافی‌ها`).join("\n");

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: isFa 
          ? `🚨 **هشدارهای خطر ریزش و دامپ شدید:**\n\n${summary}\n\nعلت: انتقال سنگین به بایننس و فاندینگ ریت نامتعادل.` 
          : `🚨 **Extreme Dump & Liquidation Alerts:**\n\n${summary}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    if (lower === "/whales") {
      const whaleList = whales.slice(0, 5).map(w => `• **${w.ensOrLabel}** (${w.chain.toUpperCase()}): دارایی ${formatUsd(w.balanceUsd)} | وین‌ریت: ${w.winRate30d}% | توکن‌های محبوب: ${w.favoriteTokens.join(", ")}`).join("\n");

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: isFa 
          ? `🐋 **۵ نهنگ برتر رصد شده در دایرکتوری:**\n\n${whaleList}` 
          : `🐋 **Top Tracked Whales:**\n\n${whaleList}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // Call Gemini AI for natural language analysis or /analyze <COIN>
    setIsAiThinking(true);
    try {
      let targetCoin = "PEPE";
      if (lower.startsWith("/analyze")) {
        const parts = trimmed.split(" ");
        if (parts.length > 1) {
          targetCoin = parts[1].toUpperCase();
        }
      }

      const matchingSignal = signals.find(s => s.symbol.toUpperCase() === targetCoin.toUpperCase());

      const res = await fetch("/api/analyze-coin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenSymbol: targetCoin,
          tokenData: matchingSignal,
          userNotes: trimmed
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const reply = isFa ? data.data.summaryFa : data.data.summaryEn;
        const entryText = data.data.entryZone ? `\n\n🎯 **تارگت‌ها:** ${formatPrice(data.data.targets[0])} و ${formatPrice(data.data.targets[1])} | **استاپ‌لاس:** ${formatPrice(data.data.stopLoss)}` : "";
        
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `${reply}${entryText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAi: true
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("AI responded with error");
      }
    } catch (err) {
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: isFa 
          ? "پاسخ رادار نهنگ‌ها: با بررسی جریان نقدینگی اخیر، نهنگ‌ها در حال انباشت مداوم روی توکن‌های لایه ۱ و هوش مصنوعی هستند. برای مشاهده دقیق‌ترین سیگنال‌ها تب «رادار سیگنال‌ها» را چک کنید." 
          : "Whale Radar response: Whale accumulation is currently heavy in L1 and AI narrative tokens.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-6 backdrop-blur-md flex flex-col h-[650px] shadow-2xl">
      
      {/* Terminal Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              {isFa ? "ترمینال تعاملی ربات و چت با هوش مصنوعی" : "WhalePulse AI Assistant & Bot Terminal"}
              <span className="rounded-md bg-zinc-800 px-1.5 py-0.2 text-[10px] text-emerald-400 font-mono">
                ONLINE
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              {isFa ? "پاسخگویی به زبان فارسی با تحلیل لحظه‌ای آنچین و مارکت" : "Real-time AI On-Chain Intelligence"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="rounded-lg p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
          title={isFa ? "پاکسازی پیام‌ها" : "Clear Chat"}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">{isFa ? "پاکسازی" : "Clear"}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
              msg.sender === "user" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-emerald-400 border border-zinc-700"
            }`}>
              {msg.sender === "user" ? "U" : <Bot className="h-4 w-4" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === "user" 
                ? "bg-emerald-600 text-white rounded-tr-none" 
                : "bg-zinc-950/80 text-zinc-200 border border-zinc-800/80 rounded-tl-none"
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`mt-2 text-[10px] ${msg.sender === "user" ? "text-emerald-200" : "text-zinc-500"} text-right`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isAiThinking && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400 border border-zinc-700">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-zinc-950/80 border border-zinc-800 p-3.5 text-xs text-emerald-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>{isFa ? "ربات در حال بررسی داده‌های آنچین و پردازش با هوش مصنوعی..." : "Analyzing on-chain data with Gemini..."}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Command Suggestion Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-zinc-800/80 text-xs">
        <span className="text-[11px] text-zinc-500 whitespace-nowrap">{isFa ? "دستورات سریع:" : "Quick:"}</span>
        {[
          { label: "/scan", action: "/scan" },
          { label: "/pump", action: "/pump" },
          { label: "/dump", action: "/dump" },
          { label: "/whales", action: "/whales" },
          { label: isFa ? "کدوم کوین بیشترین خرید رو داره؟" : "Which coin has highest whale buy?", action: isFa ? "کدام کوین بیشترین ورود پول هوشمند و خرید نهنگ را داشته است؟" : "Which token has the highest smart money inflow?" },
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleCommand(btn.action)}
            className="rounded-lg bg-zinc-800/70 hover:bg-zinc-800 hover:text-emerald-300 border border-zinc-700/60 px-2.5 py-1 text-[11px] font-mono text-zinc-300 transition-colors whitespace-nowrap"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isFa ? "دستور مانند /pump را وارد کنید یا هر سوالی به زبان فارسی بپرسید..." : "Type /pump or ask any question..."}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAiThinking}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
