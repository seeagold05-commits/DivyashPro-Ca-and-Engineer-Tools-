"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { compareTaxRegimes, NEW_REGIME_SLABS, OLD_REGIME_SLABS } from "@/lib/tax-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { TaxInput, TaxRegime, TaxSlab } from "@/types";

export function TaxCalculator() {
  const [input, setInput] = useState<TaxInput>({
    grossIncome: "",
    hra: "",
    section80C: "",
    section80D: "",
    homeLoanInterest: "",
    otherDeductions: "",
  });
  const [result, setResult] = useState<ReturnType<typeof compareTaxRegimes> | null>(null);

  const handleCalculate = () => {
    if (!input.grossIncome) return;
    const res = compareTaxRegimes(input);
    setResult(res);
  };

  const slabDisplay = (slabs: TaxSlab[], label: string) => (
    <div className="glass-card p-4">
      <h4 className="text-sm font-semibold text-white/70 mb-3">{label}</h4>
      <div className="space-y-1">
        {slabs.map((s, i) => (
          <div key={i} className="flex justify-between text-xs text-white/50">
            <span>
              ₹{formatIndianNumber(s.from)} – {s.to === Infinity ? "Above" : `₹${formatIndianNumber(s.to)}`}
            </span>
            <span className="font-medium text-white/70">{s.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ background: "var(--accent-gradient)" }}>
          📊
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">2026 Tax Planner</h2>
          <p className="text-xs text-white/40">AY 2026-27 • New Regime Slabs Updated</p>
        </div>
      </div>

      {/* Slab Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slabDisplay(NEW_REGIME_SLABS, "New Regime (AY 2026-27)")}
        {slabDisplay(OLD_REGIME_SLABS, "Old Regime")}
      </div>

      {/* Input Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Income Details</h3>

        <div>
          <label className="block text-xs text-white/50 mb-1.5">Gross Annual Income (₹)</label>
          <input
            type="number"
            className="glass-input display-number"
            placeholder="e.g., 1500000"
            value={input.grossIncome}
            onChange={(e) => setInput({ ...input, grossIncome: e.target.value })}
          />
        </div>

        <div className="pt-2 border-t border-white/5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Deductions (Old Regime Only)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "hra" as const, label: "HRA Exemption", placeholder: "₹" },
              { key: "section80C" as const, label: "Sec 80C (max ₹1.5L)", placeholder: "₹" },
              { key: "section80D" as const, label: "Sec 80D (max ₹75K)", placeholder: "₹" },
              { key: "homeLoanInterest" as const, label: "Home Loan Interest (max ₹2L)", placeholder: "₹" },
              { key: "otherDeductions" as const, label: "Other Deductions", placeholder: "₹" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-white/40 mb-1">{field.label}</label>
                <input
                  type="number"
                  className="glass-input text-sm display-number"
                  placeholder={field.placeholder}
                  value={input[field.key] || ""}
                  onChange={(e) => setInput({ ...input, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleCalculate} className="accent-btn w-full mt-4">
          Calculate Tax Comparison
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Recommendation Banner */}
            <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Recommended Regime</p>
                  <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                    {result.recommended === "new" ? "New Regime" : "Old Regime"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">You Save</p>
                  <p className="text-lg font-bold text-emerald-400 display-number">
                    ₹{formatIndianNumber(result.savings.toFixed(0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["new", "old"] as TaxRegime[]).map((regime) => {
                const r = result[regime];
                const isRecommended = result.recommended === regime;
                return (
                  <motion.div
                    key={regime}
                    className={`glass-card p-5 ${isRecommended ? "ring-1" : ""}`}
                    style={isRecommended ? { borderColor: "var(--accent)" } : {}}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: regime === "new" ? 0.1 : 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white/80">
                        {regime === "new" ? "New Regime (2026)" : "Old Regime"}
                      </h3>
                      {isRecommended && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ background: "var(--accent)", color: "#000" }}>
                          Better
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: "Gross Income", value: r.grossIncome },
                        { label: "Deductions", value: r.totalDeductions },
                        { label: "Taxable Income", value: r.taxableIncome },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-white/40">{row.label}</span>
                          <span className="text-white/70 display-number">₹{formatIndianNumber(row.value.toFixed(0))}</span>
                        </div>
                      ))}

                      <div className="border-t border-white/10 pt-2 mt-2" />

                      {r.slabBreakdown.map((s, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-white/30">{s.slab}</span>
                          <span className="text-white/50 display-number">₹{formatIndianNumber(s.tax.toFixed(0))}</span>
                        </div>
                      ))}

                      {r.rebate && r.rebate.gt(0) && (
                        <div className="flex justify-between text-xs text-emerald-400/70">
                          <span>Rebate u/s 87A</span>
                          <span className="display-number">-₹{formatIndianNumber(r.rebate.toFixed(0))}</span>
                        </div>
                      )}

                      <div className="border-t border-white/10 pt-2 mt-2" />

                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Tax Before Cess</span>
                        <span className="text-white/70 display-number">₹{formatIndianNumber(r.taxBeforeCess.toFixed(0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Cess (4%)</span>
                        <span className="text-white/70 display-number">₹{formatIndianNumber(r.cess.toFixed(0))}</span>
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-white/80">Total Tax</span>
                          <span className="font-bold text-lg display-number" style={{ color: "var(--accent)" }}>
                            ₹{formatIndianNumber(r.totalTax.toFixed(0))}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-white/30">Effective Rate</span>
                          <span className="text-white/50">{r.effectiveRate.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
