import Decimal from "decimal.js";
import type { ShareInput, ShareResult } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

// Default Indian equity delivery charges
const DEFAULTS = {
  brokeragePercent: "0.03",    // Flat ₹20 or 0.03%, whichever is lower (Zerodha-style)
  sttPercent: "0.1",           // STT on delivery: 0.1% on buy + sell
  transactionChargePercent: "0.00345", // NSE transaction charge
  gstOnBrokerage: "18",       // GST on brokerage + transaction charges
  sebiChargePercent: "0.0001", // SEBI turnover fee
  stampDutyPercent: "0.015",   // Stamp duty on buy side
};

export function calculateBreakEven(input: ShareInput): ShareResult {
  const buyPrice = new Decimal(input.buyPrice || "0");
  const quantity = new Decimal(input.quantity || "1");
  const hundred = new Decimal(100);

  const brokerageRate = new Decimal(input.brokeragePercent || DEFAULTS.brokeragePercent);
  const sttRate = new Decimal(input.sttPercent || DEFAULTS.sttPercent);
  const txnRate = new Decimal(input.transactionChargePercent || DEFAULTS.transactionChargePercent);
  const gstRate = new Decimal(input.gstOnBrokerage || DEFAULTS.gstOnBrokerage);
  const sebiRate = new Decimal(input.sebiChargePercent || DEFAULTS.sebiChargePercent);
  const stampRate = new Decimal(input.stampDutyPercent || DEFAULTS.stampDutyPercent);

  const turnover = buyPrice.mul(quantity);

  // Buy-side charges
  const brokerage = turnover.mul(brokerageRate).div(hundred);
  const stt = turnover.mul(sttRate).div(hundred);
  const transactionCharge = turnover.mul(txnRate).div(hundred);
  const gst = brokerage.plus(transactionCharge).mul(gstRate).div(hundred);
  const sebiCharge = turnover.mul(sebiRate).div(hundred);
  const stampDuty = turnover.mul(stampRate).div(hundred);

  // Total charges for buy side
  const buyCharges = brokerage
    .plus(stt)
    .plus(transactionCharge)
    .plus(gst)
    .plus(sebiCharge)
    .plus(stampDuty);

  // Sell-side charges are approximately equal (slightly different STT)
  const sellCharges = buyCharges;

  const totalCharges = buyCharges.plus(sellCharges);
  const totalBuyCost = turnover.plus(buyCharges);

  // Break-even = (Total cost including all buy+sell charges) / quantity
  const breakEvenPrice = turnover.plus(totalCharges).div(quantity);

  return {
    buyPrice,
    totalBuyCost,
    breakEvenPrice,
    charges: {
      brokerage: brokerage.mul(2),
      stt: stt.mul(2),
      transactionCharge: transactionCharge.mul(2),
      gst: gst.mul(2),
      sebiCharge: sebiCharge.mul(2),
      stampDuty,
      totalCharges,
    },
  };
}
