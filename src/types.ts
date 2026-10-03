export type SignalType = 
  | "EXTREME_PUMP" 
  | "HIGH_PUMP" 
  | "EXTREME_DUMP" 
  | "HIGH_DUMP" 
  | "STEALTH_ACCUMULATION" 
  | "LIQUIDATION_SQUEEZE"
  | "MULTI_WHALE_ACCUMULATION"
  | "WHALE_DISTRIBUTION_DUMP"
  | "SMART_MONEY_EXIT";

export type BlockchainNetwork = "ethereum" | "solana" | "base" | "arbitrum" | "bnb" | "all";

export interface ScannedTokenInfo {
  id: string;
  symbol: string;
  name: string;
  chain: "ethereum" | "solana" | "base" | "arbitrum" | "bnb";
  price: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  volumeSpikeMultiplier?: number;
  mcap: number;
  rank?: number;
  isTop200?: boolean;
  isWildcardDiscovery?: boolean;
  discoveryReason?: string;
  contractAddress?: string;
  whaleStatus: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL" | "MONITORING";
  whaleNetFlowUsd: number;
  securityScore: number;
  isSecurityPassed: boolean;
  activeSignalDirection?: "PUMP" | "DUMP" | null;
  activeSignalConfidence?: number;
  triggerCatalyst: string;
  persianSummary: string;
  lastScannedAt: string;
  scanFrequencyText: string;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
  isWhaleAction?: "BUY" | "SELL";
}

export interface SecurityAudit {
  isHoneypot: boolean; // false = Safe to buy & sell
  buyTaxPercent: number; // e.g. 0%
  sellTaxPercent: number; // e.g. 0% or 1%
  isLiquidityLocked: boolean; // true = LP 100% locked or burned
  lockedLiquidityPercent: number; // e.g. 99% or 100%
  isMintRenounced: boolean; // true = Mint function revoked
  isOwnershipRenounced: boolean; // true = Contract renounced / verified
  top10HoldersSharePercent: number; // e.g. 12.8%
  securityScore: number; // 0 - 100 (e.g. 96)
  isPassed: boolean; // true if all strict safety conditions met
  passedBadges: string[];
  warnings?: string[];
  dexPairAddress?: string;
  contractAddress?: string;
}

export interface WhaleClusterWallet {
  label: string;
  volumeUsd: number;
  address?: string;
}

export interface MultiWalletCluster {
  isClusterDetected: boolean;
  walletsCount: number; // Number of distinct smart money / whale wallets buying
  accumulatedUsd: number; // Total USD value purchased by cluster
  totalClusterVolumeUsd?: number; // Aliased for compatibility
  walletNames: string[]; // e.g. ["Wintermute", "Smart Money 0x71c", "Solana Super Whale"]
  wallets?: WhaleClusterWallet[];
  walletAddresses?: string[];
  timeframeHours?: number;
  timeframeMinutes: number; // e.g. within last 35 minutes
  coordinationScore: number; // 0-100 score indicating coordinated smart accumulation
}

export interface WhaleMetrics {
  netInflowUsd: number;
  whaleBuyersCount: number;
  whaleSellersCount: number;
  largestTxUsd: number;
  topWhaleNames: string[];
  cexOutflowRatio: number; // e.g. 0.75 means 75% withdrawn from CEXs
}

export interface QuantFactors {
  fundingRate: number; // e.g. -0.042%
  openInterestChange24h: number; // %
  orderbookBidAskRatio: number; // >1 means bid pressure
  dexLiquidityDelta: number; // % change in pool depth
  smartMoneyScore: number; // 0-100
  rsi14: number;
}

export interface GeminiSignalAudit {
  approved: boolean;
  confidence: number;
  verdict: string;
  reasoningFa: string;
  keyStrengths: string[];
  riskRating: "LOW" | "MEDIUM" | "HIGH";
  analyzedAt?: string;
  modelUsed?: string;
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

export interface AiPredictionData {
  tokenSymbol: string;
  direction: "PUMP" | "DUMP" | "NEUTRAL";
  probability: number;
  timeHorizon: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  catalyst: string;
  entryZone: [number, number];
  targets: [number, number];
  stopLoss: number;
  riskRewardRatio: string;
  summaryFa: string;
  summaryEn: string;
  keyFactorsFa: string[];
}

export interface TokenSignal {
  id: string;
  symbol: string;
  name: string;
  chain: "ethereum" | "solana" | "base" | "arbitrum" | "bnb" | "hyperliquid";
  price: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  volumeSpikeMultiplier: number;
  mcap: number;
  rank?: number;
  isTop200?: boolean;
  isWildcardDiscovery?: boolean;
  discoveryReason?: string;
  discoverySource?: "COINGECKO_TOP200" | "CMC_TOP200" | "WILDCARD_WHALE_CLUSTER" | "DEX_SNIPER_SWEEP" | "HYPERDASH_PERP_RADAR";
  signalType: SignalType;
  confidenceScore: number;
  timeHorizon: string;
  whaleMetrics: WhaleMetrics;
  quantFactors: QuantFactors;
  securityAudit: SecurityAudit;
  multiWalletCluster: MultiWalletCluster;
  triggerCatalyst: string;
  persianSummary: string;
  chartHistory?: ChartDataPoint[];
  aiAnalysis?: AiPredictionData;
  contractAddress?: string;
  dexPairAddress?: string;
  whaleFloorPrice?: number;
  whaleCeilingPrice?: number;
  distanceFromWhaleZonePercent?: number;
  isAtWhaleZone?: boolean;
  hyperdashUrl?: string;
  dexScreenerUrl?: string;
  etherscanUrl?: string;
  triggeringWhaleTx?: WhaleTransaction;
  geminiAudit?: GeminiSignalAudit;
}

export interface WhaleWallet {
  id: string;
  address: string;
  ensOrLabel: string;
  chain: "ethereum" | "solana" | "base" | "arbitrum" | "bnb" | "hyperliquid";
  category: "VC_FUND" | "MARKET_MAKER" | "SMART_INSIDER" | "DEX_SNIPER" | "MEV_BOT" | "TREASURY" | "HYPERDASH_ALPHA";
  balanceUsd: number;
  winRate30d: number;
  pnl30d: number;
  favoriteTokens: string[];
  notes?: string;
  isCustom?: boolean;
  hyperdashUrl?: string;
}

export interface WhaleTransaction {
  id: string;
  hash: string;
  timestamp: string;
  timeAgoText?: string;
  walletLabel: string;
  walletAddress: string;
  chain: "ethereum" | "solana" | "base" | "arbitrum" | "bnb" | "hyperliquid";
  tokenSymbol: string;
  tokenName: string;
  action: "BUY" | "SELL" | "CEX_WITHDRAW" | "CEX_DEPOSIT" | "LP_ADD" | "LP_REMOVE";
  amountTokens: number;
  valueUsd: number;
  txPrice: number;
  explorerUrl?: string;
  dexScreenerUrl?: string;
  walletExplorerUrl?: string;
  dexName?: string;
}

export interface BotAlertConfig {
  soundEnabled: boolean;
  minConfidence: number;
  minWhalesCount?: number; // Minimum simultaneous whales in 24h (default 5, configurable to higher)
  minWhaleTxSize: number;
  notifyOnExtremePump: boolean;
  notifyOnExtremeDump: boolean;
  notifyOnStealthAccumulation: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramWebhookUrl?: string;
  autoScanInterval: number; // in seconds, e.g. 15, 30, 60
  is247Enabled?: boolean;
  strictSecurityRequired?: boolean;
  multiWalletOnly?: boolean;
  templates?: TelegramMessageTemplates;
}

export interface TrackedSignal {
  id: string;
  tokenSymbol: string;
  name: string;
  chain: "ethereum" | "solana" | "base" | "arbitrum" | "bnb";
  direction: "PUMP" | "DUMP";
  entryPrice: number; // Represents the average entry price of the 3 spot steps
  currentPrice: number;
  entryStep1?: number; // Step 1 Spot (40% volume)
  entryStep2?: number; // Step 2 Spot (30% volume)
  entryStep3?: number; // Step 3 Spot (30% volume)
  avgEntryPrice?: number; // Average of 3 steps
  step2DistancePercent?: number; // Distance % from step 1 (>= 10%)
  step3DistancePercent?: number; // Distance % from step 2 (>= 10%)
  support1Description?: string;
  support2Description?: string;
  supportConsultationFa?: string;
  target1: number;
  target2: number;
  stopLoss?: number;
  confidence: number;
  rank?: number;
  isTop200?: boolean;
  isWildcardDiscovery?: boolean;
  discoveryReason?: string;
  telegramMessageId: number | null;
  telegramMessageIds?: Record<string, number>;
  status: "ACTIVE" | "HIT_TP1" | "HIT_TP2" | "HIT_STOP_LOSS";
  openedAt: string;
  lastCheckedAt: string;
  closedAt?: string;
  pnlPercent: number;
  maxPnlPercent: number;
  replyMessageId?: number | null;
  catalyst: string;
  notesFa: string;
  whaleInflowUsd?: number;
  securityAudit?: SecurityAudit;
  multiWalletCluster?: MultiWalletCluster;
  geminiAudit?: GeminiSignalAudit;
}

export interface TelegramMessageLog {
  id: string;
  messageId: number;
  chatId: string;
  tokenSymbol: string;
  type: "ALERT" | "REPLY_TP1" | "REPLY_TP2" | "REPLY_STOP_LOSS" | "TEST";
  text: string;
  timestamp: string;
  replyToMessageId?: number;
  status: "SENT" | "FAILED";
  error?: string;
}

export interface TelegramMessageTemplates {
  alertLongTemplate: string;
  alertShortTemplate: string;
  tp1Template: string;
  tp2Template: string;
  stopLossTemplate: string;
  customFooter: string;
}

export interface TelegramTemplateVariable {
  name: string;
  descFa: string;
}

export interface TelegramBotStatus {
  botToken: string;
  maskedToken: string;
  chatId: string;
  channelUsername?: string;
  targets?: string[];
  is247Active: boolean;
  minConfidence: number;
  minWhalesCount?: number;
  scanIntervalSec: number;
  lastScanTime?: string;
  connected: boolean;
  totalAlertsSent: number;
  totalRepliesSent: number;
  successfulTradesCount: number;
  stoppedTradesCount: number;
  averagePnlPercent: number;
  activeSignalsCount?: number;
  scannedUniverseCount?: number;
  multiWalletClustersFound?: number;
  securityAuditsPassed?: number;
  duplicateSignalsPreventedCount?: number;
  unlimitedSignalsEnabled?: boolean;
  templates?: TelegramMessageTemplates;
}

export interface MarketOverviewStats {
  fearGreedIndex: number;
  btcDominance: number;
  totalWhaleVolume24hUsd: number;
  highConvictionCount: number;
  shortSqueezeAlertsCount: number;
  totalScannedTokens: number;
  verifiedSafeTokensCount: number;
  activeClustersCount: number;
}

