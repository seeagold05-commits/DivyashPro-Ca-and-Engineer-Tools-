"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TDS_SECTIONS, calculateTDS } from "@/lib/tds-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { TDSSection, TDSResult } from "@/types";

export function TDSCalculator() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<TDSResult | null>(null);

  const selectedSection: TDSSection = TDS_SECTIONS[selectedIndex];

  const handleCalculate = useCallback(() => {
    if (!amount || isNaN(Number(amount))) return;
    const res = calculateTDS(amount, selectedSection);
    setResult(res);
  }, [amount, selectedSection]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg">
            %
          </span>
          TDS Calculator
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Tax Deducted at Source — all major sections with threshold info
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 space-y-5">
        {/* Section Dropdown */}
        <div>
          <label className="block text-sm text-white/50 mb-2">TDS Section</label>
          <select
            value={selectedIndex}
            onChange={(e) => {
              setSelectedIndex(Number(e.target.value));
              setResult(null);
            }}
            className="glass-input w-full cursor-pointer"
          >
            {TDS_SECTIONS.map((sec, idx) => (
              <option key={idx} value={idx} className="bg-[#1a1a2e] text-white">
                {sec.section} — {sec.description} ({sec.rate}%)
              </option>
            ))}
          </select>
        </div>

        {/* Section Info Badge */}
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="text-xs text-emerald-400 font-semibold">
            Section {selectedSection.section}
          </div>
          <div className="text-xs text-white/40">|</div>
          <div className="text-xs text-white/50">
            Rate: <span className="text-emerald-400 font-semibold">{selectedSection.rate}%</span>
          </div>
          <div className="text-xs text-white/40">|</div>
          <div className="text-xs text-white/50">
            Threshold: <span className="text-white/70 display-number font-semibold">
              {formatIndianNumber(selectedSection.threshold)}
            </span>
          </div>
        </motion.div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm text-white/50 mb-2">Payment Amount (&#8377;)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="Enter payment amount..."
            className="glass-input text-2xl display-number font-semibold"
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          />
        </div>

        {/* Calculate Button */}
        <motion.button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-shadow"
          whileTap={{ scale: 0.97 }}
        >
          Calculate TDS
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
            TDS Computation — Section {result.section}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Payment Amount</div>
              <div className="text-lg font-bold display-number text-white/90">
                &#8377;{formatIndianNumber(result.amount.toFixed(2))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-white/40 mb-1">Net Amount (After TDS)</div>
              <div className="text-lg font-bold display-number text-emerald-400">
                &#8377;{formatIndianNumber(result.netAmount.toFixed(2))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">TDS Rate Applied</div>
              <div className="text-lg font-bold display-number text-amber-400">
                {result.rate}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">TDS Amount Deducted</div>
              <div className="text-lg font-bold display-number text-rose-400">
                &#8377;{formatIndianNumber(result.tdsAmount.toFixed(2))}
              </div>
            </div>
          </div>

          {/* Threshold Warning */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              TDS under Section {selectedSection.section} applies when payment exceeds
              <span className="text-white/60 display-number font-semibold">
                &#8377;{formatIndianNumber(selectedSection.threshold)}
              </span>
            </div>
            {Number(amount) < selectedSection.threshold && Number(amount) > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Amount is below threshold — TDS may not be applicable
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
