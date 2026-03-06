"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateGratuity, GRATUITY_TAX_EXEMPT_LIMIT } from "@/lib/gratuity-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { GratuityResult } from "@/types";

export function GratuityCalculator() {
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<GratuityResult | null>(null);

  const handleCalculate = useCallback(() => {
    if (!salary || !years || isNaN(Number(salary)) || isNaN(Number(years))) return;
    const res = calculateGratuity({
      lastDrawnSalary: salary,
      yearsOfService: years,
    });
    setResult(res);
  }, [salary, years]);

  const exceedsExemptLimit =
    result && result.gratuityAmount.gt(GRATUITY_TAX_EXEMPT_LIMIT);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg">
            G
          </span>
          Gratuity Calculator
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Payment of Gratuity Act, 1972 — with tax-exempt limit check
        </p>
      </div>

      {/* Formula Display */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">
          Formula
        </div>
        <div className="text-sm text-emerald-400 display-number font-semibold">
          Gratuity = (15 x Last Drawn Salary x Years of Service) / 26
        </div>
        <div className="mt-2 text-xs text-white/30">
          Last Drawn Salary = Basic + Dearness Allowance (DA)
        </div>
      </motion.div>

      {/* Input Section */}
      <div className="glass-card p-6 space-y-5">
        {/* Salary Input */}
        <div>
          <label className="block text-sm text-white/50 mb-2">
            Last Drawn Salary — Basic + DA (&#8377;/month)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={salary}
            onChange={(e) => setSalary(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. 50000"
            className="glass-input text-2xl display-number font-semibold"
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          />
        </div>

        {/* Years of Service Input */}
        <div>
          <label className="block text-sm text-white/50 mb-2">
            Years of Continuous Service
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={years}
            onChange={(e) => setYears(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. 10"
            className="glass-input text-2xl display-number font-semibold"
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          />
        </div>

        {/* Minimum Years Warning */}
        {years && Number(years) > 0 && Number(years) < 5 && (
          <div className="flex items-center gap-2 text-xs text-amber-400 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Minimum 5 years of continuous service required for gratuity eligibility
          </div>
        )}

        {/* Calculate Button */}
        <motion.button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-shadow"
          whileTap={{ scale: 0.97 }}
        >
          Calculate Gratuity
        </motion.button>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Gratuity Amount */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Gratuity Computation
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40 mb-1">Last Drawn Salary</div>
                <div className="text-lg font-bold display-number text-white/90">
                  &#8377;{formatIndianNumber(result.lastDrawnSalary.toFixed(2))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40 mb-1">Years of Service</div>
                <div className="text-lg font-bold display-number text-white/90">
                  {result.yearsOfService.toFixed(1)} years
                </div>
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Calculation</div>
              <div className="text-sm display-number text-white/70">
                {result.formula}
              </div>
            </div>

            {/* Gratuity Amount Result */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-white/40 mb-1">Gratuity Amount</div>
              <div className="text-2xl font-bold display-number text-emerald-400">
                &#8377;{formatIndianNumber(result.gratuityAmount.toFixed(2))}
              </div>
            </div>
          </div>

          {/* Tax Exempt Limit Check */}
          <div
            className={`glass-card p-4 ${
              exceedsExemptLimit
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  exceedsExemptLimit
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {exceedsExemptLimit ? "!" : "✓"}
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    exceedsExemptLimit ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {exceedsExemptLimit
                    ? "Exceeds Tax-Exempt Limit"
                    : "Within Tax-Exempt Limit"}
                </p>
                <p className="text-xs text-white/40">
                  Tax-exempt limit under Section 10(10) is{" "}
                  <span className="text-white/60 display-number font-semibold">
                    &#8377;{formatIndianNumber(GRATUITY_TAX_EXEMPT_LIMIT)}
                  </span>
                  {exceedsExemptLimit && (
                    <>
                      {" "}— taxable excess:{" "}
                      <span className="text-amber-400 display-number font-semibold">
                        &#8377;
                        {formatIndianNumber(
                          result.gratuityAmount
                            .minus(GRATUITY_TAX_EXEMPT_LIMIT)
                            .toFixed(2)
                        )}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
