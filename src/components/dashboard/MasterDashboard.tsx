"use client";

import { motion } from "framer-motion";
import { useCalcStore } from "@/lib/store";
import type { DashboardModule } from "@/types";

const CA_MODULES: DashboardModule[] = [
  { id: "gst", title: "Smart GST Pro", description: "Forward, reverse & multi-slab GST comparison", icon: "₹", color: "from-emerald-500/20 to-emerald-600/10", gradient: "from-emerald-400 to-emerald-600", route: "/gst", badge: "GST" },
  { id: "income-tax", title: "2026 Tax Planner", description: "AY 2026-27 slabs — Old vs New regime", icon: "📊", color: "from-amber-500/20 to-amber-600/10", gradient: "from-amber-400 to-amber-600", route: "/tax", badge: "AY 26-27" },
  { id: "audit-tape", title: "Audit Paper Tape", description: "Scrollable history with in-line editing", icon: "📜", color: "from-teal-500/20 to-teal-600/10", gradient: "from-teal-400 to-teal-600", route: "/audit" },
  { id: "tds-tcs", title: "TDS/TCS Helper", description: "Section-wise rates with auto-calculation", icon: "📋", color: "from-sky-500/20 to-sky-600/10", gradient: "from-sky-400 to-sky-600", route: "/tds" },
  { id: "gratuity", title: "Gratuity Solver", description: "(15 × Salary × Years) / 26", icon: "🏦", color: "from-violet-500/20 to-violet-600/10", gradient: "from-violet-400 to-violet-600", route: "/gratuity" },
  { id: "capital-gains", title: "Capital Gains", description: "Indexed cost & LTCG/STCG tax", icon: "📈", color: "from-cyan-500/20 to-cyan-600/10", gradient: "from-cyan-400 to-cyan-600", route: "/capital-gains" },
  { id: "emi", title: "EMI & Amortization", description: "Monthly breakdown with P vs I charts", icon: "🏠", color: "from-rose-500/20 to-rose-600/10", gradient: "from-rose-400 to-rose-600", route: "/emi" },
  { id: "share-market", title: "Share Market", description: "Break-even with brokerage, STT & SEBI", icon: "📉", color: "from-indigo-500/20 to-indigo-600/10", gradient: "from-indigo-400 to-indigo-600", route: "/shares" },
  { id: "inventory", title: "Inventory MIS", description: "COGS, Stock Turnover & Gross Profit", icon: "📦", color: "from-orange-500/20 to-orange-600/10", gradient: "from-orange-400 to-orange-600", route: "/inventory" },
  { id: "gt-memory", title: "Grand Total Memory", description: "Sum multiple separate calculations", icon: "Σ", color: "from-lime-500/20 to-lime-600/10", gradient: "from-lime-400 to-lime-600", route: "/gt" },
];

const TOOLS_MODULES: DashboardModule[] = [
  { id: "compress-pdf", title: "Compress PDF", description: "Reduce PDF size with adjustable quality", icon: "📦", color: "from-amber-500/20 to-amber-600/10", gradient: "from-amber-400 to-amber-600", route: "/compress-pdf" },
  { id: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDFs into one document", icon: "📑", color: "from-orange-500/20 to-orange-600/10", gradient: "from-orange-400 to-orange-600", route: "/merge-pdf" },
  { id: "word-to-pdf", title: "Word to PDF", description: "Convert .doc/.docx to PDF format", icon: "📝", color: "from-blue-500/20 to-blue-600/10", gradient: "from-blue-400 to-blue-600", route: "/word-to-pdf" },
  { id: "pdf-to-word", title: "PDF to Word", description: "Convert PDF to editable .docx", icon: "📄", color: "from-indigo-500/20 to-indigo-600/10", gradient: "from-indigo-400 to-indigo-600", route: "/pdf-to-word" },
  { id: "excel-to-pdf", title: "Excel to PDF", description: "Spreadsheets to PDF — CA reports ready", icon: "📊", color: "from-emerald-500/20 to-emerald-600/10", gradient: "from-emerald-400 to-emerald-600", route: "/excel-to-pdf" },
  { id: "pdf-to-excel", title: "PDF to Excel", description: "Extract tables into editable spreadsheets", icon: "📋", color: "from-teal-500/20 to-teal-600/10", gradient: "from-teal-400 to-teal-600", route: "/pdf-to-excel" },
  { id: "compress-image", title: "Compress Image", description: "Reduce image size with adjustable quality & format", icon: "🖼️", color: "from-pink-500/20 to-pink-600/10", gradient: "from-pink-400 to-pink-600", route: "/compress-image" },
  { id: "unlock-pdf", title: "Unlock PDF", description: "Remove password protection from PDF files", icon: "🔓", color: "from-yellow-500/20 to-yellow-600/10", gradient: "from-yellow-400 to-yellow-600", route: "/unlock-pdf" },
  { id: "protect-pdf", title: "Protect PDF", description: "Add password encryption & set permissions", icon: "🔒", color: "from-red-500/20 to-red-600/10", gradient: "from-red-400 to-red-600", route: "/protect-pdf" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

interface Props {
  onModuleClick: (id: string) => void;
}

export function MasterDashboard({ onModuleClick }: Props) {
  const { persona } = useCalcStore();
  const modules = persona === "ca" ? CA_MODULES : TOOLS_MODULES;
  const modeLabel = persona === "ca" ? "Chartered Accountant" : "Utility Tools";
  const moduleCount = modules.length;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white/80 tracking-wide">
          {modeLabel} Modules
        </h2>
        <p className="text-sm text-white/40">
          {moduleCount} professional tools — select to begin
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={persona}
      >
        {modules.map((mod) => (
          <motion.button
            key={mod.id}
            variants={cardVariants}
            onClick={() => onModuleClick(mod.id)}
            className="glass-card-hover group relative p-6 text-left cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {mod.badge && (
              <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                {mod.badge}
              </span>
            )}

            <div className={`absolute -top-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br ${mod.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${mod.gradient} text-white text-xl font-bold shadow-lg mb-4`}>
              {mod.icon}
            </div>

            <h3 className="relative text-base font-semibold text-white/90 mb-1">{mod.title}</h3>
            <p className="relative text-sm text-white/40 leading-relaxed">{mod.description}</p>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 glass-card p-4 flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
          <span className="text-sm text-white/50">
            Precision: <span className="font-medium" style={{ color: "var(--accent)" }}>
              {persona === "ca" ? "Decimal.js" : "PDF Engine"} Active
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-sm text-white/50">
            Mode: <span className="text-blue-400 font-medium">Offline-First</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-sm text-white/50">
            {moduleCount} Modules Ready
          </span>
        </div>
      </motion.div>
    </section>
  );
}
