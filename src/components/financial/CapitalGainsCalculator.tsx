"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { calculateCapitalGains } from "@/lib/capital-gains-engine";
import { formatIndianNumber } from "@/lib/utils";
import type { CapitalGainsInput, CapitalGainsResult } from "@/types";

const ASSET_TYPES: { id: CapitalGainsInput["assetType"]; label: string }[] = [
  { id: "equity", label: "Equity / MF" },
  { id: "debt", label: "Debt / Bonds" },
  { id: "property", label: "Property" },
];

const YEARS = Array.from({ length: 26 }, (_, i) => String(2001 + i));

export function CapitalGainsCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("2015");
  const [saleYear, setSaleYear] = useState("2025");
  const [assetType, setAssetType] = useState<CapitalGainsInput["assetType"]>("equity");
  const [result, setResult] = useState<CapitalGainsResult | null>(null);

  const handleCalculate = useCallback(() => {
    if (!purchasePrice || !salePrice || isNaN(Number(purchasePrice)) || isNaN(Number(salePrice)))
      return;
    const res = calculateCapitalGains({
      purchasePrice,
      salePrice,
      purchaseYear,
      saleYear,
      assetType,
    });
    setResult(res);
  }, [purchasePrice, salePrice, purchaseYear, saleYear, assetType]);

  const holdingLabel = useMemo(() => {
    if (!result) return "";
    const months = result.holdingPeriod;
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y > 0 && m > 0) return `${y}y ${m}m`;
    if (y > 0) return `${y} year${y > 1 ? "s" : ""}`;
    return `${m} month${m > 1 ? "s" : ""}`;
  }, [result]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg">
            CG
          </span>
          Capital Gains Calculator
        </h2>
        <p className="mt-1 text-sm text-white/40">
          STCG / LTCG with CII indexation — Equity, Debt, Property
        </p>
      </div>

      {/* Asset Type Toggle */}
      <div className="glass-card p-1 inline-flex rounded-xl">
        {ASSET_TYPES.map((at) => (
          <button
            key={at.id}
            onClick={() => {
              setAssetType(at.id);
              setResult(null);
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              assetType === at.id
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {at.label}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Price */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Purchase Price (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 500000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Sale Price (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 800000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>

          {/* Purchase Year */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Purchase Year (FY)</label>
            <select
              value={purchaseYear}
              onChange={(e) => {
                setPurchaseYear(e.target.value);
                setResult(null);
              }}
              className="glass-input w-full cursor-pointer"
            >
              {YEARS.map((yr) => (
                <option key={yr} value={yr} className="bg-[#1a1a2e] text-white">
                  FY {yr}-{String(Number(yr) + 1).slice(-2)}
                </option>
              ))}
            </select>
          </div>

          {/* Sale Year */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Sale Year (FY)</label>
            <select
              value={saleYear}
              onChange={(e) => {
                setSaleYear(e.target.value);
                setResult(null);
              }}
              className="glass-input w-full cursor-pointer"
            >
              {YEARS.map((yr) => (
                <option key={yr} value={yr} className="bg-[#1a1a2e] text-white">
                  FY {yr}-{String(Number(yr) + 1).slice(-2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <motion.button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-shadow"
          whileTap={{ scale: 0.97 }}
        >
          Calculate Capital Gains
        </motion.button>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          {/* STCG / LTCG Badge + Holding Period */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Capital Gains Result
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 display-number">
                {holdingLabel}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                  result.gainType === "LTCG"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}
              >
                {result.gainType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Purchase Price</div>
              <div className="text-lg font-bold display-number text-white/90">
                &#8377;{formatIndianNumber(result.purchasePrice.toFixed(2))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Sale Price</div>
              <div className="text-lg font-bold display-number text-white/90">
                &#8377;{formatIndianNumber(result.salePrice.toFixed(2))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">
                {result.indexedCost.eq(result.purchasePrice)
                  ? "Cost (No Indexation)"
                  : "Indexed Cost (CII)"}
              </div>
              <div className="text-lg font-bold display-number text-blue-400">
                &#8377;{formatIndianNumber(result.indexedCost.toFixed(2))}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl ${
                result.capitalGain.gte(0)
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-rose-500/10 border border-rose-500/20"
              }`}
            >
              <div className="text-xs text-white/40 mb-1">Capital Gain</div>
              <div
                className={`text-lg font-bold display-number ${
                  result.capitalGain.gte(0) ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                &#8377;{formatIndianNumber(result.capitalGain.toFixed(2))}
              </div>
            </div>
          </div>

          {/* Tax Info */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Tax Rate ({result.gainType})</div>
              <div className="text-lg font-bold display-number text-amber-400">
                {result.taxRate}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xs text-white/40 mb-1">Tax Payable</div>
              <div className="text-lg font-bold display-number text-rose-400">
                &#8377;{formatIndianNumber(result.taxAmount.toFixed(2))}
              </div>
            </div>
          </div>

          {/* Holding Period Info */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Holding period: {holdingLabel} (
              {assetType === "equity"
                ? "Equity: >12m = LTCG"
                : assetType === "debt"
                ? "Debt: >36m = LTCG"
                : "Property: >24m = LTCG"}
              )
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
