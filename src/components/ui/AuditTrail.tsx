"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useCalcStore } from "@/lib/store";
import { formatIndianNumber } from "@/lib/utils";

export function AuditTrail() {
  const { auditTrail, clearAuditTrail, toggleAuditTrail, updateAuditEntry } = useCalcStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [auditTrail.length]);

  const handleEdit = (id: string, currentExpression: string) => {
    setEditingId(id);
    setEditValue(currentExpression);
  };

  const handleSaveEdit = (id: string) => {
    try {
      const fn = new Function(`"use strict"; return (${editValue});`);
      const result = fn();
      updateAuditEntry(id, { expression: editValue, result: String(result) });
    } catch {
      updateAuditEntry(id, { expression: editValue, result: "Error" });
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") handleSaveEdit(id);
    if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
  };

  const runningTotal = auditTrail.reduce((sum, entry) => {
    const val = parseFloat(entry.result);
    return isNaN(val) ? sum : sum + val;
  }, 0);

  return (
    <div className="glass-card h-[calc(100vh-12rem)] flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/70">Audit Paper Tape</h3>
          <p className="text-[10px] text-white/30">{auditTrail.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearAuditTrail}
            className="text-xs text-white/30 hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10">
            Clear
          </button>
          <button onClick={toggleAuditTrail}
            className="text-xs text-white/30 hover:text-white/60 transition-colors w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5">
            ✕
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto audit-tape p-4 space-y-1">
        {auditTrail.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-xs text-white/20 mb-1">Calculations will appear here</p>
            <p className="text-[10px] text-white/15">Tap any entry to edit & recalculate</p>
          </div>
        ) : (
          auditTrail.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`group py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                editingId === entry.id ? "bg-white/10 ring-1" : "hover:bg-white/5"
              }`}
              style={editingId === entry.id ? { borderColor: "var(--accent)" } : {}}
              onClick={() => editingId !== entry.id && handleEdit(entry.id, entry.expression)}
            >
              {editingId === entry.id ? (
                <div className="space-y-2">
                  <input autoFocus className="glass-input text-sm display-number py-2"
                    value={editValue} onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, entry.id)} placeholder="Edit expression..." />
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(entry.id); }}
                      className="text-[10px] px-2 py-1 rounded-md font-medium"
                      style={{ background: "var(--accent)", color: "#000" }}>Save ↵</button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                      className="text-[10px] text-white/40 px-2 py-1 rounded-md hover:bg-white/5">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40 display-number truncate">{entry.expression}</p>
                    <p className="text-sm font-semibold text-white/80 display-number">= {entry.result}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/15 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                    <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Running Total</p>
          <p className="text-sm font-bold display-number" style={{ color: "var(--accent)" }}>
            ₹{formatIndianNumber(runningTotal.toFixed(2))}
          </p>
        </div>
      </div>
    </div>
  );
}
