"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

export function ExcelToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    setResultBlob(null);

    try {
      const XLSX = await import("xlsx");
      const { jsPDF } = await import("jspdf");

      const arrayBuffer = await files[0].arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      if (data.length === 0) {
        setProcessing(false);
        return;
      }

      const isLandscape = orientation === "landscape";
      const doc = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "mm", format: "a4" });

      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;
      const marginLeft = 10;
      const marginTop = 15;
      const marginRight = 10;
      const marginBottom = 10;
      const usableWidth = pageWidth - marginLeft - marginRight;

      const maxCols = Math.max(...data.map((r) => r.length));
      const colWidth = usableWidth / maxCols;
      const rowHeight = 7;
      const fontSize = Math.min(8, Math.max(5, colWidth * 0.4));

      doc.setFontSize(fontSize);

      let y = marginTop;

      for (let ri = 0; ri < data.length; ri++) {
        if (y + rowHeight > pageHeight - marginBottom) {
          doc.addPage();
          y = marginTop;
        }

        const row = data[ri];
        const isHeader = ri === 0;

        for (let ci = 0; ci < maxCols; ci++) {
          const x = marginLeft + ci * colWidth;
          const cellText = String(row[ci] ?? "");

          // Cell border
          doc.setDrawColor(180, 180, 180);
          doc.rect(x, y, colWidth, rowHeight);

          // Header bg
          if (isHeader) {
            doc.setFillColor(60, 60, 80);
            doc.rect(x, y, colWidth, rowHeight, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
          } else {
            if (ri % 2 === 0) {
              doc.setFillColor(245, 245, 250);
              doc.rect(x, y, colWidth, rowHeight, "F");
            }
            doc.setTextColor(30, 30, 30);
            doc.setFont("helvetica", "normal");
          }

          // Draw border again on top of fill
          doc.setDrawColor(180, 180, 180);
          doc.rect(x, y, colWidth, rowHeight);

          // Clip text
          const maxTextWidth = colWidth - 2;
          let displayText = cellText;
          while (doc.getTextWidth(displayText) > maxTextWidth && displayText.length > 0) {
            displayText = displayText.slice(0, -1);
          }

          doc.text(displayText, x + 1, y + rowHeight * 0.7);
        }

        y += rowHeight;
      }

      const pdfBlob = doc.output("blob");
      setResultBlob(pdfBlob);
      setDone(true);
    } catch (err) {
      console.error("Excel to PDF conversion failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const originalName = files[0]?.name.replace(/\.[^.]+$/, "") || "spreadsheet";
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${originalName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ background: "var(--accent-gradient)" }}
        >
          📊
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Excel to PDF</h2>
          <p className="text-xs text-white/40">Convert spreadsheets to PDF — ideal for CA reports &amp; balance sheets</p>
        </div>
      </div>

      <FileUploadZone
        accept=".xls,.xlsx,.csv"
        label="Upload Excel or CSV file"
        sublabel="Supports .xls, .xlsx, and .csv formats"
        icon={<span>📊</span>}
        onFilesSelected={(f) => { setFiles(f); setDone(false); setResultBlob(null); }}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-white/60">Page Orientation</p>
        <div className="grid grid-cols-2 gap-3">
          {(["portrait", "landscape"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrientation(o)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                orientation === o
                  ? "border-[var(--accent)] bg-[var(--accent-glow-soft)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${o === "portrait" ? "w-6 h-8" : "w-8 h-6"} rounded border border-current opacity-40`} />
                <p className={`text-sm font-semibold capitalize ${orientation === o ? "text-[var(--accent)]" : "text-white/70"}`}>
                  {o}
                </p>
              </div>
              <p className="text-xs text-white/30 mt-1">
                {o === "portrait" ? "Best for single-column reports" : "Best for wide balance sheets"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
        <p className="text-sm font-medium text-white/50">CA-Optimized Output</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Auto-fit columns</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Gridlines included</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Print-ready margins</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleProcess}
          disabled={files.length === 0 || processing}
          className="accent-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to PDF"
          )}
        </button>

        {done && resultBlob && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={downloadResult}
            className="glass-button flex items-center gap-2 text-sm text-emerald-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </motion.button>
        )}
      </div>

      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Rendering spreadsheet to PDF...</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent-gradient)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
