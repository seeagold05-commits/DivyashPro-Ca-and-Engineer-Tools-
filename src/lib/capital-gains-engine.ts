import Decimal from "decimal.js";
import type { CapitalGainsInput, CapitalGainsResult } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

// CII (Cost Inflation Index) — FY base year 2001-02 = 100
const CII: Record<string, number> = {
  "2001": 100, "2002": 105, "2003": 109, "2004": 113,
  "2005": 117, "2006": 122, "2007": 129, "2008": 137,
  "2009": 148, "2010": 167, "2011": 184, "2012": 200,
  "2013": 220, "2014": 240, "2015": 254, "2016": 264,
  "2017": 272, "2018": 280, "2019": 289, "2020": 301,
  "2021": 317, "2022": 331, "2023": 348, "2024": 363,
  "2025": 377, "2026": 390,
};

function getHoldingThreshold(assetType: CapitalGainsInput["assetType"]): number {
  switch (assetType) {
    case "equity": return 12;
    case "debt": return 36;
    case "property": return 24;
  }
}

function getTaxRate(gainType: "STCG" | "LTCG", assetType: CapitalGainsInput["assetType"]): number {
  if (gainType === "STCG") {
    return assetType === "equity" ? 20 : 30;
  }
  return assetType === "equity" ? 12.5 : 20;
}

export function calculateCapitalGains(input: CapitalGainsInput): CapitalGainsResult {
  const purchasePrice = new Decimal(input.purchasePrice || "0");
  const salePrice = new Decimal(input.salePrice || "0");
  const purchaseYear = input.purchaseYear;
  const saleYear = input.saleYear;

  const holdingPeriod = (parseInt(saleYear) - parseInt(purchaseYear)) * 12;
  const threshold = getHoldingThreshold(input.assetType);
  const gainType: "STCG" | "LTCG" = holdingPeriod >= threshold ? "LTCG" : "STCG";

  let indexedCost = purchasePrice;

  if (gainType === "LTCG" && input.assetType !== "equity") {
    const ciiPurchase = CII[purchaseYear] || 100;
    const ciiSale = CII[saleYear] || 390;
    indexedCost = purchasePrice.mul(ciiSale).div(ciiPurchase);
  }

  const capitalGain = salePrice.minus(indexedCost);
  const taxRate = getTaxRate(gainType, input.assetType);
  const taxAmount = capitalGain.gt(0)
    ? capitalGain.mul(taxRate).div(100)
    : new Decimal(0);

  return {
    purchasePrice,
    salePrice,
    indexedCost,
    capitalGain,
    taxRate,
    taxAmount,
    gainType,
    holdingPeriod,
  };
}

export { CII };
