import Decimal from "decimal.js";
import type { InventoryInput, InventoryResult } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

/**
 * Inventory MIS Calculations:
 *
 * COGS = Opening Stock + Purchases - Closing Stock
 * Average Stock = (Opening Stock + Closing Stock) / 2
 * Stock Turnover Ratio = COGS / Average Stock
 * Gross Profit = Revenue - COGS
 * Gross Profit Margin = (Gross Profit / Revenue) × 100
 */
export function calculateInventoryMIS(input: InventoryInput): InventoryResult {
  const openingStock = new Decimal(input.openingStock || "0");
  const purchases = new Decimal(input.purchases || "0");
  const closingStock = new Decimal(input.closingStock || "0");
  const revenue = new Decimal(input.revenue || "0");

  const cogs = openingStock.plus(purchases).minus(closingStock);
  const averageStock = openingStock.plus(closingStock).div(2);
  const stockTurnoverRatio = averageStock.gt(0)
    ? cogs.div(averageStock)
    : new Decimal(0);
  const grossProfit = revenue.minus(cogs);
  const grossProfitMargin = revenue.gt(0)
    ? grossProfit.div(revenue).mul(100)
    : new Decimal(0);

  return {
    cogs,
    stockTurnoverRatio,
    averageStock,
    grossProfit,
    grossProfitMargin,
  };
}
