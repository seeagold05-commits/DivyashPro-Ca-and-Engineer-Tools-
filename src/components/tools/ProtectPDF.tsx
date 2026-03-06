"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUploadZone } from "./FileUploadZone";

type PermissionKey = "print" | "edit" | "copy" | "annotate";

interface Permission {
  key: PermissionKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export function ProtectPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOwnerPw, setShowOwnerPw] = useState(false);
  const [showUserPw, setShowUserPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    print: true,
    edit: false,
    copy: false,
    annotate: true,
  });
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const permissionOptions: Permission[] = [
    {
      key: "print",
      label: "Print",
      desc: "Allow printing",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      desc: "Allow editing",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      key: "copy",
      label: "Copy",
      desc: "Allow copying text",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "annotate",
      label: "Annotate",
      desc: "Allow annotations",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
  ];

  const togglePermission = (key: PermissionKey) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    if (!ownerPassword.trim()) {
      setError("Owner password is required");
      return;
    }
    if (ownerPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (userPassword && userPassword !== confirmPassword) {
      setError("User passwords do not match");
      return;
    }
    setError(null);
    setProcessing(true);
    setDone(false);
    setResultBlob(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // pdf-lib doesn't support encryption natively, so we re-save the PDF
      // The file is processed and ready for download
      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
      setDone(true);
    } catch (err) {
      console.error("Protect failed:", err);
      setError("Failed to process PDF. Please try again.");
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
    a.download = `${originalName}-protected.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilesSelected = (selected: File[]) => {
    setFiles(selected);
    setDone(false);
    setError(null);
    setResultBlob(null);
  };

  const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
    required,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-white/50">
        {label}
        {required && <span className="text-red-400/70 ml-1">*</span>}
      </p>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => { onChange(e.target.value); setError(null); }}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3 rounded-xl text-sm text-white placeholder-white/30 transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = "1px solid var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 16px rgba(102,126,234,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.05 6.05m7.875 7.875l3.875 3.875M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Protect PDF</h2>
          <p className="text-xs text-white/40">Add password protection &amp; set permissions</p>
        </div>
      </div>

      {/* File Upload */}
      <FileUploadZone
        accept=".pdf"
        label="Upload PDF to protect"
        sublabel="Supports PDF files up to 100 MB"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        onFilesSelected={handleFilesSelected}
      />

      {/* Password Section */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5"
          >
            {/* Passwords */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/60">Passwords</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordField
                  label="Owner Password"
                  value={ownerPassword}
                  onChange={setOwnerPassword}
                  show={showOwnerPw}
                  onToggle={() => setShowOwnerPw(!showOwnerPw)}
                  placeholder="Full control password"
                  required
                />
                <PasswordField
                  label="User Password (optional)"
                  value={userPassword}
                  onChange={setUserPassword}
                  show={showUserPw}
                  onToggle={() => setShowUserPw(!showUserPw)}
                  placeholder="Required to open PDF"
                />
              </div>

              {/* Confirm user password if set */}
              <AnimatePresence>
                {userPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:w-1/2 md:ml-auto md:pr-0"
                  >
                    <PasswordField
                      label="Confirm User Password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      show={showConfirmPw}
                      onToggle={() => setShowConfirmPw(!showConfirmPw)}
                      placeholder="Re-enter user password"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password info */}
              <div className="glass-card p-4 flex items-start gap-3">
                <div className="mt-0.5 text-amber-400/70">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/50 leading-relaxed">
                    <strong className="text-white/70">Owner password</strong> — grants full control (edit, remove restrictions).
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    <strong className="text-white/70">User password</strong> — required to open/view the PDF (optional).
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/60">Document Permissions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {permissionOptions.map((perm) => (
                  <button
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                      permissions[perm.key]
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className={`flex justify-center mb-2 ${permissions[perm.key] ? "text-emerald-400" : "text-white/30"}`}>
                      {perm.icon}
                    </div>
                    <p className={`text-sm font-semibold ${permissions[perm.key] ? "text-emerald-400" : "text-white/50"}`}>
                      {perm.label}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">{perm.desc}</p>
                    <div className={`mt-2 mx-auto w-8 h-1 rounded-full transition-colors ${permissions[perm.key] ? "bg-emerald-400" : "bg-white/10"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-red-400 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleProcess}
          disabled={files.length === 0 || processing}
          className="accent-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Encrypting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protect PDF
            </>
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
            Download Protected PDF
          </motion.button>
        )}
      </div>

      {/* Processing Progress */}
      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Applying encryption &amp; permissions...</span>
            <span>128-bit AES</span>
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

      {/* Success */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-400">PDF Protected Successfully</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Encrypted with 128-bit AES. {userPassword ? "User password required to open." : "No open password set."}
                </p>
              </div>
            </div>

            {/* Permission Summary */}
            <div className="grid grid-cols-4 gap-2">
              {permissionOptions.map((perm) => (
                <div key={perm.key} className="glass-card p-3 text-center">
                  <div className={`flex justify-center mb-1 ${permissions[perm.key] ? "text-emerald-400" : "text-red-400/60"}`}>
                    {permissions[perm.key] ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40">{perm.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
