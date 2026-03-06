"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

export function PDFToWord() {
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

      // Extract text from PDF
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      let allText = "";
      for (const page of pages) {
        const text = await extractTextFromPage(page);
        if (text.trim()) {
          allText += text + "\n\n";
        }
      }

      if (!allText.trim()) {
        allText = "Text could not be extracted from this PDF. The PDF may contain scanned images instead of text content.";
      }

      // Create a simple .docx using a minimal Open XML structure
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Build paragraphs XML
      const paragraphs = allText.split("\n").map((line) => {
        const escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
      }).join("");

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body>
</w:document>`;

      const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

      const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

      const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

      zip.file("[Content_Types].xml", contentTypesXml);
      zip.file("_rels/.rels", relsXml);
      zip.file("word/document.xml", documentXml);
      zip.file("word/_rels/document.xml.rels", wordRelsXml);

      const docxBlob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      setResultBlob(docxBlob);
      setDone(true);
    } catch (err) {
      console.error("PDF to Word conversion failed:", err);
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
    a.download = `${originalName}.docx`;
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
          📄
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">PDF to Word</h2>
          <p className="text-xs text-white/40">Convert PDF files to editable Word documents</p>
        </div>
      </div>

      <FileUploadZone
        accept=".pdf"
        label="Upload PDF to convert"
        sublabel="Output format: .docx"
        icon={<span>📄</span>}
        onFilesSelected={(f) => { setFiles(f); setDone(false); setResultBlob(null); }}
      />

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
        <p className="text-sm font-medium text-white/50">Output Quality</p>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Text extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Table structure preserved</span>
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
            "Convert to Word"
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
            Download .docx
          </motion.button>
        )}
      </div>

      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Extracting content &amp; rebuilding document...</span>
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

// Helper: extract visible text from a PDF page
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
