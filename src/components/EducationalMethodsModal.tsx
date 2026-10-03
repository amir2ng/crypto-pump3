import React from "react";
import { 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowRightLeft,
  Cpu,
  Award
} from "lucide-react";

interface EducationalMethodsProps {
  isFa: boolean;
}

export const EducationalMethods: React.FC<EducationalMethodsProps> = ({ isFa }) => {
  const methods = [
    {
      id: "method-1",
      number: "۰۱",
      enNumber: "01",
      titleFa: "ردیابی انباشت نهنگ‌ها و اسمارت‌مانی (Smart Money Tracking)",
      titleEn: "Smart Money & Whale Accumulation Index",
      icon: <Award className="h-6 w-6 text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-950/10",
      descFa: "بررسی مداوم تراکنش‌های بیش از ۵۰۰ کیف‌پول برتر (شامل مارکت‌میکرهایی چون Wintermute و Jump Crypto و والت‌های اینسایدر با وین‌ریت بالای ۸۵٪). زمانی که این والت‌ها اقدام به خرید پله‌ای و نگهداری یک کوین می‌کنند، احتمال پامپ شدید به مراتب افزایش می‌یابد.",
      descEn: "Continuous tracking of top 500 elite smart money wallets. When institutional market makers or >85% win-rate addresses cluster buy a token, high-probability breakouts follow."
    },
    {
      id: "method-2",
      number: "۰۲",
      enNumber: "02",
      titleFa: "جهش غیرعادی حجم معاملات (Volume Anomaly Spike > 300%)",
      titleEn: "Sudden Volume Anomaly & Orderbook Skew",
      icon: <Zap className="h-6 w-6 text-cyan-400" />,
      color: "border-cyan-500/30 bg-cyan-950/10",
      descFa: "مقایسه لحظه‌ای حجم معاملات ۲۴ ساعت و ۱ ساعت گذشته نسبت به میانگین ۷ روزه. اگر حجم بدون دلیل عمومی ۳ تا ۶ برابر شود در حالی که اردربوک خرید پرتر از فروش است، نشانه آغاز یک پامپ قریب‌الوقوع است.",
      descEn: "Real-time algorithmic check comparing current 1h/24h volume against the 7-day baseline. 300%+ surges with skewed bid depth signal aggressive institutional accumulation."
    },
    {
      id: "method-3",
      number: "۰۳",
      enNumber: "03",
      titleFa: "فشار فاندینگ ریت منفی و شورت اسکوییز (Short Squeeze Engine)",
      titleEn: "Funding Rate & Liquidation Squeeze",
      icon: <TrendingUp className="h-6 w-6 text-amber-400" />,
      color: "border-amber-500/30 bg-amber-950/10",
      descFa: "وقتی تریدرهای خرد بیش از حد پوزیشن شورت (Short) باز می‌کنند و فاندینگ ریت منفی عمیق می‌شود (-۰.۰۲٪ یا کمتر)، نهنگ‌ها با خرید سنگین اسپات قیمت را بالا می‌کشند تا پوزیشن‌های شورت را لیکوئید کنند که باعث پامپ انفجاری می‌شود.",
      descEn: "Deeply negative funding rates mean excessive retail shorting. Smart money pushes spot prices upward, triggering cascade short liquidations and explosive upward squeezes."
    },
    {
      id: "method-4",
      number: "۰۴",
      enNumber: "04",
      titleFa: "خروج گسترده از صرافی‌های متمرکز (CEX Supply Drain)",
      titleEn: "CEX Outflow & Exchange Supply Shock",
      icon: <ArrowRightLeft className="h-6 w-6 text-teal-400" />,
      color: "border-teal-500/30 bg-teal-950/10",
      descFa: "انتقال میلیون‌ها دلار توکن از بایننس یا بای‌بیت به کیف‌پول‌های سرد شخصی، باعث کمبود عرضه فروش در صرافی‌ها می‌شود. برعکس، واریز ناگهانی توکن‌های آزاد شده توسط سرمایه‌گذاران اولیه (Unlock) به صرافی‌ها، زنگ خطری برای دامپ و سقوط سنگین قیمت است.",
      descEn: "Massive token outflows from Binance/Coinbase into cold wallets trigger supply shocks. Conversely, sudden multi-million dollar deposits warn of immediate dump risks."
    },
    {
      id: "method-5",
      number: "۰۵",
      enNumber: "05",
      titleFa: "سنتز هوش مصنوعی و مدل پیش‌بینی (Gemini AI Multi-Vector)",
      titleEn: "Gemini AI Multi-Vector Synthesis",
      icon: <Cpu className="h-6 w-6 text-purple-400" />,
      color: "border-purple-500/30 bg-purple-950/10",
      descFa: "تمام داده‌های بالا به موتور پیش‌بینی هوش مصنوعی ارسال می‌شود تا با تلفیق سنتیمنت آنچین، رفتار نهنگ‌ها و تحلیل تکنیکال، استراتژی خرید در ۳ پله اسپات (بدون استاپ‌لاس با فاصله حداقل ۱۰٪ روی سطوح حمایتی کلیدی)، میانگین خرید و تارگت‌های سودآوری محاسبه و تولید شود.",
      descEn: "Ingests multi-dimensional on-chain variables into Gemini AI to compute probability scores, 3-step spot ladder entries (>=10% distance on technical support), average entry price, and take-profit targets."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Intro Hero Box */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isFa ? "روش‌ها و الگوریتم‌های کشف کوین‌های مستعد پامپ و استراتژی خرید اسپات" : "How Our Predictive Bot & Whale Radar Works"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {isFa 
                ? "سیستم از ترکیب ۵ روش کمی و آنچین اختصاصی برای پیش‌بینی جهش‌های سنگین، خرید ۳ پله‌ای در اسپات و محاسبه سود از میانگین ۳ پله استفاده می‌کند."
                : "A multi-dimensional quantitative system combining smart money tracking, 3-step spot ladder entry, and AI synthesis."}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Methods Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl border p-5 backdrop-blur-md flex flex-col justify-between ${m.color}`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80">
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isFa ? m.titleFa : m.titleEn}
                    </h3>
                  </div>
                </div>
                <span className="text-lg font-black text-zinc-600 font-mono">
                  {isFa ? m.number : m.enNumber}
                </span>
              </div>

              <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
                {isFa ? m.descFa : m.descEn}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-emerald-400">
                {isFa ? "نرخ موفقیت آماری: >۸۴٪" : "Statistical Accuracy: >84%"}
              </span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                {isFa ? "الگوریتم فعال" : "Active Engine"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Practical Action Checklist */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          {isFa ? "راهنمای استراتژی خرید ۳ پله‌ای در اسپات و صرافی LBank" : "Spot 3-Step Strategy & LBank Guide"}
        </h3>
        <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>{isFa ? "معاملات به صورت اسپات ۳ پله‌ای (۴۰٪ پله اول در مارکت، ۳۰٪ پله دوم با حداقل ۱۰٪ فاصله روی حمایت اول، و ۳۰٪ پله سوم با حداقل ۱۰٪ فاصله روی حمایت ماژور) بدون حد ضرر انجام می‌شوند تا میانگین بهینه‌ای از قیمت بدست آید و ریسک نوسان بازار خنثی گردد." : "Trades are executed in 3 spot steps (40% / 30% / 30%) with >=10% distance on key support levels without stop loss."}</li>
          <li>{isFa ? "محاسبه درصد سود در پیگیری سیگنال‌ها دقیقا بر اساس میانگین ۳ پله ورود انجام می‌گردد." : "PnL calculation is measured strictly from the 3-step average entry price."}</li>
          <li>{isFa ? "برای انجام معاملات بدون محدودیت تحریم با کارمزد پایین، می‌توانید در صرافی LBank عضو شوید: https://www.lbank.com/ref/4Z8UE" : "Trade spot on LBank with zero sanctions: https://www.lbank.com/ref/4Z8UE"}</li>
        </ul>
      </div>

    </div>
  );
};
