import Decimal from "decimal.js";
import type { GSTInput, GSTResult, GSTRate } from "@/types";

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

/**
 * Smart GST Calculator — handles both Inclusive & Exclusive GST
 * simultaneously with Decimal.js precision for zero rounding errors.
 *
 * Exclusive (GST added ON TOP):
 *   GST = Amount × (Rate / 100)
 *   Total = Amount + GST
 *
 * Inclusive (GST extracted FROM amount):
 *   Base = Amount × (100 / (100 + Rate))
 *   GST = Amount - Base
 */
export function calculateGST(input: GSTInput): GSTResult {
  const amount = new Decimal(input.amount || "0");
  const rate = new Decimal(input.rate);
  const hundred = new Decimal(100);

  let basePrice: Decimal;
  let gstAmount: Decimal;
  let totalAmount: Decimal;

  if (input.direction === "exclusive") {
    // GST is added on top of the base price
    basePrice = amount;
    gstAmount = amount.mul(rate).div(hundred);
    totalAmount = amount.plus(gstAmount);
  } else {
    // GST is included — extract base price from total
    totalAmount = amount;
    basePrice = amount.mul(hundred).div(hundred.plus(rate));
    gstAmount = totalAmount.minus(basePrice);
  }

  // CGST and SGST are each half of total GST (intra-state)
  const cgst = gstAmount.div(2);
  const sgst = gstAmount.div(2);
  // IGST equals full GST (inter-state)
  const igst = gstAmount;

  const breakdown = [
    `Base Price: ₹${basePrice.toFixed(2)}`,
    `GST @ ${input.rate}%: ₹${gstAmount.toFixed(2)}`,
    `  ├─ CGST @ ${input.rate / 2}%: ₹${cgst.toFixed(2)}`,
    `  └─ SGST @ ${input.rate / 2}%: ₹${sgst.toFixed(2)}`,
    `  (or IGST @ ${input.rate}%: ₹${igst.toFixed(2)})`,
    `Total: ₹${totalAmount.toFixed(2)}`,
  ].join("\n");

  return {
    originalAmount: amount,
    gstAmount,
    cgst,
    sgst,
    igst,
    totalAmount,
    basePrice,
    rate: input.rate,
    direction: input.direction,
    breakdown,
  };
}

/**
 * Batch GST — calculate across all Indian GST slabs at once
 * for quick comparison.
 */
export function calculateAllSlabs(
  amount: string,
  direction: GSTDirection
): GSTResult[] {
  const rates: GSTRate[] = [5, 12, 18, 28];
  return rates.map((rate) => calculateGST({ amount, rate, direction }));
}

/**
 * Reverse GST — given the total amount with GST included,
 * determine the original base price and GST component.
 * This is an alias for inclusive calculation.
 */
export function reverseGST(totalAmount: string, rate: GSTRate): GSTResult {
  return calculateGST({ amount: totalAmount, rate, direction: "inclusive" });
}

type GSTDirection = "exclusive" | "inclusive";
