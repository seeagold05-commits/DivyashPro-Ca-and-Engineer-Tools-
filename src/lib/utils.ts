import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianNumber(num: number | string): string {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";

  const isNegative = n < 0;
  const absStr = Math.abs(n).toFixed(2);
  const [intPart, decPart] = absStr.split(".");

  // Indian numbering: last 3 digits, then groups of 2
  let result = "";
  const len = intPart.length;

  if (len <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + "," + result;
    }
  }

  const formatted = decPart ? `${result}.${decPart}` : result;
  return isNegative ? `-${formatted}` : formatted;
}

export function smartPaste(text: string): string {
  return text
    .replace(/[₹$€£¥,\s]/g, "")    // strip currency symbols and commas
    .replace(/[^\d.\-+*/()]/g, "")   // keep only math-valid characters
    .trim();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function hapticFeedback(intensity: "light" | "medium" | "heavy") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const durations = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(durations[intensity]);
  }
}
