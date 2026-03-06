"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateBreakEven } from "@/lib/share-engine";
import { formatIndianNumber, hapticFeedback } from "@/lib/utils";
import type { ShareResult } from "@/types";

export function ShareCalculator() {
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState<ShareResult | null>(null);

  const handleCalculate = useCallback(() => {
    if (!buyPrice || !quantity) return;
    hapticFeedback("medium");
    const res = calculateBreakEven({ buyPrice, quantity });
    setResult(res);
  }, [buyPrice, quantity]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-lg">
            📈
          </span>
          Share Market Break-Even
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Calculate break-even price including brokerage, STT & SEBI charges
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Buy Price (₹)</label>
            <input
              type="text"
              inputMode="decimal"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 1500"
              className="glass-input display-number"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Quantity</label>
            <input
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 100"
              className="glass-input display-number"
            />
          </div>
        </div>

        <motion.button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-lg"
          whileTap={{ scale: 0.97 }}
        >
          Calculate Break-Even
        </motion.button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-white/40 mb-1">Break-Even Sell Price</p>
            <p className="text-3xl font-bold text-cyan-400 display-number">
              ₹{formatIndianNumber(result.breakEvenPrice.toFixed(2))}
            </p>
            <p className="text-xs text-white/30 mt-1">
              per share (to recover all charges)
            </p>
          </div>

          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Charge Breakdown (Buy + Sell)
          </h3>
          <div className="space-y-2">
            <ChargeRow label="Brokerage" value={result.charges.brokerage.toFixed(2)} />
            <ChargeRow label="STT" value={result.charges.stt.toFixed(2)} />
            <ChargeRow label="Transaction Charges" value={result.charges.transactionCharge.toFixed(2)} />
            <ChargeRow label="GST on Brokerage" value={result.charges.gst.toFixed(2)} />
            <ChargeRow label="SEBI Charges" value={result.charges.sebiCharge.toFixed(4)} />
            <ChargeRow label="Stamp Duty" value={result.charges.stampDuty.toFixed(4)} />
            <div className="border-t border-white/10 pt-2">
              <ChargeRow label="Total Charges" value={result.charges.totalCharges.toFixed(2)} highlight />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ChargeRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-white/40">{label}</span>
      <span className={`text-sm font-medium display-number ${highlight ? "text-cyan-400" : "text-white/70"}`}>
        ₹{formatIndianNumber(value)}
      </span>
    </div>
  );
}
