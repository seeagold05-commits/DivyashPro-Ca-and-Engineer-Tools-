"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateGST, reverseGST, calculateAllSlabs } from "@/lib/gst-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { GSTRate, GSTDirection, GSTResult } from "@/types";

const RATES: GSTRate[] = [5, 12, 18, 28];

export function GSTCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<GSTRate>(18);
  const [direction, setDirection] = useState<GSTDirection>("exclusive");
  const [result, setResult] = useState<GSTResult | null>(null);
  const [allSlabs, setAllSlabs] = useState<GSTResult[] | null>(null);
  const [showAllSlabs, setShowAllSlabs] = useState(false);

  const handleCalculate = () => {
    if (!amount) return;
    const res = calculateGST({ amount, rate, direction });
    setResult(res);
    setAllSlabs(null);
    setShowAllSlabs(false);
  };

  const handleReverse = () => {
    if (!amount) return;
    const res = reverseGST(amount, rate);
    setResult(res);
    setAllSlabs(null);
    setShowAllSlabs(false);
  };

  const handleAllSlabs = () => {
    if (!amount) return;
    const results = calculateAllSlabs(amount, direction);
    setAllSlabs(results);
    setResult(null);
    setShowAllSlabs(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ background: "var(--accent-gradient)" }}>
          ₹
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Smart GST Pro</h2>
          <p className="text-xs text-white/40">Forward, Reverse & Multi-Slab Comparison</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Direction Toggle */}
        <div className="flex gap-2">
          {(["exclusive", "inclusive"] as GSTDirection[]).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                direction === d ? "text-white shadow-lg" : "glass-button text-white/50"
              }`}
              style={direction === d ? { background: "var(--accent-gradient)" } : {}}
            >
              {d === "exclusive" ? "GST Extra (Exclusive)" : "GST Included (Inclusive)"}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Amount (₹)</label>
          <input
            type="number"
            className="glass-input display-number text-lg"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Rate Preset Buttons */}
        <div>
          <label className="block text-xs text-white/50 mb-2">GST Rate</label>
          <div className="grid grid-cols-4 gap-2">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  rate === r ? "text-white shadow-lg" : "glass-button text-white/60"
                }`}
                style={rate === r ? { background: "var(--accent-gradient)" } : {}}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handleCalculate} className="accent-btn text-sm">Calculate</button>
          <button onClick={handleReverse} className="glass-button text-sm text-white/70 hover:text-white">Reverse GST</button>
          <button onClick={handleAllSlabs} className="glass-button text-sm text-white/70 hover:text-white">All Slabs</button>
        </div>
      </div>

      {/* Single Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6 space-y-3"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              GST Breakdown @ {result.rate}%
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-3">
              {[
                { label: "Base Price", value: result.basePrice },
                { label: `GST @ ${result.rate}%`, value: result.gstAmount },
                { label: `CGST @ ${result.rate / 2}%`, value: result.cgst },
                { label: `SGST @ ${result.rate / 2}%`, value: result.sgst },
              ].map((row) => (
                <div key={row.label} className="glass-card p-3">
                  <p className="text-xs text-white/40">{row.label}</p>
                  <p className="text-lg font-bold display-number" style={{ color: "var(--accent)" }}>
                    ₹{formatIndianNumber(row.value.toFixed(2))}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Total Amount</span>
                <span className="text-2xl font-bold display-number text-white">
                  ₹{formatIndianNumber(result.totalAmount.toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-white/30">IGST (Interstate)</span>
                <span className="text-sm text-white/40 display-number">
                  ₹{formatIndianNumber(result.igst.toFixed(2))}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Slabs Comparison */}
      <AnimatePresence>
        {showAllSlabs && allSlabs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">All Slabs Comparison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {allSlabs.map((slab) => (
                <motion.div
                  key={slab.rate}
                  className="glass-card p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: RATES.indexOf(slab.rate) * 0.08 }}
                >
                  <div className="text-center mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "var(--accent-gradient)", color: "#000" }}>
                      {slab.rate}%
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Base</span>
                      <span className="text-white/70 display-number">₹{formatIndianNumber(slab.basePrice.toFixed(2))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">GST</span>
                      <span className="display-number" style={{ color: "var(--accent)" }}>₹{formatIndianNumber(slab.gstAmount.toFixed(2))}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5">
                      <span className="text-white/60 font-medium">Total</span>
                      <span className="text-white font-bold display-number">₹{formatIndianNumber(slab.totalAmount.toFixed(2))}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
