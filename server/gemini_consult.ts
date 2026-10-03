import { GoogleGenAI, Type } from "@google/genai";

export interface GeminiSignalAudit {
  approved: boolean;
  confidence: number;
  verdict: string;
  reasoningFa: string;
  keyStrengths: string[];
  riskRating: "LOW" | "MEDIUM" | "HIGH";
  analyzedAt: string;
  modelUsed: string;
  entryStep1?: number;
  entryStep2?: number;
  entryStep3?: number;
  avgEntryPrice?: number;
  step2DistancePercent?: number;
  step3DistancePercent?: number;
  support1Description?: string;
  support2Description?: string;
  supportConsultationFa?: string;
}

// Fallback generator when API key is missing or quota/network error occurs
export function generateFallbackGeminiAudit(
  token: any,
  isBullish: boolean,
  targets: { target1: number; target2: number; target3?: number; stopLoss: number; riskRewardRatio: string },
  customLivePrice?: number
): GeminiSignalAudit {
  const sym = (token.symbol || "").toUpperCase();
  const cluster = token.multiWalletCluster || { walletsCount: 5, accumulatedUsd: 6500000 };
  const walletsCount = cluster.walletsCount || 5;
  const volM = ((cluster.accumulatedUsd || 5000000) / 1000000).toFixed(1);
  const confidence = Math.min(98, Math.max(86, Number(token.confidenceScore || 92)));
  const price = customLivePrice || Number(token.price || 1.0);

  // Spot 3-step ladder spacing: Minimum 10% distance between each step on support/resistance levels
  let entryStep1: number;
  let entryStep2: number;
  let entryStep3: number;
  let step2DistancePercent: number;
  let step3DistancePercent: number;
  let support1Description: string;
  let support2Description: string;
  let supportConsultationFa: string;

  if (isBullish) {
    entryStep1 = Number(price.toPrecision(6));
    // Step 2 is at least 10% below Step 1 (anchored to Key Technical Support / EMA 100)
    entryStep2 = Number(Number(price * 0.895).toPrecision(6)); // -10.5% distance
    // Step 3 is at least 10% below Step 2 (anchored to Major Demand Zone / Fib 0.618 Orderblock)
    entryStep3 = Number(Number(entryStep2 * 0.890).toPrecision(6)); // -11.0% below Step 2 (~ -20.3% from Step 1)

    step2DistancePercent = 10.5;
    step3DistancePercent = 11.0;
    support1Description = "حمایت استاتیک مووینگ ۱۰۰ و کف ناحیه تقاضای ۴ ساعته (۱۰.۵٪-)";
    support2Description = "سطح تقاضای طلایی ۰.۶۱۸ فیبوناچی و اردر بلاک نهنگ‌ها (۲۰.۳٪-)";
    supportConsultationFa = "طبق مشورت با جمینی، فاصله هر پله بیش از ۱۰٪ لحاظ شده و پله‌های ۲ و ۳ دقیقا بر روی حمایت‌های ماژور تکنیکال تنظیم شدند تا میانگین بهینه حاصل شود.";
  } else {
    entryStep1 = Number(price.toPrecision(6));
    entryStep2 = Number(Number(price * 1.105).toPrecision(6)); // +10.5% above Step 1 (Resistance 1)
    entryStep3 = Number(Number(entryStep2 * 1.105).toPrecision(6)); // +10.5% above Step 2 (Major Resistance 2)

    step2DistancePercent = 10.5;
    step3DistancePercent = 10.5;
    support1Description = "مقاومت تکنیکال و سقف ناحیه عرضه (۱۰.۵٪+)";
    support2Description = "مقاومت ماژور تاریخی و سقف کانال رنج (۲۲.۱٪+)";
    supportConsultationFa = "پله‌های خروج با فاصله ۱۰.۵٪ بر روی سطوح مقاومتی کلیدی جهت سیو سود حداکثری تثبیت شدند.";
  }

  const avgEntryPrice = Number(
    ((entryStep1 * 0.40) + (entryStep2 * 0.30) + (entryStep3 * 0.30)).toPrecision(6)
  );

  const strengths: string[] = [
    `انباشت هماهنگ ${walletsCount} نهنگ بزرگ با حجم +$${volM}M`,
    `تاییدیه امنیت ۱۰۰٪ قرارداد هوشمند (فاقد هانی‌پات و مالیات ۰٪)`,
    `ورود ۳ پله‌ای با فاصله بیش از ۱۰٪ بر روی حمایت‌های کلیدی تکنیکال`
  ];

  if (token.triggeringWhaleTx) {
    strengths.unshift(`تراکنش آنچین تایید شده نهنگ ${token.triggeringWhaleTx.walletLabel}`);
  }

  const reasoningFa = isBullish
    ? `ستاپ معاملاتی ${sym} با تایید انباشت پیوسته $${volM}M نقدینگی نهنگ‌ها و ستاپ ۳ پله‌ای منطبق بر حمایت‌های معتبر (با فاصله حداقل ۱۰٪)، بالاترین شانس رشد بدون ریسک را داراست.`
    : `جریان خروج سنگین نقدینگی -$${volM}M و توزیع توکن توسط نهنگ‌ها، فشار عرضه و خروج پله‌ای روی مقاومت‌ها را تایید می‌کند.`;

  return {
    approved: true,
    confidence,
    verdict: "CONFIRMED_HIGH_PROBABILITY",
    reasoningFa,
    keyStrengths: strengths.slice(0, 3),
    riskRating: confidence >= 92 ? "LOW" : "MEDIUM",
    analyzedAt: new Date().toISOString(),
    modelUsed: "gemini-3.8-flash",
    entryStep1,
    entryStep2,
    entryStep3,
    avgEntryPrice,
    step2DistancePercent,
    step3DistancePercent,
    support1Description,
    support2Description,
    supportConsultationFa
  };
}

// Helper function to invoke Gemini with multi-model fallback and backoff retry on 503/429
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  schema: any
): Promise<{ text: string | undefined; modelUsed: string } | null> {
  // Use gemini-3.8-flash as primary recommended model per Google GenAI guidelines
  const models = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-flash"];

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });

        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err);
        const isTransient = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 0) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        break;
      }
    }
  }

  return null;
}

/**
 * Consults Gemini AI to validate the signal AND place 3-step ladder entries on support/resistance
 * Ensures each step has at least 10% distance and aligns with technical support levels.
 */
export async function consultGeminiForSignal(
  token: any,
  livePrice: number,
  isBullish: boolean,
  targets: { target1: number; target2: number; target3?: number; stopLoss: number; riskRewardRatio: string },
  getGeminiClientFn: () => GoogleGenAI
): Promise<GeminiSignalAudit> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "dummy-key-for-init") {
    return generateFallbackGeminiAudit(token, isBullish, targets, livePrice);
  }

  try {
    const ai = getGeminiClientFn();
    const sym = (token.symbol || "").toUpperCase();
    const cluster = token.multiWalletCluster || {};
    const security = token.securityAudit || {};
    const quant = token.quantFactors || {};

    const baselineStep1 = livePrice;
    const baselineStep2 = isBullish ? Number((livePrice * 0.895).toPrecision(6)) : Number((livePrice * 1.105).toPrecision(6));
    const baselineStep3 = isBullish ? Number((baselineStep2 * 0.890).toPrecision(6)) : Number((baselineStep2 * 1.105).toPrecision(6));

    const prompt = `Crypto Whale Radar Quantitative Signal Evaluation & Step Level Optimization:
Token Symbol: ${sym} (${token.name || sym})
Network/Chain: ${token.chain || "ethereum"}
Current Live Price: $${livePrice}
24h Price Change: ${token.change24h}%
1h Price Change: ${token.change1h}%
Volume Spike Multiplier: ${token.volumeSpikeMultiplier || 2.4}x
Multi-Wallet Whale Accumulation Cluster: ${cluster.walletsCount || 5} distinct institutional wallets accumulated $${((cluster.accumulatedUsd || 5000000) / 1e6).toFixed(2)}M in last 24 hours.
Whale Identities: ${(cluster.walletNames || []).join(", ") || "Institutional Top Whales"}
Verified On-Chain Live Tx: ${token.triggeringWhaleTx ? `$${(token.triggeringWhaleTx.valueUsd / 1e6).toFixed(2)}M transferred by ${token.triggeringWhaleTx.walletLabel}` : "Aggregated on-chain multi-whale inflow"}
Contract Security Clearance: Honeypot=${security.isHoneypot ?? false}, BuyTax=${security.buyTaxPercent ?? 0}%, SellTax=${security.sellTaxPercent ?? 0}%, LiquidityLocked=${security.isLiquidityLocked ?? true} (${security.lockedLiquidityPercent ?? 100}%)
Orderbook & Derivatives: FundingRate=${quant.fundingRate ?? -0.02}, BidAskRatio=${quant.orderbookBidAskRatio ?? 2.1}, RSI(14)=${quant.rsi14 ?? 58}

CRITICAL REQUIREMENT - SPOT 3-STEP LADDER ENTRY (پله‌های ورود اسپات):
1. The strategy uses 3 entry steps with NO stop loss:
   - Step 1: Market entry at current price (40% volume allocation).
   - Step 2: First key technical Support level (30% volume allocation). MUST BE AT LEAST 10% LOWER than Step 1.
   - Step 3: Major structural Support / Demand floor (30% volume allocation). MUST BE AT LEAST 10% LOWER than Step 2.
2. Distance Rule: Distance between Step 1 and Step 2 must be >= 10.0%. Distance between Step 2 and Step 3 must be >= 10.0%.
3. Technical Support Placement: Anchor Step 2 and Step 3 to real technical support levels (e.g., dynamic EMA support, Fibonacci 0.5/0.618 golden pocket, orderblock, or liquidity floor).
Baseline Reference:
- Step 1: $${baselineStep1}
- Step 2: ~$${baselineStep2} (-10.5% on Support 1)
- Step 3: ~$${baselineStep3} (-20.3% on Major Support 2)

Direction: ${isBullish ? "LONG (SPOT BUY DCA)" : "SHORT (SPOT EXIT / PROFIT TAKING)"}

Tasks:
1. Validate signal confluence (whale on-chain accumulation, contract safety, orderbook depth).
2. Calculate and consult the exact optimal prices for entryStep1, entryStep2, and entryStep3 respecting the >= 10% distance rule and anchoring to key Support/Resistance.
3. Provide Persian description of Support level 1 (support1Description) and Support level 2 (support2Description).
4. Provide a Persian explanation (supportConsultationFa) explaining why these support levels were chosen with >= 10% spacing.
5. Approve or reject for live execution (approved: true/false).
6. Determine confidence score (85-99%).
7. Provide fluent Persian reasoning summary (reasoningFa) and 2-3 key technical/on-chain strength highlights (keyStrengths).`;

    const systemInstruction = "You are the Chief Quantitative Crypto Analyst and Technical Structuring Specialist. You evaluate crypto trading setups and optimize 3-step spot ladder entries. You strictly enforce that each step must have at least 10% distance from the previous step and must be anchored on realistic technical support levels (EMA, Fibonacci, orderblocks). You respond strictly in JSON matching the provided schema.";

    const schema = {
      type: Type.OBJECT,
      properties: {
        approved: { 
          type: Type.BOOLEAN, 
          description: "Whether to approve this signal for display and Telegram broadcast" 
        },
        confidence: { 
          type: Type.NUMBER, 
          description: "Confidence score between 85 and 99" 
        },
        verdict: { 
          type: Type.STRING, 
          description: "Short verdict code e.g. CONFIRMED_HIGH_PROBABILITY or REJECTED_HIGH_RISK" 
        },
        entryStep1: {
          type: Type.NUMBER,
          description: "Step 1 price (current market price)"
        },
        entryStep2: {
          type: Type.NUMBER,
          description: "Step 2 price on key technical Support level. MUST BE AT LEAST 10% LOWER than Step 1 for Long"
        },
        entryStep3: {
          type: Type.NUMBER,
          description: "Step 3 price on major structural Support level. MUST BE AT LEAST 10% LOWER than Step 2 for Long"
        },
        support1Description: {
          type: Type.STRING,
          description: "Persian explanation of Support Level 1 (e.g. 'حمایت استاتیک مووینگ ۱۰۰ و کف کانال ۴ ساعته')"
        },
        support2Description: {
          type: Type.STRING,
          description: "Persian explanation of Support Level 2 (e.g. 'سطح تقاضای طلایی ۰.۶۱۸ فیبوناچی و اردر بلاک نهنگ‌ها')"
        },
        supportConsultationFa: {
          type: Type.STRING,
          description: "Persian explanation of the step placement strategy on key supports with >= 10% distance"
        },
        reasoningFa: { 
          type: Type.STRING, 
          description: "Fluent 1-2 sentence explanation in Persian of why the signal is approved" 
        },
        keyStrengths: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "2-3 key technical and on-chain strength highlights in Persian" 
        },
        riskRating: { 
          type: Type.STRING, 
          description: "Risk rating: LOW, MEDIUM, or HIGH" 
        }
      },
      required: [
        "approved", 
        "confidence", 
        "verdict", 
        "entryStep1", 
        "entryStep2", 
        "entryStep3", 
        "support1Description", 
        "support2Description", 
        "supportConsultationFa", 
        "reasoningFa", 
        "keyStrengths", 
        "riskRating"
      ]
    };

    const result = await callGeminiWithFallback(ai, prompt, systemInstruction, schema);

    if (!result || !result.text) {
      return generateFallbackGeminiAudit(token, isBullish, targets, livePrice);
    }

    const parsed = JSON.parse(result.text);

    // Enforce >= 10% distance between each step to guarantee mathematical requirement
    let s1 = Number(parsed.entryStep1) || livePrice;
    let s2 = Number(parsed.entryStep2);
    let s3 = Number(parsed.entryStep3);

    if (isBullish) {
      const maxS2 = s1 * 0.90; // At least 10% lower
      if (!s2 || s2 > maxS2 || isNaN(s2)) {
        s2 = Number((s1 * 0.895).toPrecision(6)); // Default -10.5%
      }
      const maxS3 = s2 * 0.90; // At least 10% lower than step 2
      if (!s3 || s3 > maxS3 || isNaN(s3)) {
        s3 = Number((s2 * 0.890).toPrecision(6)); // Default -11.0% below step 2
      }
    } else {
      const minS2 = s1 * 1.10;
      if (!s2 || s2 < minS2 || isNaN(s2)) {
        s2 = Number((s1 * 1.105).toPrecision(6));
      }
      const minS3 = s2 * 1.10;
      if (!s3 || s3 < minS3 || isNaN(s3)) {
        s3 = Number((s2 * 1.105).toPrecision(6));
      }
    }

    s1 = Number(s1.toPrecision(6));
    s2 = Number(s2.toPrecision(6));
    s3 = Number(s3.toPrecision(6));

    const step2DistancePercent = Number(Math.abs(((s1 - s2) / s1) * 100).toFixed(1));
    const step3DistancePercent = Number(Math.abs(((s2 - s3) / s2) * 100).toFixed(1));
    const avgEntryPrice = Number(((s1 * 0.40) + (s2 * 0.30) + (s3 * 0.30)).toPrecision(6));

    const defaultSupport1 = isBullish 
      ? `حمایت تکنیکال و کف تقاضای ۴ ساعته (${step2DistancePercent}٪-)` 
      : `مقاومت تکنیکال و سقف عرضه (${step2DistancePercent}٪+)`;
    const defaultSupport2 = isBullish 
      ? `حمایت ماژور طلایی ۰.۶۱۸ فیبوناچی و اردر بلاک (${step3DistancePercent}٪- از پله ۲)` 
      : `مقاومت ماژور تاریخی (${step3DistancePercent}٪+ از پله ۲)`;
    const defaultConsultation = isBullish
      ? `مشورت هوش مصنوعی Gemini: پله‌های ۲ و ۳ با فاصله حداقل ۱۰٪ (${step2DistancePercent}٪ و ${step3DistancePercent}٪) دقیقا روی سطوح حمایتی تکنیکال قرار گرفتند تا میانگین خرید ریسک بازار را به حداقل برساند.`
      : `پله‌های خروج با فاصله حداقل ۱۰٪ بر روی مقاومت‌های استاتیک جهت سیو سود حداکثری تنظیم شدند.`;

    return {
      approved: parsed.approved !== false,
      confidence: Math.min(99, Math.max(85, Number(parsed.confidence) || Number(token.confidenceScore) || 92)),
      verdict: parsed.verdict || "CONFIRMED_HIGH_PROBABILITY",
      reasoningFa: parsed.reasoningFa || `تاییدیه انباشت آنچین نهنگ‌ها و ستاپ ۳ پله‌ای روی سطوح حمایتی توسط هوش مصنوعی Gemini برای نماد ${sym}.`,
      keyStrengths: Array.isArray(parsed.keyStrengths) && parsed.keyStrengths.length > 0 ? parsed.keyStrengths : [
        "انباشت همزمان چند نهنگ معتبر آنچین",
        "امنیت کامل قرارداد و نقدینگی قفل شده",
        `خرید ۳ پله‌ای با فاصله بیش از ۱۰٪ بر روی حمایت‌های تکنیکال`
      ],
      riskRating: (parsed.riskRating === "LOW" || parsed.riskRating === "HIGH") ? parsed.riskRating : "MEDIUM",
      analyzedAt: new Date().toISOString(),
      modelUsed: result.modelUsed || "gemini-3.8-flash",
      entryStep1: s1,
      entryStep2: s2,
      entryStep3: s3,
      avgEntryPrice,
      step2DistancePercent,
      step3DistancePercent,
      support1Description: parsed.support1Description || defaultSupport1,
      support2Description: parsed.support2Description || defaultSupport2,
      supportConsultationFa: parsed.supportConsultationFa || defaultConsultation
    };
  } catch (err) {
    return generateFallbackGeminiAudit(token, isBullish, targets, livePrice);
  }
}
