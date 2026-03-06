"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCalcStore } from "@/lib/store";
import { formatIndianNumber } from "@/lib/utils";

export function GTMemory() {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const { gtMemory, addToGTMemory, removeFromGTMemory, clearGTMemory, getGTTotal } =
    useCalcStore();

  const handleAdd = () => {
    if (!value || isNaN(Number(value))) return;
    addToGTMemory(label || `Item ${gtMemory.length + 1}`, value);
    setLabel("");
    setValue("");
  };

  const total = getGTTotal();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold">
            GT
          </span>
          Grand Total Memory
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Accumulate values from multiple calculations into a running total
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Label Input */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. GST on Invoice #42"
              className="glass-input"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Value (&#8377;)</label>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9.\-]/g, ""))}
              placeholder="e.g. 15000"
              className="glass-input display-number"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
        </div>

        {/* Add Button */}
        <motion.button
          onClick={handleAdd}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-shadow"
          whileTap={{ scale: 0.97 }}
        >
          Add to GT
        </motion.button>
      </div>

      {/* Memory Entries List */}
      {gtMemory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              GT Memory Entries ({gtMemory.length})
            </h3>
            <motion.button
              onClick={clearGTMemory}
              className="text-xs px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              Clear All
            </motion.button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {gtMemory.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70 truncate">
                    {entry.label}
                  </div>
                  <div className="text-xs text-white/30">
                    #{idx + 1}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold display-number text-emerald-400">
                    &#8377;{formatIndianNumber(entry.value.toFixed(2))}
                  </span>
                  <motion.button
                    onClick={() => removeFromGTMemory(entry.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    whileTap={{ scale: 0.9 }}
                  >
                    x
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t border-white/10">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">
                Grand Total
              </div>
              <div className="text-3xl font-bold display-number text-emerald-400">
                &#8377;{formatIndianNumber(total.toFixed(2))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {gtMemory.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <div className="text-white/20 text-4xl mb-3">GT</div>
          <p className="text-sm text-white/30">
            No entries yet. Add values to build your grand total.
          </p>
        </motion.div>
      )}
    </div>
  );
}
