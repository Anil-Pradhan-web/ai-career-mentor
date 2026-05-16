"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div style={{
        height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px", textAlign: "center"
    }}>
        <div style={{
            width: "80px", height: "80px", borderRadius: "24px", background: "rgba(239,68,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px",
            border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 0 30px rgba(239,68,68,0.2)"
        }}>
            <AlertCircle size={40} color="#ef4444" />
        </div>
        
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "16px" }}>
            Kernel Panic: Orchestrator Failed
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", lineHeight: 1.6, marginBottom: "40px" }}>
            The AI Career Operating System encountered an unexpected error during multi-agent synchronization. 
            Detailed logs have been captured for the dev team.
        </p>

        <div style={{ display: "flex", gap: "16px" }}>
            <button
                onClick={() => reset()}
                style={{
                    padding: "12px 24px", borderRadius: "12px", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s"
                }}
            >
                <RefreshCcw size={18} /> Retry System
            </button>
            <Link href="/dashboard" style={{
                padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)",
                color: "white", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "10px",
                boxShadow: "0 8px 20px rgba(139,92,246,0.3)"
            }}>
                <Home size={18} /> Return Home
            </Link>
        </div>
    </div>
  );
}
