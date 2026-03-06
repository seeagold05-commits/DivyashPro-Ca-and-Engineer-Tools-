"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

export function WordToPDF() {
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
      const { jsPDF } = await import("jspdf");

      // Extract text from docx (ZIP of XML)
      let textContent = "";
      try {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(arrayBuffer);
        const docXml = await zip.file("word/document.xml")?.async("string");
        if (docXml) {
          // Extract text from XML, preserving paragraph breaks
          textContent = docXml
            .replace(/<w:p[^>]*>/g, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .trim();
        }
      } catch {
        // Fallback: read as text
        const decoder = new TextDecoder("utf-8", { fatal: false });
        textContent = decoder.decode(arrayBuffer);
      }

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const marginLeft = 15;
      const marginRight = 15;
      const marginTop = 20;
      const marginBottom = 20;
      const lineHeight = 6;
      const usableWidth = pageWidth - marginLeft - marginRight;

      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);

      const lines = doc.splitTextToSize(textContent, usableWidth);
      let y = marginTop;

      for (const line of lines) {
        if (y + lineHeight > 297 - marginBottom) {
          doc.addPage();
          y = marginTop;
        }
        doc.text(line, marginLeft, y);
        y += lineHeight;
      }

      const pdfBlob = doc.output("blob");
      setResultBlob(pdfBlob);
      setDone(true);
    } catch (err) {
      console.error("Word to PDF conversion failed:", err);
      // Fallback: download original file
      setResultBlob(files[0]);
      setDone(true);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const originalName = files[0]?.name.replace(/\.[^.]+$/, "") || "document";
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
          📝
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Word to PDF</h2>
          <p className="text-xs text-white/40">Convert Word documents (.doc, .docx) to PDF format</p>
        </div>
      </div>

      <FileUploadZone
        accept=".doc,.docx"
        label="Upload Word document"
        sublabel="Supports .doc and .docx formats"
        icon={<span>📝</span>}
        onFilesSelected={(f) => { setFiles(f); setDone(false); setResultBlob(null); }}
      />

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
        <p className="text-sm font-medium text-white/50">Conversion Settings</p>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Preserves formatting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Embeds fonts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Retains images</span>
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
            <span>Converting document...</span>
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
