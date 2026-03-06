import { create } from "zustand";
import type {
  Persona,
  CalculatorMode,
  HistoryEntry,
  AuditEntry,
  GSTResult,
  TaxResult,
  GTMemoryEntry,
} from "@/types";
import Decimal from "decimal.js";
import { generateId } from "./utils";

// ─── localStorage helpers ────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Store Interface ─────────────────────────────────────────────
interface CalcState {
  // Persona toggle
  persona: Persona;
  setPersona: (p: Persona) => void;

  // Current mode
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;

  // Display
  display: string;
  expression: string;
  setDisplay: (val: string) => void;
  setExpression: (val: string) => void;

  // History
  history: HistoryEntry[];
  addHistory: (entry: Omit<HistoryEntry, "id" | "timestamp" | "isFavorite">) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;

  // Audit Trail (CA mode — editable paper tape)
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  updateAuditEntry: (id: string, updates: Partial<Pick<AuditEntry, "expression" | "result">>) => void;
  clearAuditTrail: () => void;

  // GST state
  lastGSTResult: GSTResult | null;
  setLastGSTResult: (r: GSTResult | null) => void;

  // Tax state
  lastTaxResult: { old: TaxResult; new: TaxResult } | null;
  setLastTaxResult: (r: { old: TaxResult; new: TaxResult } | null) => void;

  // GT Memory (CA mode — sum multiple results)
  gtMemory: GTMemoryEntry[];
  addToGTMemory: (label: string, value: string) => void;
  removeFromGTMemory: (id: string) => void;
  clearGTMemory: () => void;
  getGTTotal: () => Decimal;

  // UI state
  showAuditTrail: boolean;
  toggleAuditTrail: () => void;
  activeModule: string | null;
  setActiveModule: (id: string | null) => void;
}

export const useCalcStore = create<CalcState>((set, get) => ({
  // ─── Persona ───────────────────────────────────────────────
  persona: loadFromStorage<Persona>("pawan-persona", "ca"),
  setPersona: (persona) => {
    saveToStorage("pawan-persona", persona);
    set({ persona, activeModule: null });
  },

  // ─── Calculator Mode ──────────────────────────────────────
  mode: "standard",
  setMode: (mode) => set({ mode }),

  // ─── Display ──────────────────────────────────────────────
  display: "0",
  expression: "",
  setDisplay: (display) => set({ display }),
  setExpression: (expression) => set({ expression }),

  // ─── History ──────────────────────────────────────────────
  history: [],
  addHistory: (entry) =>
    set((state) => {
      const newHistory = [
        {
          ...entry,
          id: generateId(),
          timestamp: new Date(),
          isFavorite: false,
        },
        ...state.history,
      ].slice(0, 500);
      saveToStorage("pawan-history", newHistory);
      return { history: newHistory };
    }),
  toggleFavorite: (id) =>
    set((state) => ({
      history: state.history.map((h) =>
        h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
      ),
    })),
  clearHistory: () => {
    saveToStorage("pawan-history", []);
    set({ history: [] });
  },

  // ─── Audit Trail ──────────────────────────────────────────
  auditTrail: [],
  addAuditEntry: (entry) =>
    set((state) => ({
      auditTrail: [
        ...state.auditTrail,
        { ...entry, id: generateId(), timestamp: new Date() },
      ],
    })),
  updateAuditEntry: (id, updates) =>
    set((state) => ({
      auditTrail: state.auditTrail.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  clearAuditTrail: () => set({ auditTrail: [] }),

  // ─── GST State ────────────────────────────────────────────
  lastGSTResult: null,
  setLastGSTResult: (lastGSTResult) => set({ lastGSTResult }),

  // ─── Tax State ────────────────────────────────────────────
  lastTaxResult: null,
  setLastTaxResult: (lastTaxResult) => set({ lastTaxResult }),

  // ─── GT Memory ────────────────────────────────────────────
  gtMemory: [],
  addToGTMemory: (label, value) =>
    set((state) => ({
      gtMemory: [
        ...state.gtMemory,
        {
          id: generateId(),
          label,
          value: new Decimal(value || "0"),
          timestamp: new Date(),
        },
      ],
    })),
  removeFromGTMemory: (id) =>
    set((state) => ({
      gtMemory: state.gtMemory.filter((e) => e.id !== id),
    })),
  clearGTMemory: () => set({ gtMemory: [] }),
  getGTTotal: () => {
    const entries = get().gtMemory;
    return entries.reduce((sum, e) => sum.plus(e.value), new Decimal(0));
  },

  // ─── UI State ─────────────────────────────────────────────
  showAuditTrail: false,
  toggleAuditTrail: () =>
    set((state) => ({ showAuditTrail: !state.showAuditTrail })),
  activeModule: null,
  setActiveModule: (activeModule) => set({ activeModule }),
}));
