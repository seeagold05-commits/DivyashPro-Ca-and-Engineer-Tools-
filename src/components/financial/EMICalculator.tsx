"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateEMI } from "@/lib/emi-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { EMIResult } from "@/types";

export function EMICalculator() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [result, setResult] = useState<EMIResult | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const handleCalculate = useCallback(() => {
    if (
      !principal ||
      !annualRate ||
      !tenureMonths ||
      isNaN(Number(principal)) ||
      isNaN(Number(annualRate)) ||
      isNaN(Number(tenureMonths))
    )
      return;
    const res = calculateEMI({ principal, annualRate, tenureMonths });
    setResult(res);
    setShowSchedule(false);
  }, [principal, annualRate, tenureMonths]);

  // Calculate principal vs interest ratio for the bar visual
  const principalPercent =
    result && result.totalPayment.gt(0)
      ? result.principal.div(result.totalPayment).mul(100).toNumber()
      : 0;
  const interestPercent = 100 - principalPercent;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg">
            EMI
          </span>
          EMI Calculator
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Equated Monthly Installment with full amortization schedule
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 space-y-5">
        {/* Principal */}
        <div>
          <label className="block text-sm text-white/50 mb-2">
            Loan Principal (&#8377;)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. 5000000"
            className="glass-input text-xl display-number font-semibold"
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Annual Interest Rate */}
          <div>
            <label className="block text-sm text-white/50 mb-2">
              Annual Interest Rate (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 8.5"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm text-white/50 mb-2">
              Tenure (months)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 240"
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
          Calculate EMI
        </motion.button>
      </div>

      {/* Result Display */}
      {result && result.emi.gt(0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Principal vs Interest Bar */}
          <div className="glass-card p-4 space-y-3">
            <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">
              Principal vs Interest Breakup
            </div>
            <div className="flex h-6 rounded-lg overflow-hidden">
              <div
                className="bg-emerald-500/70 flex items-center justify-center text-[10px] font-semibold text-white transition-all duration-500"
                style={{ width: `${principalPercent}%` }}
              >
                {principalPercent > 15 ? `${principalPercent.toFixed(1)}%` : ""}
              </div>
              <div
                className="bg-amber-500/70 flex items-center justify-center text-[10px] font-semibold text-white transition-all duration-500"
                style={{ width: `${interestPercent}%` }}
              >
                {interestPercent > 15 ? `${interestPercent.toFixed(1)}%` : ""}
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-white/50">
                <span className="w-2 h-2 rounded-sm bg-emerald-500/70" />
                Principal
              </span>
              <span className="flex items-center gap-1.5 text-white/50">
                <span className="w-2 h-2 rounded-sm bg-amber-500/70" />
                Interest
              </span>
            </div>
          </div>

          {/* Key Figures */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              EMI Summary
            </h3>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xs text-white/40 mb-1">Monthly EMI</div>
              <div className="text-3xl font-bold display-number text-emerald-400">
                &#8377;{formatIndianNumber(result.emi.toFixed(2))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40 mb-1">Principal</div>
                <div className="text-sm font-bold display-number text-white/90">
                  &#8377;{formatIndianNumber(result.principal.toFixed(0))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40 mb-1">Total Interest</div>
                <div className="text-sm font-bold display-number text-amber-400">
                  &#8377;{formatIndianNumber(result.totalInterest.toFixed(0))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40 mb-1">Total Payment</div>
                <div className="text-sm font-bold display-number text-white/90">
                  &#8377;{formatIndianNumber(result.totalPayment.toFixed(0))}
                </div>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Toggle */}
          <motion.button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full glass-card p-3 text-sm text-white/50 hover:text-white/70 transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            {showSchedule ? "Hide" : "Show"} Amortization Schedule
            <span
              className={`transition-transform duration-200 ${
                showSchedule ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </motion.button>

          {/* Amortization Table */}
          {showSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass-card p-4 overflow-hidden"
            >
              <div className="max-h-[480px] overflow-y-auto rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#1a1a2e]">
                      <th className="text-left py-2.5 px-3 text-white/40 font-semibold">
                        Month
                      </th>
                      <th className="text-right py-2.5 px-3 text-white/40 font-semibold">
                        EMI
                      </th>
                      <th className="text-right py-2.5 px-3 text-white/40 font-semibold">
                        Principal
                      </th>
                      <th className="text-right py-2.5 px-3 text-white/40 font-semibold">
                        Interest
                      </th>
                      <th className="text-right py-2.5 px-3 text-white/40 font-semibold">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.slice(0, 360).map((row, idx) => (
                      <tr
                        key={row.month}
                        className={`border-t border-white/5 transition-colors hover:bg-white/5 ${
                          idx % 2 === 0 ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <td className="py-2 px-3 text-white/60 display-number">
                          {row.month}
                        </td>
                        <td className="py-2 px-3 text-right text-white/70 display-number">
                          &#8377;{formatIndianNumber(row.emi.toFixed(0))}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400/80 display-number">
                          &#8377;{formatIndianNumber(row.principal.toFixed(0))}
                        </td>
                        <td className="py-2 px-3 text-right text-amber-400/80 display-number">
                          &#8377;{formatIndianNumber(row.interest.toFixed(0))}
                        </td>
                        <td className="py-2 px-3 text-right text-white/50 display-number">
                          &#8377;{formatIndianNumber(row.balance.toFixed(0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.schedule.length > 360 && (
                <div className="text-center text-xs text-white/30 mt-2 pt-2 border-t border-white/5">
                  Showing first 360 of {result.schedule.length} months
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
