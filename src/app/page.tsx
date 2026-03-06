"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { MasterDashboard } from "@/components/dashboard/MasterDashboard";
import { GSTCalculator } from "@/components/financial/GSTCalculator";
import { TaxCalculator } from "@/components/financial/TaxCalculator";
import { ShareCalculator } from "@/components/financial/ShareCalculator";
import { AuditTrail } from "@/components/ui/AuditTrail";
import { StandardCalculator } from "@/components/calculator/StandardCalculator";
import { useCalcStore } from "@/lib/store";

// ─── Dynamic imports for tree-shaking per persona ────────────────
// CA-only modules
const TDSCalculator = dynamic(() => import("@/components/financial/TDSCalculator").then(m => ({ default: m.TDSCalculator })), { ssr: false });
const GratuityCalculator = dynamic(() => import("@/components/financial/GratuityCalculator").then(m => ({ default: m.GratuityCalculator })), { ssr: false });
const CapitalGainsCalculator = dynamic(() => import("@/components/financial/CapitalGainsCalculator").then(m => ({ default: m.CapitalGainsCalculator })), { ssr: false });
const EMICalculator = dynamic(() => import("@/components/financial/EMICalculator").then(m => ({ default: m.EMICalculator })), { ssr: false });
const InventoryMIS = dynamic(() => import("@/components/financial/InventoryMIS").then(m => ({ default: m.InventoryMIS })), { ssr: false });
const GTMemory = dynamic(() => import("@/components/financial/GTMemory").then(m => ({ default: m.GTMemory })), { ssr: false });

// Tools modules
const CompressPDF = dynamic(() => import("@/components/tools/CompressPDF").then(m => ({ default: m.CompressPDF })), { ssr: false });
const MergePDF = dynamic(() => import("@/components/tools/MergePDF").then(m => ({ default: m.MergePDF })), { ssr: false });
const WordToPDF = dynamic(() => import("@/components/tools/WordToPDF").then(m => ({ default: m.WordToPDF })), { ssr: false });
const PDFToWord = dynamic(() => import("@/components/tools/PDFToWord").then(m => ({ default: m.PDFToWord })), { ssr: false });
const ExcelToPDF = dynamic(() => import("@/components/tools/ExcelToPDF").then(m => ({ default: m.ExcelToPDF })), { ssr: false });
const PDFToExcel = dynamic(() => import("@/components/tools/PDFToExcel").then(m => ({ default: m.PDFToExcel })), { ssr: false });
const CompressImage = dynamic(() => import("@/components/tools/CompressImage").then(m => ({ default: m.CompressImage })), { ssr: false });
const UnlockPDF = dynamic(() => import("@/components/tools/UnlockPDF").then(m => ({ default: m.UnlockPDF })), { ssr: false });
const ProtectPDF = dynamic(() => import("@/components/tools/ProtectPDF").then(m => ({ default: m.ProtectPDF })), { ssr: false });

// ─── Module routing map ──────────────────────────────────────────
const moduleMap: Record<string, React.ComponentType> = {
  // CA Modules
  gst: GSTCalculator,
  "income-tax": TaxCalculator,
  "audit-tape": AuditTrail,
  "tds-tcs": TDSCalculator,
  gratuity: GratuityCalculator,
  "capital-gains": CapitalGainsCalculator,
  emi: EMICalculator,
  "share-market": ShareCalculator,
  inventory: InventoryMIS,
  "gt-memory": GTMemory,
  calculator: StandardCalculator,

  // Tools Modules
  "compress-pdf": CompressPDF,
  "merge-pdf": MergePDF,
  "word-to-pdf": WordToPDF,
  "pdf-to-word": PDFToWord,
  "excel-to-pdf": ExcelToPDF,
  "pdf-to-excel": PDFToExcel,
  "compress-image": CompressImage,
  "unlock-pdf": UnlockPDF,
  "protect-pdf": ProtectPDF,
};

export default function Home() {
  const { persona, setPersona, activeModule, setActiveModule, showAuditTrail } = useCalcStore();

  // Apply persona data attribute to document for CSS theming
  useEffect(() => {
    document.documentElement.setAttribute("data-persona", persona);
  }, [persona]);

  const ActiveComponent = activeModule ? moduleMap[activeModule] : null;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      {/* ─── Header ────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="gradient-text">Divyash</span>{" "}
              <span className="text-white/90">Pro</span>
            </h1>
            <p className="mt-1 text-sm text-white/40 tracking-wide">
              {persona === "ca" ? "Finance & Audit Intelligence" : "PDF & Office Utility Suite"}
            </p>
          </div>

          {/* ─── Persona Toggle ─────────────────────────────── */}
          <div className="persona-toggle">
            <div className="persona-toggle-slider" data-active={persona} />
            <div className="flex h-full">
              <button
                onClick={() => setPersona("ca")}
                className={`persona-toggle-label ${persona === "ca" ? "text-white" : "text-white/40"}`}
              >
                CA Tools
              </button>
              <button
                onClick={() => setPersona("tools")}
                className={`persona-toggle-label ${persona === "tools" ? "text-white" : "text-white/40"}`}
              >
                Engineer Tools
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl flex gap-6">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {ActiveComponent ? (
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Back Button */}
                <motion.button
                  onClick={() => setActiveModule(null)}
                  className="glass-button mb-6 flex items-center gap-2 text-sm text-white/70 hover:text-white"
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Dashboard
                </motion.button>
                <ActiveComponent />
              </motion.div>
            ) : (
              <motion.div
                key={`dashboard-${persona}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MasterDashboard onModuleClick={setActiveModule} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audit Trail Sidebar (CA mode) */}
        <AnimatePresence>
          {showAuditTrail && persona === "ca" && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block"
            >
              <AuditTrail />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
