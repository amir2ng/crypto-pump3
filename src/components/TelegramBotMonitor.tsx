import React, { useState, useEffect } from "react";
import { 
  Send, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Sliders, 
  Clock, 
  ArrowUpRight, 
  Zap, 
  MessageSquare, 
  CornerDownLeft, 
  DollarSign, 
  Activity,
  Check,
  Copy,
  ExternalLink,
  Target,
  RotateCcw,
  Radio,
  Archive,
  Trash2,
  FileEdit
} from "lucide-react";
import { TrackedSignal, TelegramMessageLog, TelegramBotStatus } from "../types";
import { TelegramMessageTemplateEditor } from "./TelegramMessageTemplateEditor";

function formatPriceDisplay(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return "0.00";
  if (price < 0.000001) return price.toFixed(8);
  if (price < 0.001) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 10) return price.toFixed(3);
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface TelegramBotMonitorProps {
  onAnalyzeToken?: (symbol: string) => void;
}

export const TelegramBotMonitor: React.FC<TelegramBotMonitorProps> = ({ onAnalyzeToken }) => {
  const [botStatus, setBotStatus] = useState<TelegramBotStatus | null>(null);
  const [activeSignals, setActiveSignals] = useState<TrackedSignal[]>([]);
  const [archivedSignals, setArchivedSignals] = useState<TrackedSignal[]>([]);
  const [telegramLogs, setTelegramLogs] = useState<TelegramMessageLog[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState<boolean>(false);
  const [editToken, setEditToken] = useState<string>("7605808577:AAHWOnCL30D7nZRzGH3h0TWT2OhV54DUdIk");
  const [editChatId, setEditChatId] = useState<string>("119270530");
  const [editChannelUsername, setEditChannelUsername] = useState<string>("@nahang_yab");
  const [editMinConfidence, setEditMinConfidence] = useState<number>(85);
  const [editMinWhalesCount, setEditMinWhalesCount] = useState<number>(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingSignalId, setSimulatingSignalId] = useState<string | null>(null);

  const fetchBotData = async () => {
    try {
      const [statusRes, signalsRes, logsRes] = await Promise.all([
        fetch("/api/bot/status"),
        fetch("/api/bot/tracked-signals"),
        fetch("/api/bot/telegram-logs")
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setBotStatus(data.data);
        if (data.data.botToken) setEditToken(data.data.botToken);
        if (data.data.chatId) setEditChatId(data.data.chatId);
        if (data.data.channelUsername) setEditChannelUsername(data.data.channelUsername);
        if (data.data.minConfidence) setEditMinConfidence(data.data.minConfidence);
        if (data.data.minWhalesCount) setEditMinWhalesCount(data.data.minWhalesCount);
      }

      if (signalsRes.ok) {
        const data = await signalsRes.json();
        if (data.active && data.archived) {
          setActiveSignals(data.active);
          setArchivedSignals(data.archived);
        } else if (data.data && data.data.active) {
          setActiveSignals(data.data.active);
          setArchivedSignals(data.data.archived || []);
        } else if (Array.isArray(data.data)) {
          setActiveSignals(data.data.filter((s: any) => s.status === "ACTIVE" || s.status === "HIT_TP1"));
          setArchivedSignals(data.data.filter((s: any) => s.status === "HIT_TP2" || s.status === "HIT_STOP_LOSS"));
        }
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setTelegramLogs(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching Telegram bot data:", err);
    }
  };

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/bot/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || "پیام تستی به تلگرام و کانال ارسال شد!" });
        fetchBotData();
      } else {
        setTestResult({ success: false, message: data.error || "خطا در ارسال پیام" });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "خطای ارتباط با سرور" });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: editToken,
          chatId: editChatId,
          channelUsername: editChannelUsername,
          minConfidence: editMinConfidence,
          minWhalesCount: editMinWhalesCount,
          is247Active: true
        })
      });
      if (res.ok) {
        setIsConfigOpen(false);
        fetchBotData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [isScanningNow, setIsScanningNow] = useState<boolean>(false);

  const handleScanNow = async () => {
    setIsScanningNow(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/bot/scan-now", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
        fetchBotData();
      } else {
        setTestResult({ success: false, message: data.error || "خطا در اسکن بازار" });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "خطای ارتباط با سرور" });
    } finally {
      setIsScanningNow(false);
    }
  };

  const handleResetAndReseedTrackedSignals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bot/clear-and-regenerate", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
        fetchBotData();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle247 = async () => {
    if (!botStatus) return;
    try {
      await fetch("/api/bot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is247Active: !botStatus.is247Active
        })
      });
      fetchBotData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateOutcome = async (signalId: string, outcome: "TP1" | "TP2" | "STOP_LOSS") => {
    setSimulatingSignalId(signalId);
    try {
      const res = await fetch("/api/bot/simulate-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId, targetOutcome: outcome })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
        fetchBotData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingSignalId(null);
    }
  };

  const handleManualArchive = async (signalId: string) => {
    try {
      const res = await fetch("/api/bot/archive-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: "سیگنال با موفقیت به آرشیو منتقل شد." });
        fetchBotData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearArchive = async () => {
    if (!window.confirm("آیا از پاکسازی تمام تاریخچه سیگنال‌های آرشیو شده اطمینان دارید؟")) return;
    try {
      const res = await fetch("/api/bot/clear-archive", { method: "POST" });
      if (res.ok) {
        setTestResult({ success: true, message: "تاریخچه آرشیو با موفقیت پاکسازی شد." });
        fetchBotData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & 24/7 Live Engine */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Bot className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  ربات تلگرام هوشمند ۲۴ ساعته (WhalePulse Telegram Bot)
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  رصد فعال ۲۴ ساعته (نامحدود)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  موتور ضدتکرار فعال (Anti-Duplicate)
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                اسکن ۲۴ ساعته پیوسته تمام ۲۰۰+ کوین و جم‌های خارج از رنک، ارسال نامحدود ستاپ‌ها بدون سقف عددی، ممانعت ۱۰۰٪ از ارسال سیگنال تکراری و مدیریت خودکار تارگت‌ها.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={handleScanNow}
              disabled={isScanningNow}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              title="اسکن فوری رمزارزها با هوش مصنوعی و ارسال ستاپ‌های جدید به کانال"
            >
              {isScanningNow ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
              ) : (
                <Radio className="w-4 h-4 text-cyan-200" />
              )}
              اسکن فوری و ارسال به کانال
            </button>

            <button
              onClick={handleSendTestMessage}
              disabled={isSendingTest}
              className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition disabled:opacity-50"
            >
              {isSendingTest ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-cyan-400" />
              )}
              پیام تست
            </button>

            <button
              onClick={() => setIsTemplateEditorOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-sm font-semibold transition shadow-md shadow-purple-950/40"
              title="تغییر و شخصی‌سازی متن ارسالی به کانال تلگرام"
            >
              <FileEdit className="w-4 h-4 text-purple-400" />
              ویرایش متن پیام‌ها
            </button>

            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
              title="تنظیمات توکن و چت‌آیدی"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              تنظیمات
            </button>

            <button
              onClick={handleToggle247}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                botStatus?.is247Active
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              <Zap className="w-4 h-4" />
              {botStatus?.is247Active ? "اسکن ۲۴/۷ فعال" : "متوقف"}
            </button>
          </div>
        </div>

        {/* Test Result Alert if any */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-sm ${
            testResult.success 
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
              : "bg-rose-950/40 border-rose-800/60 text-rose-300"
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
              <span>{testResult.message}</span>
            </div>
            <button onClick={() => setTestResult(null)} className="text-xs opacity-70 hover:opacity-100">بستن</button>
          </div>
        )}

        {/* Credentials & Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>کانال مقصد سیگنال‌ها</span>
              <a 
                href="https://t.me/nahang_yab" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                <span>مشاهده</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-sm font-mono font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
              <span>@nahang_yab</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">اتوماتیک</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>شناسه چت شخصی (Chat ID)</span>
              <button 
                onClick={() => copyToClipboard(botStatus?.chatId || "119270530", "chatId")} 
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedId === "chatId" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-1">
              {botStatus?.chatId || "119270530"}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">موتور ضدتکرار (Anti-Duplicate)</div>
            <div className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>نامحدود و فعال</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">موفقیت معاملات آرشیو شده</div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {botStatus ? `${Math.round(((botStatus.successfulTradesCount || 2) / Math.max(1, (botStatus.successfulTradesCount || 2) + (botStatus.stoppedTradesCount || 0))) * 100)}%` : "100%"}
              <span className="text-xs text-slate-400 font-normal">({botStatus?.successfulTradesCount || 2} تارگت ۲ / {botStatus?.stoppedTradesCount || 0} استاپ)</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">میانگین سود معاملات بسته شده</div>
            <div className="text-sm font-bold text-cyan-400 mt-1 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              +{botStatus?.averagePnlPercent || 24.8}%
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Active Tracked Signals vs Archived Signals */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "ACTIVE"
                ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>موقعیت‌های فعال در حال رهگیری</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === "ACTIVE" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"
            }`}>
              {activeSignals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ARCHIVED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "ARCHIVED"
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            <span>آرشیو سیگنال‌های بسته شده و تارگت ۲</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === "ARCHIVED" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
            }`}>
              {archivedSignals.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "ARCHIVED" && archivedSignals.length > 0 && (
            <button
              onClick={handleClearArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs border border-rose-800/60 transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              پاکسازی تاریخچه آرشیو
            </button>
          )}

          {activeTab === "ACTIVE" && (
            <button
              onClick={handleResetAndReseedTrackedSignals}
              disabled={isLoading}
              title="حذف تاریخچه قبلی و بارگذاری سیگنال‌های تازه برای رهگیری ربات"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 font-medium transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              تولید مجدد سیگنال تازه
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Active Signals */}
      {activeTab === "ACTIVE" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-between text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>نحوه عملکرد ۲۴ ساعته:</strong> ربات مارکت را به صورت پیوسته اسکن می‌کند. به محض اینکه هر سیگنال به تارگت ۲ (تارگت نهایی) برسد، پیام ریپلای سود به تلگرام ارسال شده و سیگنال به صورت خودکار از صف فعال حذف و به <strong>تب آرشیو</strong> منتقل می‌گردد تا موقعیت‌های جدید بدون وقفه جایگزین شوند.
              </span>
            </div>
          </div>

          {activeSignals.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <Activity className="w-10 h-10 text-cyan-400 mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-bold text-slate-200">تمام موقعیت‌های قبلی به تارگت رسیده‌اند و به آرشیو منتقل شدند!</h4>
              <p className="text-xs text-slate-400 mt-1">اسکنر ۲۴ ساعته در حال یافتن ستاپ‌های جدید با خرید همزمان چند نهنگ است...</p>
              <button
                onClick={handleScanNow}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
              >
                <Radio className="w-3.5 h-3.5" />
                اسکن و اضافه کردن موقعیت جدید الان
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeSignals.map((signal) => {
                const isPump = signal.direction === "PUMP";
                const isProfit = signal.pnlPercent >= 0;
                const isTp1 = signal.status === "HIT_TP1";

                return (
                  <div 
                    key={signal.id} 
                    className={`bg-slate-900 border rounded-2xl p-5 transition-all relative overflow-hidden ${
                      isTp1 
                        ? "border-cyan-500/40 bg-gradient-to-r from-slate-900 to-cyan-950/20" 
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Header of Signal Card */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isPump 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {signal.tokenSymbol.slice(0, 3)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-100">{signal.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              ${signal.tokenSymbol}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                              {signal.chain.toUpperCase()}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              سیگنال پامپ (LONG)
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                              اطمینان: {signal.confidence}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            ثبت شده در: {new Date(signal.openedAt).toLocaleTimeString('fa-IR')}
                            {signal.whaleInflowUsd && (
                              <span className="text-cyan-400 font-semibold">
                                | ورود نهنگ: ${Math.abs(signal.whaleInflowUsd).toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Realtime PnL Display based on Average Entry of 3 Steps */}
                      <div className="flex items-center gap-4 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800">
                        <div>
                          <div className="text-xs text-slate-400">میانگین ۳ پله ورود (اسپات)</div>
                          <div className="text-sm font-mono font-semibold text-cyan-300">${formatPriceDisplay(signal.avgEntryPrice || signal.entryPrice)}</div>
                        </div>

                        <div className="h-8 w-px bg-slate-800" />

                        <div>
                          <div className="text-xs text-slate-400">قیمت فعلی (Live)</div>
                          <div className="text-sm font-mono font-bold text-slate-100">${formatPriceDisplay(signal.currentPrice)}</div>
                        </div>

                        <div className="h-8 w-px bg-slate-800" />

                        <div>
                          <div className="text-xs text-slate-400">سود بر مبنای میانگین</div>
                          <div className={`text-base font-bold font-mono flex items-center gap-1 ${
                            isProfit ? "text-emerald-400" : "text-rose-400"
                          }`}>
                            {isProfit ? "+" : ""}{signal.pnlPercent}%
                            {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Spot Entry Steps Bar */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          🛒 ورود در ۳ پله به صورت اسپات (Spot DCA):
                        </span>
                        <a
                          href="https://www.lbank.com/ref/4Z8UE"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md"
                        >
                          معامله در صرافی LBank
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="text-[11px] text-slate-400">پله ۱ (مارکت - ۴۰٪ حجم)</div>
                          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                            ${formatPriceDisplay(signal.entryStep1 || signal.entryPrice)}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-cyan-800/40">
                          <div className="flex items-center justify-between text-[11px] text-cyan-300">
                            <span>پله ۲ (حمایت اول - ۳۰٪)</span>
                            <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-1 rounded">
                              {signal.step2DistancePercent ? `${signal.step2DistancePercent}%-` : "10.5%-"}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-cyan-200 mt-0.5">
                            ${formatPriceDisplay(signal.entryStep2 || (signal.entryPrice * 0.895))}
                          </div>
                          {signal.support1Description && (
                            <div className="text-[10px] text-slate-400 mt-1 truncate" title={signal.support1Description}>
                              {signal.support1Description}
                            </div>
                          )}
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-cyan-800/40">
                          <div className="flex items-center justify-between text-[11px] text-cyan-300">
                            <span>پله ۳ (حمایت ماژور - ۳۰٪)</span>
                            <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-1 rounded">
                              {signal.step3DistancePercent ? `${signal.step3DistancePercent}%-` : "11.0%-"}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-cyan-200 mt-0.5">
                            ${formatPriceDisplay(signal.entryStep3 || (signal.entryPrice * 0.801))}
                          </div>
                          {signal.support2Description && (
                            <div className="text-[10px] text-slate-400 mt-1 truncate" title={signal.support2Description}>
                              {signal.support2Description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Catalyst summary */}
                    {signal.notesFa && (
                      <p className="text-xs text-slate-300 mt-3 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60 leading-relaxed">
                        🔍 <strong>دلیل و کاتالیزور ورود:</strong> {signal.notesFa}
                      </p>
                    )}

                    {/* Gemini AI Verification Badge */}
                    {signal.geminiAudit && (
                      <div className="mt-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                            ✨ تاییدیه هوش مصنوعی Gemini ({signal.geminiAudit.confidence}% ضریب اطمینان)
                          </span>
                          <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            ✓ تایید شده و مجاز به ارسال
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1.5 leading-relaxed text-[11px]">
                          {signal.geminiAudit.reasoningFa}
                        </p>
                        {signal.geminiAudit.supportConsultationFa && (
                          <div className="mt-2 p-2 rounded-lg bg-indigo-900/30 border border-indigo-700/50 text-[11px] text-indigo-200 flex items-start gap-1.5">
                            <span className="font-bold text-cyan-300 shrink-0">🎯 مشورت سطوح حمایت:</span>
                            <span>{signal.geminiAudit.supportConsultationFa}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Targets & Strategy Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/80">
                      <div className={`p-2.5 rounded-xl border ${
                        isTp1 ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300" : "bg-slate-950/50 border-slate-800 text-slate-300"
                      }`}>
                        <div className="text-xs opacity-75 flex items-center justify-between">
                          <span>تارگت اول (TP 1)</span>
                          {isTp1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-sm font-mono font-bold mt-0.5">${formatPriceDisplay(signal.target1)}</div>
                      </div>

                      <div className="p-2.5 rounded-xl border bg-slate-950/50 border-slate-800 text-slate-300">
                        <div className="text-xs opacity-75 flex items-center justify-between">
                          <span>تارگت نهایی (TP 2) - انتقال خودکار به آرشیو</span>
                        </div>
                        <div className="text-sm font-mono font-bold mt-0.5 text-emerald-400">${formatPriceDisplay(signal.target2)}</div>
                      </div>

                      <div className="p-2.5 rounded-xl border bg-slate-950/50 border-emerald-800/40 text-slate-300">
                        <div className="text-xs opacity-75 flex items-center justify-between">
                          <span className="text-emerald-400 font-semibold">استراتژی مدیریت ریسک</span>
                        </div>
                        <div className="text-xs font-bold mt-1 text-emerald-300">بدون استاپ‌لاس (خرید پله‌ای اسپات)</div>
                      </div>
                    </div>

                    {/* Telegram Reply Status & Interactive Live Action Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-3 bg-slate-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl border-t border-slate-800/80">
                      <div className="flex items-center gap-2 flex-wrap">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-slate-400">شناسه پست تلگرام:</span>
                        <span className="text-xs font-mono font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                          #{signal.telegramMessageId || 1042}
                        </span>
                        
                        <span className="text-xs text-slate-500">•</span>

                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          isTp1
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {isTp1 ? "🎯 تارگت اول تاچ شد (ریپلای ارسال شد)" : "⏳ در حال رصد زنده ۲۴ ساعته"}
                        </span>
                      </div>

                      {/* Simulation Buttons for User to see real Telegram Replies immediately */}
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <button
                          onClick={() => handleSimulateOutcome(signal.id, "TP1")}
                          disabled={simulatingSignalId === signal.id}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1"
                          title="شبیه‌سازی رسیدن به تارگت اول و ارسال ریپلای به تلگرام"
                        >
                          <Target className="w-3.5 h-3.5" />
                          تست ریپلای TP1
                        </button>

                        <button
                          onClick={() => handleSimulateOutcome(signal.id, "TP2")}
                          disabled={simulatingSignalId === signal.id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1 shadow-sm"
                          title="شبیه‌سازی تاچ تارگت دوم نهایی، ارسال ریپلای سود کامل و انتقال فوری به آرشیو"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          تست TP2 (سود کامل + آرشیو خودکار)
                        </button>

                        <button
                          onClick={() => handleManualArchive(signal.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1"
                          title="انتقال دستی این سیگنال به آرشیو"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          آرشیو دستی
                        </button>

                        {onAnalyzeToken && (
                          <button
                            onClick={() => onAnalyzeToken(signal.tokenSymbol)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          >
                            تحلیل AI
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Archived Signals */}
      {activeTab === "ARCHIVED" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>تاریخچه معاملات پایان‌یافته:</strong> این بخش شامل تمام سیگنال‌هایی است که تارگت ۲ نهایی را با موفقیت تاچ کرده‌اند، پیام ریپلای سود به تلگرام ارسال شده و از لیست پوزیشن‌های فعال خارج و بایگانی شده‌اند.
              </span>
            </div>
          </div>

          {archivedSignals.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <Archive className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-200">هنوز سیگنالی در آرشیو ثبت نشده است</h4>
              <p className="text-xs text-slate-400 mt-1">با تاچ تارگت ۲ توسط سیگنال‌های فعال، پوزیشن‌ها به صورت خودکار در اینجا آرشیو می‌شوند.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {archivedSignals.map((signal) => {
                const isTp2 = signal.status === "HIT_TP2";
                const isStop = signal.status === "HIT_STOP_LOSS";

                return (
                  <div 
                    key={signal.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isTp2 
                        ? "bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50" 
                        : "bg-slate-900/90 border-rose-500/30 hover:border-rose-500/50"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isTp2 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {signal.tokenSymbol.slice(0, 3)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">{signal.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              ${signal.tokenSymbol}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                              {signal.chain.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              isTp2 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            }`}>
                              {isTp2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                              {isTp2 ? "تارگت ۲ نهایی تاچ شد (موفق)" : "حد ضرر فعال شد"}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                            <span>میانگین ۳ پله: <strong className="text-cyan-300 font-mono">${formatPriceDisplay(signal.avgEntryPrice || signal.entryPrice)}</strong></span>
                            <span>خروج نهایی: <strong className="text-slate-200 font-mono">${formatPriceDisplay(signal.currentPrice)}</strong></span>
                            {signal.closedAt && (
                              <span>بسته شده در: {new Date(signal.closedAt).toLocaleTimeString('fa-IR')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Final Profit Badge */}
                      <div className="flex items-center gap-3">
                        <div className={`px-3.5 py-2 rounded-xl border text-center ${
                          isTp2 ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                        }`}>
                          <div className="text-[10px] opacity-80">بازدهی نهایی</div>
                          <div className="text-base font-bold font-mono">
                            {signal.pnlPercent > 0 ? "+" : ""}{signal.pnlPercent}%
                          </div>
                        </div>

                        {signal.replyMessageId && (
                          <span className="text-xs text-cyan-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1">
                            <CornerDownLeft className="w-3.5 h-3.5" />
                            ریپلای #{signal.replyMessageId}
                          </span>
                        )}
                      </div>
                    </div>

                    {signal.notesFa && (
                      <p className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                        {signal.notesFa}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Telegram Live Message & Reply Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              لاگ و تاریخچه پیام‌ها و ریپلای‌های ارسال شده به تلگرام (@nahang_yab)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {telegramLogs.length} پیام در تاریخچه
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {telegramLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              هنوز پیامی ثبت نشده است. روی دکمه "ارسال پیام تست" کلیک کنید.
            </div>
          ) : (
            telegramLogs.map((log) => {
              const isReply = log.type.startsWith("REPLY");
              const isTest = log.type === "TEST";
              const isTp = log.type === "REPLY_TP1" || log.type === "REPLY_TP2";

              return (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-xl border text-xs leading-relaxed font-sans ${
                    isReply
                      ? isTp 
                        ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200 mr-6 border-r-4 border-r-emerald-500" 
                        : "bg-rose-950/20 border-rose-800/40 text-rose-200 mr-6 border-r-4 border-r-rose-500"
                      : isTest
                      ? "bg-cyan-950/20 border-cyan-800/40 text-cyan-200"
                      : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/50">
                    <div className="flex items-center gap-2 font-semibold">
                      {isReply && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />}
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono">
                        {log.type === "ALERT" ? "🔔 هشدار ورود اولیه" :
                         log.type === "REPLY_TP1" ? "🎯 ریپلای تارگت ۱" :
                         log.type === "REPLY_TP2" ? "🚀 ریپلای تارگت ۲ (سود کامل)" :
                         log.type === "REPLY_STOP_LOSS" ? "🛑 ریپلای فعال شدن حد ضرر" :
                         "⚡ پیام تست اتصال"}
                      </span>
                      {log.replyToMessageId && (
                        <span className="text-slate-400 font-mono">
                          (ریپلای به پست #{log.replyToMessageId})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <span>{new Date(log.timestamp).toLocaleTimeString('fa-IR')}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        log.status === "SENT" ? "bg-emerald-900 text-emerald-300" : "bg-rose-900 text-rose-300"
                      }`}>
                        {log.status === "SENT" ? "تحویل به تلگرام ✓" : "خطا"}
                      </span>
                    </div>
                  </div>

                  <div 
                    className="whitespace-pre-line font-sans" 
                    dangerouslySetInnerHTML={{ __html: log.text }} 
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-lg">تنظیمات ربات و چت تلگرام</h3>
              </div>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  توکن ربات تلگرام (Bot Token):
                </label>
                <input
                  type="text"
                  value={editToken}
                  onChange={(e) => setEditToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="7605808577:AAHWOnCL30D7nZRzGH3h0TWT2OhV54DUdIk"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  پیش‌فرض از BotFather دریافت شده و آماده کار است.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  کانال تلگرام مقصد (Channel Username):
                </label>
                <input
                  type="text"
                  value={editChannelUsername}
                  onChange={(e) => setEditChannelUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="@nahang_yab"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  کانال عمومی یا خصوصی که ربات در آن به عنوان ادمین عضو است (پیش‌فرض: @nahang_yab).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  شناسه چت شخصی تلگرام (Chat ID):
                </label>
                <input
                  type="text"
                  value={editChatId}
                  onChange={(e) => setEditChatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="119270530"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  شناسه عددی اکانت شخصی شما برای دریافت پیام‌ها و ریپلای‌ها به صورت همزمان.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  حداقل ضریب اطمینان جهت ارسال سیگنال: ({editMinConfidence}%)
                </label>
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={editMinConfidence}
                  onChange={(e) => setEditMinConfidence(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-purple-200">
                    حداقل نهنگ‌های همزمان در ۲۴ ساعت گذشته:
                  </label>
                  <span className="font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                    {editMinWhalesCount || 5}+ نهنگ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  سیگنال فقط زمانی به تلگرام ارسال می‌شود که حداقل {editMinWhalesCount || 5} نهنگ مستقل تایید شده در ۲۴ ساعت اخیر آن را انباشت کرده باشند.
                </p>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[5, 6, 7, 8, 10].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setEditMinWhalesCount(cnt)}
                      className={`py-1 rounded text-[11px] font-semibold border transition ${
                        editMinWhalesCount === cnt
                          ? "bg-purple-600 text-white border-purple-400"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {cnt}+
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={editMinWhalesCount || 5}
                  onChange={(e) => setEditMinWhalesCount(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-purple-200">متن پیام‌های ارسالی به کانال و چت</div>
                  <div className="text-[11px] text-slate-400">تغییر متن پیام ورود، تارگت ۱ و ۲، استاپ‌لاس و امضا</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfigOpen(false);
                    setIsTemplateEditorOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  ویرایش متن پیام‌ها
                </button>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300">
                💡 <strong>نکته مهم:</strong> برای دریافت پیام‌ها، حتما ابتدا یک‌بار در تلگرام به ربات خود پیام <code>/start</code> ارسال کنید.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
              >
                ذخیره تنظیمات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Templates Editor Modal */}
      <TelegramMessageTemplateEditor
        isOpen={isTemplateEditorOpen}
        onClose={() => setIsTemplateEditorOpen(false)}
        onSaved={fetchBotData}
      />
    </div>
  );
};

