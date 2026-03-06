"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

interface PDFFile {
  file: File;
  id: string;
}

export function MergePDF() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newPdfFiles = files.map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }));
    setPdfFiles((prev) => [...prev, ...newPdfFiles]);
    setDone(false);
    setResultBlob(null);
  }, []);

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((p) => p.id !== id));
    setDone(false);
    setResultBlob(null);
  };

  const moveFile = (fromIdx: number, toIdx: number) => {
    const updated = [...pdfFiles];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setPdfFiles(updated);
  };

  const handleProcess = async () => {
    if (pdfFiles.length < 2) return;
    setProcessing(true);
    setDone(false);
    setResultBlob(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
      setDone(true);
    } catch (err) {
      console.error("Merge failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
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
          📑
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Merge PDF</h2>
          <p className="text-xs text-white/40">Combine multiple PDFs into a single document</p>
        </div>
      </div>

      <FileUploadZone
        accept=".pdf"
        multiple
        label="Upload PDFs to merge"
        sublabel="Add 2 or more PDFs — drag to reorder below"
        icon={<span>📑</span>}
        onFilesSelected={handleFilesSelected}
      />

      {pdfFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/60">
            File Order ({pdfFiles.length} files)
          </p>
          <div className="space-y-2">
            {pdfFiles.map((pdf, index) => (
              <motion.div
                key={pdf.id}
                layout
                draggable
                onDragStart={() => setDraggedIdx(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedIdx !== null && draggedIdx !== index) {
                    moveFile(draggedIdx, index);
                  }
                  setDraggedIdx(null);
                }}
                className={`glass-card flex items-center justify-between p-3 px-4 cursor-grab active:cursor-grabbing ${
                  draggedIdx === index ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center gap-0.5 text-white/20">
                    <div className="w-4 h-0.5 bg-current rounded" />
                    <div className="w-4 h-0.5 bg-current rounded" />
                    <div className="w-4 h-0.5 bg-current rounded" />
                  </div>
                  <span className="text-xs font-mono text-white/30 w-6">{index + 1}.</span>
                  <p className="text-sm text-white/80 truncate">{pdf.file.name}</p>
                </div>
                <button
                  onClick={() => removeFile(pdf.id)}
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleProcess}
          disabled={pdfFiles.length < 2 || processing}
          className="accent-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Merging...
            </>
          ) : (
            `Merge ${pdfFiles.length} PDFs`
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
            Download Merged PDF
          </motion.button>
        )}
      </div>

      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Merging {pdfFiles.length} files...</span>
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
