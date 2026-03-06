"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateInventoryMIS } from "@/lib/inventory-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { InventoryResult } from "@/types";

export function InventoryMIS() {
  const [openingStock, setOpeningStock] = useState("");
  const [purchases, setPurchases] = useState("");
  const [closingStock, setClosingStock] = useState("");
  const [revenue, setRevenue] = useState("");
  const [result, setResult] = useState<InventoryResult | null>(null);

  const handleCalculate = useCallback(() => {
    if (
      !openingStock ||
      !purchases ||
      !closingStock ||
      !revenue ||
      isNaN(Number(openingStock)) ||
      isNaN(Number(purchases)) ||
      isNaN(Number(closingStock)) ||
      isNaN(Number(revenue))
    )
      return;
    const res = calculateInventoryMIS({
      openingStock,
      purchases,
      closingStock,
      revenue,
    });
    setResult(res);
  }, [openingStock, purchases, closingStock, revenue]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg">
            INV
          </span>
          Inventory MIS
        </h2>
        <p className="mt-1 text-sm text-white/40">
          COGS, Stock Turnover, Gross Profit Margin analysis
        </p>
      </div>

      {/* Formula Reference */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">
          Formulas
        </div>
        <div className="space-y-1 text-xs text-white/50">
          <p>
            <span className="text-emerald-400 font-semibold">COGS</span> = Opening Stock + Purchases - Closing Stock
          </p>
          <p>
            <span className="text-emerald-400 font-semibold">Avg Stock</span> = (Opening + Closing) / 2
          </p>
          <p>
            <span className="text-emerald-400 font-semibold">Turnover Ratio</span> = COGS / Avg Stock
          </p>
          <p>
            <span className="text-emerald-400 font-semibold">GP Margin</span> = (Revenue - COGS) / Revenue x 100
          </p>
        </div>
      </motion.div>

      {/* Input Section */}
      <div className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opening Stock */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Opening Stock (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={openingStock}
              onChange={(e) => setOpeningStock(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 200000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>

          {/* Purchases */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Purchases (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={purchases}
              onChange={(e) => setPurchases(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 800000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>

          {/* Closing Stock */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Closing Stock (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={closingStock}
              onChange={(e) => setClosingStock(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 150000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>

          {/* Revenue */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Revenue (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 1200000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>
        </div>

        {/* Calculate Button */}
        <motion.button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-shadow"
          whileTap={{ scale: 0.97 }}
        >
          Compute Inventory MIS
        </motion.button>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Inventory Analysis
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* COGS */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">
                Cost of Goods Sold (COGS)
              </div>
              <div className="text-lg font-bold display-number text-white/90">
                &#8377;{formatIndianNumber(result.cogs.toFixed(2))}
              </div>
            </div>

            {/* Average Stock */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Average Stock</div>
              <div className="text-lg font-bold display-number text-white/90">
                &#8377;{formatIndianNumber(result.averageStock.toFixed(2))}
              </div>
            </div>

            {/* Stock Turnover Ratio */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-white/40 mb-1">
                Stock Turnover Ratio
              </div>
              <div className="text-lg font-bold display-number text-emerald-400">
                {result.stockTurnoverRatio.toFixed(2)}x
              </div>
            </div>

            {/* Gross Profit */}
            <div
              className={`p-3 rounded-xl ${
                result.grossProfit.gte(0)
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-rose-500/10 border border-rose-500/20"
              }`}
            >
              <div className="text-xs text-white/40 mb-1">Gross Profit</div>
              <div
                className={`text-lg font-bold display-number ${
                  result.grossProfit.gte(0) ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                &#8377;{formatIndianNumber(result.grossProfit.toFixed(2))}
              </div>
            </div>
          </div>

          {/* Gross Profit Margin */}
          <div className="pt-3 border-t border-white/10">
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="text-xs text-white/40 mb-2">
                Gross Profit Margin
              </div>
              <div
                className={`text-3xl font-bold display-number ${
                  result.grossProfitMargin.gte(0) ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {result.grossProfitMargin.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="pt-3 border-t border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Turnover Ratio indicates how many times inventory was sold and replaced
            </div>
            {result.stockTurnoverRatio.lt(2) && (
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Low turnover ratio suggests slow-moving inventory
              </div>
            )}
            {result.grossProfitMargin.lt(0) && (
              <div className="flex items-center gap-2 text-xs text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Negative margin indicates COGS exceeds revenue
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
