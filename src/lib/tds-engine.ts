import Decimal from "decimal.js";
import type { TDSSection, TDSResult } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

export const TDS_SECTIONS: TDSSection[] = [
  { section: "194A", description: "Interest (Banks)", rate: 10, threshold: 40000 },
  { section: "194A", description: "Interest (Others)", rate: 10, threshold: 5000 },
  { section: "194C", description: "Contractor (Individual/HUF)", rate: 1, threshold: 30000 },
  { section: "194C", description: "Contractor (Others)", rate: 2, threshold: 30000 },
  { section: "194H", description: "Commission / Brokerage", rate: 5, threshold: 15000 },
  { section: "194I(a)", description: "Rent – Plant & Machinery", rate: 2, threshold: 240000 },
  { section: "194I(b)", description: "Rent – Land/Building/Furniture", rate: 10, threshold: 240000 },
  { section: "194J", description: "Professional Fees", rate: 10, threshold: 30000 },
  { section: "194J", description: "Technical Services (FTS)", rate: 2, threshold: 30000 },
  { section: "194Q", description: "Purchase of Goods", rate: 0.1, threshold: 5000000 },
  { section: "194R", description: "Perquisites/Benefits", rate: 10, threshold: 20000 },
  { section: "194S", description: "Digital Assets (Crypto/VDA)", rate: 1, threshold: 50000 },
  { section: "194N", description: "Cash Withdrawal > ₹1Cr", rate: 2, threshold: 10000000 },
  { section: "194O", description: "E-commerce Operator", rate: 1, threshold: 500000 },
  { section: "194DA", description: "Life Insurance Payout", rate: 5, threshold: 100000 },
  { section: "194B", description: "Lottery / Crossword", rate: 30, threshold: 10000 },
];

export function calculateTDS(
  amount: string,
  section: TDSSection
): TDSResult {
  const amt = new Decimal(amount || "0");
  const rate = new Decimal(section.rate);

  const tdsAmount = amt.mul(rate).div(100);
  const netAmount = amt.minus(tdsAmount);

  return {
    section: section.section,
    amount: amt,
    rate: section.rate,
    tdsAmount,
    netAmount,
  };
}

export function calculateTCS(amount: string, rate: number): {
  amount: Decimal;
  tcsAmount: Decimal;
  totalAmount: Decimal;
} {
  const amt = new Decimal(amount || "0");
  const tcsAmount = amt.mul(rate).div(100);
  return {
    amount: amt,
    tcsAmount,
    totalAmount: amt.plus(tcsAmount),
  };
}
