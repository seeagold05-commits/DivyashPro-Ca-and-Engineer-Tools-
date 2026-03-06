"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { hapticFeedback, smartPaste } from "@/lib/utils";
import { useCalcStore } from "@/lib/store";

const BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

const getButtonStyle = (btn: string) => {
  if (btn === "=")
    return "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-blue-500/30";
  if (btn === "C")
    return "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border-rose-500/20";
  if (["÷", "×", "−", "+", "%", "±"].includes(btn))
    return "bg-white/8 text-blue-400 hover:bg-white/12 border-blue-500/10";
  return "bg-white/5 text-white/90 hover:bg-white/10";
};

const getHaptic = (btn: string): "light" | "medium" | "heavy" => {
  if (btn === "=" || btn === "C") return "heavy";
  if (["÷", "×", "−", "+"].includes(btn)) return "medium";
  return "light";
};

export function StandardCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [lastResult, setLastResult] = useState(false);
  const { addHistory, addAuditEntry } = useCalcStore();

  const handleButton = useCallback(
    (btn: string) => {
      hapticFeedback(getHaptic(btn));

      switch (btn) {
        case "C":
          setDisplay("0");
          setExpression("");
          setLastResult(false);
          break;

        case "⌫":
          setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
          break;

        case "±":
          setDisplay((prev) =>
            prev.startsWith("-") ? prev.slice(1) : `-${prev}`
          );
          break;

        case "%":
          setDisplay((prev) => String(parseFloat(prev) / 100));
          break;

        case "=": {
          try {
            const expr = expression + display;
            const sanitized = expr
              .replace(/×/g, "*")
              .replace(/÷/g, "/")
              .replace(/−/g, "-");

            // Safe evaluation with Function constructor (no eval)
            const fn = new Function(`"use strict"; return (${sanitized})`);
            const result = fn();
            const resultStr = String(Number(result.toFixed(10)));

            addHistory({
              expression: expr,
              result: resultStr,
              mode: "standard",
            });
            addAuditEntry({
              expression: expr,
              result: resultStr,
              mode: "standard",
              editable: true,
            });

            setDisplay(resultStr);
            setExpression("");
            setLastResult(true);
          } catch {
            setDisplay("Error");
            setTimeout(() => setDisplay("0"), 1500);
          }
          break;
        }

        case "÷":
        case "×":
        case "−":
        case "+":
          setExpression((prev) => prev + display + btn);
          setDisplay("0");
          setLastResult(false);
          break;

        default:
          // Number or decimal
          if (lastResult) {
            setDisplay(btn);
            setLastResult(false);
          } else {
            setDisplay((prev) => (prev === "0" && btn !== "." ? btn : prev + btn));
          }
          break;
      }
    },
    [display, expression, lastResult, addHistory, addAuditEntry]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const cleaned = smartPaste(e.clipboardData.getData("text"));
    if (cleaned) setDisplay(cleaned);
  }, []);

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-lg">
            ⊞
          </span>
          Calculator
        </h2>
      </div>

      {/* Display */}
      <div className="glass-card p-6" onPaste={handlePaste}>
        {expression && (
          <p className="text-right text-sm text-white/30 mb-1 display-number truncate">
            {expression}
          </p>
        )}
        <p className="text-right text-4xl font-bold text-white/95 display-number truncate">
          {display}
        </p>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.flat().map((btn, i) => (
          <motion.button
            key={`${btn}-${i}`}
            onClick={() => handleButton(btn)}
            className={`
              ${btn === "0" ? "col-span-1" : ""}
              h-16 rounded-xl border border-white/10 text-lg font-semibold
              transition-all duration-150 ${getButtonStyle(btn)}
            `}
            whileTap={{ scale: 0.93 }}
          >
            {btn}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
