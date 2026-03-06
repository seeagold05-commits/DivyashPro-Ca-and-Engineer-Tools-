"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

type OutputFormat = "jpeg" | "png" | "webp";

interface CompressedResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export function CompressImage() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState(0); // 0 = keep original
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressedResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formats: { key: OutputFormat; label: string; desc: string }[] = [
    { key: "jpeg", label: "JPEG", desc: "Best for photos, smallest size" },
    { key: "webp", label: "WebP", desc: "Modern format, great compression" },
    { key: "png", label: "PNG", desc: "Lossless, larger file size" },
  ];

  const presetSizes = [
    { label: "Original", value: 0 },
    { label: "1920px", value: 1920 },
    { label: "1280px", value: 1280 },
    { label: "800px", value: 800 },
    { label: "480px", value: 480 },
  ];

  const handleFilesSelected = useCallback((selected: File[]) => {
    setFiles(selected);
    setResult(null);
    if (selected.length > 0) {
      const url = URL.createObjectURL(selected[0]);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const compressImage = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);

    const file = files[0];
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) { setProcessing(false); return; }

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      // Resize if max width is set
      if (maxWidth > 0 && img.naturalWidth > maxWidth) {
        const ratio = maxWidth / img.naturalWidth;
        targetWidth = maxWidth;
        targetHeight = Math.round(img.naturalHeight * ratio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) { setProcessing(false); return; }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = `image/${outputFormat}`;
      const qualityValue = outputFormat === "png" ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) { setProcessing(false); return; }

          const url = URL.createObjectURL(blob);
          setResult({
            blob,
            url,
            width: targetWidth,
            height: targetHeight,
            originalSize: file.size,
            compressedSize: blob.size,
          });
          setProcessing(false);
        },
        mimeType,
        qualityValue
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setProcessing(false);
    };

    img.src = objectUrl;
  }, [files, quality, maxWidth, outputFormat]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const originalName = files[0]?.name.replace(/\.[^.]+$/, "") || "image";
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${originalName}-compressed.${ext}`;
    a.click();
  }, [result, outputFormat, files]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const savings = result
    ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ background: "var(--accent-gradient)" }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Compress Image</h2>
          <p className="text-xs text-white/40">Reduce image file size with adjustable quality &amp; format</p>
        </div>
      </div>

      {/* File Upload */}
      <FileUploadZone
        accept=".jpg,.jpeg,.png,.webp,.bmp,.gif"
        label="Upload image to compress"
        sublabel="Supports JPG, PNG, WebP, BMP, GIF up to 50 MB"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        onFilesSelected={handleFilesSelected}
      />

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]"
          >
            <div className="p-3 border-b border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/50 font-medium">Preview</span>
            </div>
            <div className="p-4 flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 rounded-lg object-contain"
                style={{ maxWidth: "100%" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output Format */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white/60">Output Format</p>
        <div className="grid grid-cols-3 gap-3">
          {formats.map((f) => (
            <button
              key={f.key}
              onClick={() => setOutputFormat(f.key)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                outputFormat === f.key
                  ? "border-[var(--accent)] bg-[var(--accent-glow-soft)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <p className={`text-sm font-semibold ${outputFormat === f.key ? "text-[var(--accent)]" : "text-white/70"}`}>
                {f.label}
              </p>
              <p className="text-xs text-white/30 mt-1">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider */}
      {outputFormat !== "png" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/60">Quality</p>
            <span
              className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md"
              style={{ color: "var(--accent)", background: "var(--accent-glow-soft)" }}
            >
              {quality}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${quality}%, rgba(255,255,255,0.08) ${quality}%, rgba(255,255,255,0.08) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-white/20 mt-1 px-1">
              <span>Smallest</span>
              <span>Best Quality</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Max Width */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white/60">Max Width (resize)</p>
        <div className="flex flex-wrap gap-2">
          {presetSizes.map((s) => (
            <button
              key={s.value}
              onClick={() => setMaxWidth(s.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                maxWidth === s.value
                  ? "text-white border-[var(--accent)] bg-[var(--accent-glow-soft)] border"
                  : "text-white/50 border border-white/10 bg-white/[0.02] hover:border-white/20 hover:text-white/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={compressImage}
          disabled={files.length === 0 || processing}
          className="accent-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Compressing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Compress Image
            </>
          )}
        </button>

        {result && (
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

      {/* Processing Progress */}
      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Processing...</span>
            <span>Compressing</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent-gradient)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {/* Result Stats */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* Size Comparison */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-white/40 mb-1">Original</p>
                <p className="text-lg font-bold text-white/80 tabular-nums">
                  {formatSize(result.originalSize)}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-white/40 mb-1">Compressed</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                  {formatSize(result.compressedSize)}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-white/40 mb-1">Saved</p>
                <p className={`text-lg font-bold tabular-nums ${savings > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {savings}%
                </p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="flex items-center gap-3 text-xs text-white/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Output: {result.width} &times; {result.height}px</span>
              <span className="text-white/20">|</span>
              <span>Format: {outputFormat.toUpperCase()}</span>
            </div>

            {/* Compressed Preview */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
              <div className="p-3 border-b border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span className="text-xs text-white/50 font-medium">Compressed Result</span>
              </div>
              <div className="p-4 flex justify-center">
                <img
                  src={result.url}
                  alt="Compressed"
                  className="max-h-64 rounded-lg object-contain"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for compression */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
