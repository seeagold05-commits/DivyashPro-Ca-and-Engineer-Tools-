import Decimal from "decimal.js";
import type { GratuityInput, GratuityResult } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

/**
 * Gratuity Calculation (Payment of Gratuity Act, 1972)
 * Formula: (15 × Last Drawn Salary × Years of Service) / 26
 *
 * - Last Drawn Salary = Basic + DA
 * - Minimum 5 years of continuous service required
 * - Maximum gratuity: ₹25,00,000 (tax-exempt limit)
 */
export function calculateGratuity(input: GratuityInput): GratuityResult {
  const salary = new Decimal(input.lastDrawnSalary || "0");
  const years = new Decimal(input.yearsOfService || "0");

  const gratuityAmount = new Decimal(15)
    .mul(salary)
    .mul(years)
    .div(26);

  const formula = `(15 × ₹${salary.toFixed(0)} × ${years.toFixed(1)} years) / 26 = ₹${gratuityAmount.toFixed(2)}`;

  return {
    gratuityAmount,
    lastDrawnSalary: salary,
    yearsOfService: years,
    formula,
  };
}

export const GRATUITY_TAX_EXEMPT_LIMIT = 2500000;
