import Decimal from "decimal.js";
import type { TaxInput, TaxResult, TaxRegime, TaxSlab } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

// ─── AY 2026-27 (FY 2025-26) New Regime Slabs ──────────────────
const NEW_REGIME_SLABS_2026: TaxSlab[] = [
  { from: 0, to: 400000, rate: 0 },
  { from: 400000, to: 800000, rate: 5 },
  { from: 800000, to: 1200000, rate: 10 },
  { from: 1200000, to: 1600000, rate: 15 },
  { from: 1600000, to: 2000000, rate: 20 },
  { from: 2000000, to: 2400000, rate: 25 },
  { from: 2400000, to: Infinity, rate: 30 },
];

// ─── Old Regime Slabs (unchanged) ───────────────────────────────
const OLD_REGIME_SLABS: TaxSlab[] = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 5 },
  { from: 500000, to: 1000000, rate: 20 },
  { from: 1000000, to: Infinity, rate: 30 },
];

const STANDARD_DEDUCTION_OLD = 50000;
const STANDARD_DEDUCTION_NEW = 75000;

function calculateSlabTax(
  taxableIncome: Decimal,
  slabs: TaxSlab[]
): { tax: Decimal; breakdown: { slab: string; tax: Decimal }[] } {
  let tax = new Decimal(0);
  const breakdown: { slab: string; tax: Decimal }[] = [];

  for (const slab of slabs) {
    if (taxableIncome.lte(slab.from)) break;

    const upper = slab.to === Infinity ? taxableIncome : new Decimal(slab.to);
    const taxableInSlab = Decimal.min(taxableIncome, upper).minus(slab.from);

    if (taxableInSlab.gt(0)) {
      const slabTax = taxableInSlab.mul(slab.rate).div(100);
      tax = tax.plus(slabTax);

      const toLabel =
        slab.to === Infinity
          ? "Above"
          : `₹${(slab.to / 100000).toFixed(1)}L`;
      const fromLabel = `₹${(slab.from / 100000).toFixed(1)}L`;

      breakdown.push({
        slab: `${fromLabel} – ${toLabel} @ ${slab.rate}%`,
        tax: slabTax,
      });
    }
  }

  return { tax, breakdown };
}

export function calculateIncomeTax(
  input: TaxInput,
  regime: TaxRegime
): TaxResult {
  const grossIncome = new Decimal(input.grossIncome || "0");

  let totalDeductions = new Decimal(0);

  if (regime === "old") {
    totalDeductions = totalDeductions.plus(STANDARD_DEDUCTION_OLD);
    if (input.hra) totalDeductions = totalDeductions.plus(input.hra);
    if (input.section80C)
      totalDeductions = totalDeductions.plus(
        Decimal.min(input.section80C, 150000)
      );
    if (input.section80D)
      totalDeductions = totalDeductions.plus(
        Decimal.min(input.section80D, 75000)
      );
    if (input.homeLoanInterest)
      totalDeductions = totalDeductions.plus(
        Decimal.min(input.homeLoanInterest, 200000)
      );
    if (input.otherDeductions)
      totalDeductions = totalDeductions.plus(input.otherDeductions);
  } else {
    totalDeductions = new Decimal(STANDARD_DEDUCTION_NEW);
  }

  const taxableIncome = Decimal.max(grossIncome.minus(totalDeductions), 0);
  const slabs = regime === "old" ? OLD_REGIME_SLABS : NEW_REGIME_SLABS_2026;

  const { tax: taxBeforeCess, breakdown: slabBreakdown } = calculateSlabTax(
    taxableIncome,
    slabs
  );

  // Rebate u/s 87A
  let finalTax = taxBeforeCess;
  let rebate = new Decimal(0);

  if (regime === "new" && taxableIncome.lte(1200000)) {
    // AY 2026-27: rebate up to ₹60,000 for income ≤ 12L under new regime
    rebate = Decimal.min(finalTax, 60000);
    finalTax = finalTax.minus(rebate);
  }
  if (regime === "old" && taxableIncome.lte(500000)) {
    rebate = Decimal.min(finalTax, 12500);
    finalTax = finalTax.minus(rebate);
  }

  // Marginal relief for new regime (income just above 12L)
  if (regime === "new" && taxableIncome.gt(1200000) && taxableIncome.lte(1260000)) {
    const incomeAboveThreshold = taxableIncome.minus(1200000);
    if (finalTax.gt(incomeAboveThreshold)) {
      finalTax = incomeAboveThreshold;
    }
  }

  const cess = finalTax.mul(4).div(100);
  const totalTax = finalTax.plus(cess);

  const effectiveRate = grossIncome.gt(0)
    ? totalTax.div(grossIncome).mul(100)
    : new Decimal(0);

  return {
    regime,
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxBeforeCess: finalTax,
    cess,
    totalTax,
    effectiveRate,
    slabBreakdown,
    rebate,
  };
}

export function compareTaxRegimes(input: TaxInput) {
  const oldResult = calculateIncomeTax(input, "old");
  const newResult = calculateIncomeTax(input, "new");
  const savings = oldResult.totalTax.minus(newResult.totalTax);

  return {
    old: oldResult,
    new: newResult,
    savings: savings.abs(),
    recommended: savings.gt(0) ? ("new" as TaxRegime) : ("old" as TaxRegime),
  };
}

export const NEW_REGIME_SLABS = NEW_REGIME_SLABS_2026;
export { OLD_REGIME_SLABS };
