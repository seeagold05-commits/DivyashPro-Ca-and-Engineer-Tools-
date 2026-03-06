import Decimal from "decimal.js";
import type { EMIInput, EMIResult, EMIScheduleEntry } from "@/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

/**
 * EMI Calculation using the standard formula:
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * Where:
 *   P = Principal loan amount
 *   r = Monthly interest rate (annual rate / 12 / 100)
 *   n = Tenure in months
 */
export function calculateEMI(input: EMIInput): EMIResult {
  const P = new Decimal(input.principal || "0");
  const annualRate = new Decimal(input.annualRate || "0");
  const n = parseInt(input.tenureMonths || "0");

  if (P.lte(0) || n <= 0) {
    return {
      emi: new Decimal(0),
      totalPayment: new Decimal(0),
      totalInterest: new Decimal(0),
      principal: P,
      schedule: [],
    };
  }

  // If 0% interest
  if (annualRate.lte(0)) {
    const emi = P.div(n);
    const schedule: EMIScheduleEntry[] = [];
    let balance = P;
    for (let month = 1; month <= n; month++) {
      balance = balance.minus(emi);
      schedule.push({
        month,
        emi,
        principal: emi,
        interest: new Decimal(0),
        balance: Decimal.max(balance, 0),
      });
    }
    return {
      emi,
      totalPayment: P,
      totalInterest: new Decimal(0),
      principal: P,
      schedule,
    };
  }

  const r = annualRate.div(12).div(100);
  const onePlusR = r.plus(1);
  const onePlusRN = onePlusR.pow(n);

  // EMI = P × r × (1+r)^n / ((1+r)^n - 1)
  const emi = P.mul(r).mul(onePlusRN).div(onePlusRN.minus(1));
  const totalPayment = emi.mul(n);
  const totalInterest = totalPayment.minus(P);

  // Generate amortization schedule
  const schedule: EMIScheduleEntry[] = [];
  let balance = P;

  for (let month = 1; month <= n; month++) {
    const interestComponent = balance.mul(r);
    const principalComponent = emi.minus(interestComponent);
    balance = balance.minus(principalComponent);

    schedule.push({
      month,
      emi,
      principal: principalComponent,
      interest: interestComponent,
      balance: Decimal.max(balance, 0),
    });
  }

  return {
    emi,
    totalPayment,
    totalInterest,
    principal: P,
    schedule,
  };
}
