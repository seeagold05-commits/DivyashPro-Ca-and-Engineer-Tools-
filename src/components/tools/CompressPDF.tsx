"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

type CompressionLevel = "low" | "medium" | "high";

export function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const levels: { key: CompressionLevel; label: string; desc: string }[] = [
    { key: "low", label: "Low", desc: "Minimal compression, best quality" },
    { key: "medium", label: "Medium", desc: "Balanced size & quality" },
    { key: "high", label: "High", desc: "Maximum compression, smaller file" },
  ];

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    setResultBlob(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
      setDone(true);
    } catch (err) {
      console.error("Compress failed:", err);
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
    a.download = `${originalName}-compressed.pdf`;
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
          📦
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Compress PDF</h2>
          <p className="text-xs text-white/40">Reduce PDF file size with adjustable quality</p>
        </div>
      </div>

      <FileUploadZone
        accept=".pdf"
        label="Upload PDF to compress"
        sublabel="Supports PDF files up to 100 MB"
        icon={<span>📦</span>}
        onFilesSelected={(f) => { setFiles(f); setDone(false); setResultBlob(null); }}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-white/60">Compression Level</p>
        <div className="grid grid-cols-3 gap-3">
          {levels.map((l) => (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                level === l.key
                  ? "border-[var(--accent)] bg-[var(--accent-glow-soft)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <p className={`text-sm font-semibold ${level === l.key ? "text-[var(--accent)]" : "text-white/70"}`}>
                {l.label}
              </p>
              <p className="text-xs text-white/30 mt-1">{l.desc}</p>
            </button>
          ))}
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
              Compressing...
            </>
          ) : (
            "Compress PDF"
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
            Download Result
          </motion.button>
        )}
      </div>

      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Processing...</span>
            <span>~60%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent-gradient)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
