import React, { useState } from "react";
import { 
  X, 
  Bell, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Send, 
  Sliders, 
  Clock, 
  Check,
  Zap,
  Bot,
  FileEdit
} from "lucide-react";
import { BotAlertConfig } from "../types";
import { formatUsd } from "../utils/formatters";
import { TelegramMessageTemplateEditor } from "./TelegramMessageTemplateEditor";

interface BotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFa: boolean;
  config: BotAlertConfig;
  onSaveConfig: (newConfig: BotAlertConfig) => void;
  onTestWebhook: () => void;
  testWebhookMessage?: string | null;
}

export const BotSettingsModal: React.FC<BotSettingsModalProps> = ({
  isOpen,
  onClose,
  isFa,
  config,
  onSaveConfig,
  onTestWebhook,
  testWebhookMessage,
}) => {
  if (!isOpen) return null;

  const [currentConfig, setCurrentConfig] = useState<BotAlertConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);

  const handleSave = () => {
    onSaveConfig(currentConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isFa ? "تنظیمات ربات خودکار و هشدارهای آنی" : "Bot Automation & Alert Rules"}
              </h3>
              <p className="text-xs text-zinc-400">
                {isFa ? "شخصی‌سازی فیلترهای اسکنر و سیستم هشدار تلگرام" : "Configure scanner triggers & Telegram notifications"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Setting 1: Min Confidence Slider & Extreme Filter */}
        <div className="space-y-2.5 rounded-xl bg-zinc-900/70 p-3.5 border border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-zinc-200 block">
                {isFa ? "حداقل ضریب اطمینان برای دریافت هشدار (Confidence):" : "Minimum AI Confidence Threshold:"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isFa ? "فیلتر ستاپ‌های مستعد پامپ/دامپ شدید بر اساس ورود نهنگ و جهش حجم" : "Filter extreme pump/dump setups triggered by whale inflows"}
              </span>
            </div>
            <div className="text-left">
              <span className="font-mono font-bold text-emerald-400 text-base bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {currentConfig.minConfidence}%
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { val: 75, label: isFa ? "۷۵٪ استاندارد" : "75% Normal" },
              { val: 85, label: isFa ? "۸۵٪ مطمئن" : "85% High" },
              { val: 90, label: isFa ? "۹۰٪ پامپ شدید 🚀" : "90% Extreme 🚀" },
              { val: 95, label: isFa ? "۹۵٪ فوق انحصاری 💎" : "95% Ultra 💎" }
            ].map(p => (
              <button
                key={p.val}
                type="button"
                onClick={() => setCurrentConfig({ ...currentConfig, minConfidence: p.val })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                  currentConfig.minConfidence === p.val
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="60"
            max="98"
            step="1"
            value={currentConfig.minConfidence}
            onChange={(e) => setCurrentConfig({ ...currentConfig, minConfidence: Number(e.target.value) })}
            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-2 cursor-pointer mt-1"
          />

          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>60% ({isFa ? "حداکثر سیگنال" : "All signals"})</span>
            <span>85% ({isFa ? "پیشنهادی" : "Recommended"})</span>
            <span>90%+ ({isFa ? "فقط پامپ/دامپ شدید" : "Strict Pump/Dump"})</span>
            <span>98%</span>
          </div>
        </div>

        {/* Setting: Min Simultaneous Whales in 24 Hours (Multi-Wallet Cluster Threshold) */}
        <div className="space-y-2.5 rounded-xl bg-zinc-900/70 p-3.5 border border-purple-500/30">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-zinc-200 block flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                {isFa ? "حداقل تعداد نهنگ‌های همزمان در ۲۴ ساعت گذشته:" : "Min Simultaneous Whales (24h Cluster):"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isFa 
                  ? "شرط صدور و ارسال سیگنال: انباشت همزمان حداقل ۵ نهنگ مستقل در ۲۴ ساعت اخیر" 
                  : "Filter signals by minimum simultaneous whale buyers in the past 24 hours"}
              </span>
            </div>
            <div className="text-left">
              <span className="font-mono font-bold text-purple-300 text-sm bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 whitespace-nowrap">
                {currentConfig.minWhalesCount || 5}+ {isFa ? "نهنگ همزمان" : "Whales"}
              </span>
            </div>
          </div>

          {/* Quick Whale Count Presets */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[
              { val: 5, label: isFa ? "۵+ (پیش‌فرض)" : "5+ Min" },
              { val: 6, label: isFa ? "۶+ نهنگ" : "6+ Whales" },
              { val: 7, label: isFa ? "۷+ نهنگ" : "7+ Whales" },
              { val: 8, label: isFa ? "۸+ نهنگ" : "8+ Whales" },
              { val: 10, label: isFa ? "۱۰+ سنگین" : "10+ Whales" }
            ].map(p => (
              <button
                key={p.val}
                type="button"
                onClick={() => setCurrentConfig({ ...currentConfig, minWhalesCount: p.val })}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                  (currentConfig.minWhalesCount || 5) === p.val
                    ? "bg-purple-500/30 text-purple-200 border-purple-400 shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="5"
            max="15"
            step="1"
            value={currentConfig.minWhalesCount || 5}
            onChange={(e) => setCurrentConfig({ ...currentConfig, minWhalesCount: Number(e.target.value) })}
            className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer mt-1"
          />

          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>5 {isFa ? "(حداقل سختگیرانه)" : "(Min Required)"}</span>
            <span>7 {isFa ? "(فوق قوی)" : "(Strong)"}</span>
            <span>10+ {isFa ? "(ابرنهنگ‌ها)" : "(Mega Whales)"}</span>
            <span>15</span>
          </div>
        </div>

        {/* Setting 2: Min Whale Tx Size */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-200">
            {isFa ? "حداقل حجم تراکنش نهنگ برای ثبت در فید:" : "Minimum Whale Tx Value:"}
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[100000, 500000, 1000000].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setCurrentConfig({ ...currentConfig, minWhaleTxSize: size })}
                className={`rounded-xl py-2 font-semibold border transition-all ${
                  currentConfig.minWhaleTxSize === size
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {formatUsd(size)}+
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Auto-Scan Interval */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-200">
            {isFa ? "دوره زمانی اسکن خودکار:" : "Auto-Scan Interval:"}
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[15, 30, 60].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setCurrentConfig({ ...currentConfig, autoScanInterval: sec })}
                className={`rounded-xl py-2 font-semibold border transition-all ${
                  currentConfig.autoScanInterval === sec
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {sec} {isFa ? "ثانیه" : "seconds"}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 4: Audio Sound & Toggles */}
        <div className="space-y-2 rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-200">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>{isFa ? "پخش صدای آلارم در زمان کشف سیگنال جدید" : "Sound alerts for new signals"}</span>
            </div>
            <input
              type="checkbox"
              checked={currentConfig.soundEnabled}
              onChange={(e) => setCurrentConfig({ ...currentConfig, soundEnabled: e.target.checked })}
              className="accent-emerald-500 h-4 w-4"
            />
          </div>
        </div>

        {/* Setting 5: Telegram Bot Credentials */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-cyan-400" />
              {isFa ? "مشخصات ربات تلگرام ۲۴ ساعته:" : "Telegram Bot Credentials:"}
            </span>
            <button
              onClick={onTestWebhook}
              className="rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 px-3 py-1 text-xs font-semibold transition-colors"
            >
              {isFa ? "ارسال پیام تست زنده 🔔" : "Send Live Test 🔔"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                {isFa ? "شناسه چت (Chat ID):" : "Chat ID:"}
              </label>
              <input
                type="text"
                value={currentConfig.telegramChatId || "119270530"}
                onChange={(e) => setCurrentConfig({ ...currentConfig, telegramChatId: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                placeholder="119270530"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                {isFa ? "توکن ربات (Bot Token):" : "Bot Token:"}
              </label>
              <input
                type="text"
                value={currentConfig.telegramBotToken || "7605808577:AAHWOnCL30D7nZRzGH3h0TWT2OhV54DUdIk"}
                onChange={(e) => setCurrentConfig({ ...currentConfig, telegramBotToken: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                placeholder="7605808577:AAHWOnCL30D7nZRzGH3h0TWT2OhV54DUdIk"
              />
            </div>
          </div>

          {testWebhookMessage && (
            <div className="rounded-xl bg-zinc-900 p-2.5 text-[11px] text-cyan-300 border border-cyan-500/30 animate-fade-in">
              {testWebhookMessage}
            </div>
          )}

          {/* Quick link to Edit Message Templates */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-200 block">
                {isFa ? "شخصی‌سازی متن پیام‌های ارسالی به تلگرام" : "Customize Telegram Messages"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isFa ? "تغییر آزادانه فرمت پیام‌های لانگ، شورت، تارگت‌ها، استاپ‌لاس و امضا" : "Edit Long/Short alerts, TP1/TP2 replies, Stop Loss & Footer"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTemplateEditorOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 px-3 py-1.5 text-xs font-semibold transition"
            >
              <FileEdit className="h-3.5 w-3.5 text-purple-300" />
              <span>{isFa ? "ویرایش متن پیام‌ها" : "Edit Templates"}</span>
            </button>
          </div>
        </div>

        {/* Save & Cancel Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
          >
            {isFa ? "بستن" : "Close"}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
          >
            {savedSuccess ? <Check className="h-4 w-4" /> : null}
            <span>{savedSuccess ? (isFa ? "ذخیره شد!" : "Saved!") : (isFa ? "ذخیره تغییرات" : "Save Changes")}</span>
          </button>
        </div>

      </div>

      {/* Message Templates Editor Modal */}
      <TelegramMessageTemplateEditor
        isOpen={isTemplateEditorOpen}
        onClose={() => setIsTemplateEditorOpen(false)}
      />
    </div>
  );
};
