import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileEdit,
  Save,
  RotateCcw,
  Send,
  Eye,
  Check,
  Sparkles,
  HelpCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Hash
} from "lucide-react";
import { TelegramMessageTemplates } from "../types";

interface TemplateVariableInfo {
  tag: string;
  labelFa: string;
  example: string;
  category: "common" | "alert" | "reply";
}

const TEMPLATE_VARIABLES: TemplateVariableInfo[] = [
  { tag: "{symbol}", labelFa: "نماد ارز", example: "SOL", category: "common" },
  { tag: "{name}", labelFa: "نام کامل ارز", example: "Solana", category: "common" },
  { tag: "{channel}", labelFa: "آیدی کانال تلگرام", example: "@nahang_yab", category: "common" },
  { tag: "{time}", labelFa: "ساعت فعلی", example: "۱۴:۳۵:۲۰", category: "common" },
  { tag: "{lbank_url}", labelFa: "لینک عضویت صرافی LBank", example: "https://www.lbank.com/ref/4Z8UE", category: "common" },
  { tag: "{custom_footer}", labelFa: "پاورقی ثابت", example: "متن دلخواه", category: "common" },

  { tag: "{direction}", labelFa: "جهت پوزیشن", example: "LONG", category: "alert" },
  { tag: "{position_type}", labelFa: "نوع معامله فارسی", example: "🟢 خرید پله‌ای اسپات (SPOT)", category: "alert" },
  { tag: "{entry}", labelFa: "میانگین خرید ۳ پله", example: "167.35", category: "alert" },
  { tag: "{avg_entry}", labelFa: "میانگین خرید ۳ پله", example: "167.35", category: "alert" },
  { tag: "{entry_step1}", labelFa: "قیمت پله اول (مارکت ۴۰٪)", example: "184.50", category: "alert" },
  { tag: "{entry_step2}", labelFa: "قیمت پله دوم (حمایت اول ۳۰٪)", example: "165.13", category: "alert" },
  { tag: "{entry_step3}", labelFa: "قیمت پله سوم (حمایت ماژور ۳۰٪)", example: "146.96", category: "alert" },
  { tag: "{step2_dist}", labelFa: "فاصله پله ۲ (حداقل ۱۰٪)", example: "10.5%", category: "alert" },
  { tag: "{step3_dist}", labelFa: "فاصله پله ۳ (حداقل ۱۰٪)", example: "11.0%", category: "alert" },
  { tag: "{support_note}", labelFa: "مشورت سطوح حمایت جمینی", example: "پله‌ها با مشورت جمینی بر روی سطوح حمایتی با فاصله بیش از ۱۰٪ تنظیم شدند.", category: "alert" },
  { tag: "{support1_desc}", labelFa: "توضیح حمایت اول", example: "حمایت استاتیک مووینگ ۱۰۰ و کف کانال ۴ ساعته", category: "alert" },
  { tag: "{support2_desc}", labelFa: "توضیح حمایت ماژور", example: "سطح تقاضای طلایی ۰.۶۱۸ فیبوناچی و اردر بلاک نهنگ‌ها", category: "alert" },
  { tag: "{tp1}", labelFa: "قیمت تارگت اول", example: "175.72", category: "alert" },
  { tag: "{tp2}", labelFa: "قیمت تارگت دوم", example: "192.45", category: "alert" },
  { tag: "{tp3}", labelFa: "قیمت تارگت سوم", example: "217.55", category: "alert" },
  { tag: "{tp1_percent}", labelFa: "درصد تارگت ۱", example: "5.0", category: "alert" },
  { tag: "{tp2_percent}", labelFa: "درصد تارگت ۲", example: "15.0", category: "alert" },
  { tag: "{tp3_percent}", labelFa: "درصد تارگت ۳", example: "30.0", category: "alert" },
  { tag: "{stop_loss}", labelFa: "حد ضرر (بدون استاپ)", example: "بدون استاپ (اسپات ۳ پله‌ای)", category: "alert" },
  { tag: "{stop_percent}", labelFa: "درصد حد ضرر", example: "0", category: "alert" },
  { tag: "{rr_ratio}", labelFa: "استراتژی معامله", example: "اسپات ۳ پله‌ای (بدون استاپ - فاصله پله‌ها +۱۰٪ بر روی حمایت)", category: "alert" },
  { tag: "{whale_reason}", labelFa: "علت ورود نهنگ", example: "انباشت +$18.4M توسط ۶ نهنگ برتر", category: "alert" },
  { tag: "{tradingview_url}", labelFa: "لینک TradingView", example: "https://tradingview.com...", category: "alert" },
  { tag: "{dex_url}", labelFa: "لینک DexScreener", example: "https://dexscreener.com...", category: "alert" },
  { tag: "{scan_url}", labelFa: "لینک اکسپلورر آنچین", example: "https://solscan.io...", category: "alert" },

  { tag: "{tag_header}", labelFa: "تگ هدر سیگنال", example: "#SOL_TP1_HIT", category: "reply" },
  { tag: "{action_text}", labelFa: "متن تاچ تارگت", example: "تارگت اول خرید اسپات با موفقیت تاچ شد", category: "reply" },
  { tag: "{pnl}", labelFa: "درصد سود بر مبنای میانگین", example: "+4.50%", category: "reply" },
  { tag: "{duration}", labelFa: "مدت زمان به دقیقه", example: "45", category: "reply" },
  { tag: "{current_price}", labelFa: "قیمت خروج / فعلی", example: "186.60", category: "reply" },
  { tag: "{position_text}", labelFa: "عنوان پوزیشن", example: "معامله اسپات ۳ پله‌ای", category: "reply" }
];

type TemplateTab = "alertLong" | "alertShort" | "tp1" | "tp2" | "stopLoss" | "footer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const TelegramMessageTemplateEditor: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [activeTemplateTab, setActiveTemplateTab] = useState<TemplateTab>("alertLong");
  const [templates, setTemplates] = useState<TelegramMessageTemplates | null>(null);
  const [defaultTemplates, setDefaultTemplates] = useState<TelegramMessageTemplates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [showVariableGuide, setShowVariableGuide] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch current templates from server
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/bot/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.templates) {
          setTemplates(data.templates);
          setDefaultTemplates(data.defaultTemplates || data.templates);
        }
      })
      .catch((err) => console.error("Failed to load templates:", err))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  // Update live preview whenever current template or tab changes
  useEffect(() => {
    if (!templates) return;

    const getCurrentText = () => {
      switch (activeTemplateTab) {
        case "alertLong":
          return templates.alertLongTemplate;
        case "alertShort":
          return templates.alertShortTemplate;
        case "tp1":
          return templates.tp1Template;
        case "tp2":
          return templates.tp2Template;
        case "stopLoss":
          return templates.stopLossTemplate;
        case "footer":
          return templates.alertLongTemplate;
        default:
          return templates.alertLongTemplate;
      }
    };

    const fetchPreview = async () => {
      try {
        const res = await fetch("/api/bot/templates/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateType: activeTemplateTab === "footer" ? "alertLong" : activeTemplateTab,
            customTemplate: getCurrentText(),
            customFooter: templates.customFooter
          })
        });
        const data = await res.json();
        if (data.success) {
          setPreviewHtml(data.previewText);
        }
      } catch (e) {
        console.warn("Error fetching preview:", e);
      }
    };

    fetchPreview();
  }, [templates, activeTemplateTab]);

  if (!isOpen) return null;

  const currentTemplateField = (): keyof TelegramMessageTemplates => {
    switch (activeTemplateTab) {
      case "alertLong":
        return "alertLongTemplate";
      case "alertShort":
        return "alertShortTemplate";
      case "tp1":
        return "tp1Template";
      case "tp2":
        return "tp2Template";
      case "stopLoss":
        return "stopLossTemplate";
      case "footer":
        return "customFooter";
    }
  };

  const handleTextChange = (val: string) => {
    if (!templates) return;
    const field = currentTemplateField();
    setTemplates({
      ...templates,
      [field]: val
    });
  };

  const insertVariable = (tag: string) => {
    if (!textareaRef.current || !templates) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const field = currentTemplateField();
    const currentVal = templates[field] || "";

    const newVal = currentVal.substring(0, start) + tag + currentVal.substring(end);
    setTemplates({
      ...templates,
      [field]: newVal
    });

    // Move cursor right after inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleSave = async () => {
    if (!templates) return;
    setIsSaving(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/bot/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTestResult({ success: true, message: "قالب‌ها با موفقیت در سرور ذخیره شدند!" });
        if (onSaved) onSaved();
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setTestResult({ success: false, message: data.error || "خطا در ذخیره قالب‌ها" });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "خطای ارتباط با سرور" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetCurrent = () => {
    if (!templates || !defaultTemplates) return;
    const field = currentTemplateField();
    if (window.confirm("آیا می‌خواهید متن این بخش به حالت پیش‌فرض اولیه بازگردد؟")) {
      setTemplates({
        ...templates,
        [field]: defaultTemplates[field]
      });
    }
  };

  const handleResetAll = () => {
    if (!defaultTemplates) return;
    if (window.confirm("آیا می‌خواهید تمام پیام‌ها و پاورقی به حالت پیش‌فرض اولیه سیستم بازنشانی شوند؟")) {
      setTemplates({ ...defaultTemplates });
    }
  };

  const handleSendTestToChannel = async () => {
    if (!previewHtml) return;
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/bot/templates/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: previewHtml })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: "پیام با فرمت شخصی‌سازی شده شما هم‌اکنون به کانال تلگرام ارسال شد! کانال را بررسی کنید."
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "خطا در ارسال پیام به کانال تلگرام."
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "خطای سرور" });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Filter available variables according to active tab
  const relevantVariables = TEMPLATE_VARIABLES.filter((v) => {
    if (activeTemplateTab === "footer") return v.category === "common";
    if (activeTemplateTab === "alertLong" || activeTemplateTab === "alertShort") {
      return v.category === "common" || v.category === "alert";
    }
    return v.category === "common" || v.category === "reply";
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-inner">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  ویرایش و شخصی‌سازی متن ارسالی به تلگرام
                </h3>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-500/30">
                  کانال و چت خصوصی
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                قالب متن سیگنال‌ها، پیام‌های تاچ تارگت و استاپ‌لاس ارسالی به ربات و کانال را آزادانه تغییر دهید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVariableGuide(!showVariableGuide)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                showVariableGuide
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
              title="راهنمای متغیرهای داینامیک"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">راهنمای متغیرها</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-zinc-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTemplateTab("alertLong")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              activeTemplateTab === "alertLong"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>خرید پله‌ای اسپات (۳ پله)</span>
          </button>

          <button
            onClick={() => setActiveTemplateTab("alertShort")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              activeTemplateTab === "alertShort"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            <span>خروج پله‌ای از اسپات</span>
          </button>

          <button
            onClick={() => setActiveTemplateTab("tp1")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              activeTemplateTab === "tp1"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Target className="h-3.5 w-3.5 text-cyan-400" />
            <span>ریپلای تارگت اول (TP 1)</span>
          </button>

          <button
            onClick={() => setActiveTemplateTab("tp2")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              activeTemplateTab === "tp2"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>ریپلای تارگت دوم (TP 2)</span>
          </button>

          <button
            onClick={() => setActiveTemplateTab("stopLoss")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              activeTemplateTab === "stopLoss"
                ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            <span>پیام وضعیت معامله (بدون استاپ)</span>
          </button>

          <button
            onClick={() => setActiveTemplateTab("footer")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              activeTemplateTab === "footer"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            <Hash className="h-3.5 w-3.5 text-purple-400" />
            <span>امضا و پاورقی ثابت</span>
          </button>
        </div>

        {/* Variable Helper Bar - Quick Insert Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>متغیرهای داینامیک قابل کلیک برای درج فوری در متن:</span>
            <span className="text-[10px] text-zinc-500">
              با کلیک روی هر متغیر، در محل نشانگر متن اضافه می‌شود
            </span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
            {relevantVariables.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => insertVariable(v.tag)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-purple-950/60 text-zinc-300 hover:text-purple-200 border border-zinc-800 hover:border-purple-600/50 text-[11px] font-mono transition"
                title={`${v.labelFa} (مثال: ${v.example})`}
              >
                <span className="text-purple-400 font-semibold">{v.tag}</span>
                <span className="text-[10px] text-zinc-400 font-sans">({v.labelFa})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variable Guide Box (Collapsible) */}
        {showVariableGuide && (
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-zinc-300 space-y-2 animate-fade-in">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              راهنمای استفاده از تگ‌های تلگرام:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                • <code>&lt;b&gt;متن ضخیم&lt;/b&gt;</code>: برجسته کردن متن
              </div>
              <div>
                • <code>&lt;code&gt;متن کدی&lt;/code&gt;</code>: قالب فونت مونو اسپیس قابل کپی
              </div>
              <div>
                • <code>&lt;i&gt;متن ایتالیک&lt;/i&gt;</code>: کج کردن نوشته
              </div>
              <div>
                • <code>&lt;a href="لینک"&gt;عنوان&lt;/a&gt;</code>: ایجاد هایپرلینک در تلگرام
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area: Editor and Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[300px]">
          {/* Editor Column */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <FileEdit className="h-3.5 w-3.5 text-purple-400" />
                ویرایشگر قالب متن:
              </span>
              <button
                onClick={handleResetCurrent}
                className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition"
                title="بازنشانی این بخش به پیش‌فرض سیستم"
              >
                <RotateCcw className="h-3 w-3" />
                بازنشانی این بخش
              </button>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-xs text-zinc-400">
                در حال بارگذاری قالب‌ها...
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={templates ? templates[currentTemplateField()] || "" : ""}
                onChange={(e) => handleTextChange(e.target.value)}
                dir="auto"
                className="flex-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-xs text-zinc-100 font-mono leading-relaxed focus:border-purple-500 focus:outline-none resize-none shadow-inner"
                placeholder="متن دلخواه خود را اینجا وارد کنید..."
              />
            )}

            <div className="text-[10px] text-zinc-500 flex items-center justify-between">
              <span>پشتیبانی کامل از تگ‌های HTML تلگرام (b, code, a, i)</span>
              <span>
                طول متن:{" "}
                {templates ? (templates[currentTemplateField()] || "").length : 0} کاراکتر
              </span>
            </div>
          </div>

          {/* Live Preview Column (Styled as a Telegram Dark Bubble) */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                پیش‌نمایش زنده در تلگرام (نمونه رمزارز SOL):
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">@nahang_yab</span>
            </div>

            <div className="flex-1 rounded-xl border border-slate-800 bg-[#17212b] p-4 text-xs shadow-inner overflow-y-auto font-sans leading-relaxed text-[#f5f5f5] space-y-2 select-text">
              {/* Telegram Message Bubble Mockup */}
              <div className="relative bg-[#1e2c3a] border border-[#2b394a] rounded-2xl p-4 shadow-lg space-y-2">
                <div
                  className="whitespace-pre-wrap leading-relaxed text-slate-100 selection:bg-cyan-500/30"
                  dangerouslySetInnerHTML={{ __html: previewHtml || "در حال رندر پیش‌نمایش..." }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendTestToChannel}
                disabled={isSendingTest || !previewHtml}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  {isSendingTest
                    ? "در حال ارسال به تلگرام..."
                    : "ارسال زنده این پیام آزمایشی به کانال تلگرام 🔔"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Test / Save Feedback Notice */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
              testResult.success
                ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                : "bg-rose-950/40 border-rose-800/60 text-rose-300"
            }`}
          >
            <span>{testResult.message}</span>
            <button
              onClick={() => setTestResult(null)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:text-rose-400 transition"
              title="بازنشانی تمامی قالب‌ها و فوتر به حالت پیش‌فرض"
            >
              بازنشانی همه به پیش‌فرض
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 text-xs font-bold transition shadow-lg shadow-purple-600/25 active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{saveSuccess ? "ذخیره شد!" : isSaving ? "در حال ذخیره..." : "ذخیره تغییرات قالب"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
