import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DivyashPro — CA & Utility Tools Suite",
  description:
    "High-performance dual-persona suite for Chartered Accountants. Professional CA tools with PDF & Office utility tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Ambient Background Orbs — colors transition with persona */}
        <div className="ambient-orb w-[500px] h-[500px] -top-48 -left-48" style={{ background: "var(--orb-1)" }} />
        <div className="ambient-orb w-[400px] h-[400px] top-1/3 -right-32" style={{ background: "var(--orb-2)" }} />
        <div className="ambient-orb w-[350px] h-[350px] -bottom-24 left-1/4" style={{ background: "var(--orb-3)" }} />

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
