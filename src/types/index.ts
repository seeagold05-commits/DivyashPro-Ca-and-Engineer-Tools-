import Decimal from "decimal.js";

// ─── Persona / Mode ─────────────────────────────────────────────
export type Persona = "ca" | "tools";

export type CalculatorMode =
  | "standard"
  | "scientific"
  | "financial"
  | "programmer"
  | "converter";

// ─── GST Types ───────────────────────────────────────────────────
export type GSTRate = 5 | 12 | 18 | 28;
export type GSTDirection = "exclusive" | "inclusive";

export interface GSTInput {
  amount: string;
  rate: GSTRate;
  direction: GSTDirection;
}

export interface GSTResult {
  originalAmount: Decimal;
  gstAmount: Decimal;
  cgst: Decimal;
  sgst: Decimal;
  igst: Decimal;
  totalAmount: Decimal;
  basePrice: Decimal;
  rate: GSTRate;
  direction: GSTDirection;
  breakdown: string;
}

// ─── Tax Regime Types ────────────────────────────────────────────
export type TaxRegime = "old" | "new";

export interface TaxInput {
  grossIncome: string;
  hra?: string;
  section80C?: string;
  section80D?: string;
  homeLoanInterest?: string;
  otherDeductions?: string;
}

export interface TaxSlab {
  from: number;
  to: number;
  rate: number;
}

export interface TaxResult {
  regime: TaxRegime;
  grossIncome: Decimal;
  totalDeductions: Decimal;
  taxableIncome: Decimal;
  taxBeforeCess: Decimal;
  cess: Decimal;
  totalTax: Decimal;
  effectiveRate: Decimal;
  slabBreakdown: { slab: string; tax: Decimal }[];
  rebate?: Decimal;
}

// ─── TDS/TCS Types ──────────────────────────────────────────────
export interface TDSSection {
  section: string;
  description: string;
  rate: number;
  threshold: number;
}

export interface TDSResult {
  section: string;
  amount: Decimal;
  rate: number;
  tdsAmount: Decimal;
  netAmount: Decimal;
}

// ─── Gratuity Types ─────────────────────────────────────────────
export interface GratuityInput {
  lastDrawnSalary: string;
  yearsOfService: string;
}

export interface GratuityResult {
  gratuityAmount: Decimal;
  lastDrawnSalary: Decimal;
  yearsOfService: Decimal;
  formula: string;
}

// ─── Capital Gains Types ────────────────────────────────────────
export interface CapitalGainsInput {
  purchasePrice: string;
  salePrice: string;
  purchaseYear: string;
  saleYear: string;
  assetType: "equity" | "debt" | "property";
}

export interface CapitalGainsResult {
  purchasePrice: Decimal;
  salePrice: Decimal;
  indexedCost: Decimal;
  capitalGain: Decimal;
  taxRate: number;
  taxAmount: Decimal;
  gainType: "STCG" | "LTCG";
  holdingPeriod: number;
}

// ─── EMI Types ──────────────────────────────────────────────────
export interface EMIInput {
  principal: string;
  annualRate: string;
  tenureMonths: string;
}

export interface EMIResult {
  emi: Decimal;
  totalPayment: Decimal;
  totalInterest: Decimal;
  principal: Decimal;
  schedule: EMIScheduleEntry[];
}

export interface EMIScheduleEntry {
  month: number;
  emi: Decimal;
  principal: Decimal;
  interest: Decimal;
  balance: Decimal;
}

// ─── Inventory MIS Types ────────────────────────────────────────
export interface InventoryInput {
  openingStock: string;
  purchases: string;
  closingStock: string;
  revenue: string;
}

export interface InventoryResult {
  cogs: Decimal;
  stockTurnoverRatio: Decimal;
  averageStock: Decimal;
  grossProfit: Decimal;
  grossProfitMargin: Decimal;
}

// ─── Share Market Types ──────────────────────────────────────────
export interface ShareInput {
  buyPrice: string;
  quantity: string;
  brokeragePercent?: string;
  sttPercent?: string;
  transactionChargePercent?: string;
  gstOnBrokerage?: string;
  sebiChargePercent?: string;
  stampDutyPercent?: string;
}

export interface ShareResult {
  buyPrice: Decimal;
  totalBuyCost: Decimal;
  breakEvenPrice: Decimal;
  charges: {
    brokerage: Decimal;
    stt: Decimal;
    transactionCharge: Decimal;
    gst: Decimal;
    sebiCharge: Decimal;
    stampDuty: Decimal;
    totalCharges: Decimal;
  };
}

// ─── Dashboard Module ────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  timestamp: Date;
  expression: string;
  result: string;
  mode: CalculatorMode;
  editable: boolean;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  mode: CalculatorMode;
  timestamp: Date;
  isFavorite: boolean;
}

// ─── Dashboard Module ────────────────────────────────────────────
export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  route: string;
  badge?: string;
}

// ─── GT Memory ──────────────────────────────────────────────────
export interface GTMemoryEntry {
  id: string;
  label: string;
  value: Decimal;
  timestamp: Date;
}
