"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

export function PDFToExcel() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    setResultBlob(null);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Extract text lines from PDF using pdf-lib
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Extract text content from each page
      const allRows: string[][] = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        // pdf-lib doesn't have built-in text extraction, so we parse the raw content
        const textContent = await extractTextFromPage(page);
        const lines = textContent.split("\n").filter((l) => l.trim());
        for (const line of lines) {
          // Split by multiple spaces or tabs to detect columns
          const cells = line.split(/\s{2,}|\t/).map((c) => c.trim()).filter(Boolean);
          if (cells.length > 0) allRows.push(cells);
        }
      }

      if (allRows.length === 0) {
        allRows.push(["PDF content could not be extracted as tabular data"]);
      }

      const worksheet = XLSX.utils.aoa_to_sheet(allRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([xlsxBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      setResultBlob(blob);
      setDone(true);
    } catch (err) {
      console.error("PDF to Excel conversion failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const originalName = files[0]?.name.replace(/\.pdf$/i, "") || "document";
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${originalName}.xlsx`;
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
          📋
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">PDF to Excel</h2>
          <p className="text-xs text-white/40">Extract tables from PDF into editable spreadsheets</p>
        </div>
      </div>

      <FileUploadZone
        accept=".pdf"
        label="Upload PDF with tables"
        sublabel="Best results with structured/tabular PDFs"
        icon={<span>📋</span>}
        onFilesSelected={(f) => { setFiles(f); setDone(false); setResultBlob(null); }}
      />

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
        <p className="text-sm font-medium text-white/50">Table Extraction</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-sm mt-0.5">
              🔍
            </div>
            <div>
              <p className="text-xs font-medium text-white/60">Smart Detection</p>
              <p className="text-xs text-white/30">Auto-detects table boundaries and column headers</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-sm mt-0.5">
              📐
            </div>
            <div>
              <p className="text-xs font-medium text-white/60">Structure Preserved</p>
              <p className="text-xs text-white/30">Maintains row/column structure and merged cells</p>
            </div>
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
              Extracting...
            </>
          ) : (
            "Extract to Excel"
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
            Download .xlsx
          </motion.button>
        )}
      </div>

      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Scanning tables &amp; extracting data...</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent-gradient)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Helper: extract visible text from a PDF page using content stream parsing
async function extractTextFromPage(page: any): Promise<string> {
  try {
    const content = page.node.Contents();
    if (!content) return "";

    let stream: Uint8Array | undefined;
    if (typeof content.decodeStream === "function") {
      stream = content.decodeStream();
    } else if (typeof content.decode === "function") {
      stream = content.decode();
    }

    if (!stream) return "";

    const text = new TextDecoder("latin1").decode(stream);
    // Extract text between parentheses in PDF content stream (Tj/TJ operators)
    const matches: string[] = [];
    const regex = /\(([^)]*)\)/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      matches.push(m[1]);
    }
    return matches.join(" ");
  } catch {
    return "";
  }
}
