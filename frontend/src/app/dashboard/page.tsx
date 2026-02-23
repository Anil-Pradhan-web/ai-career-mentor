"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Map,
    TrendingUp,
    MessageSquare,
    CheckCircle,
    XCircle,
    Loader2,
    Zap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UploadResumeCard from "@/components/UploadResumeCard";
import CareerGoalForm from "@/components/CareerGoalForm";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import { checkHealth } from "@/services/api";
import type { ResumeAnalysis } from "@/types/resume";

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    color,
    href,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="glass feature-card"
            style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                textDecoration: "none",
                cursor: "pointer",
            }}
        >
            <div
                style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={20} color={color} />
            </div>
            <div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{label}</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#f1f5f9" }}>{value}</p>
            </div>
        </a>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [health, setHealth] = useState<{
        status: "checking" | "ok" | "error";
        model?: string;
        provider?: string;
    }>({ status: "checking" });

    // Analysis state — lifted here so both Upload card and Analysis panel share it
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [analyzedFilename, setAnalyzedFilename] = useState<string>("");

    useEffect(() => {
        checkHealth()
            .then((data) => setHealth({ status: "ok", model: data.model, provider: data.provider }))
            .catch(() => setHealth({ status: "error" }));
    }, []);

    const handleAnalysisComplete = (result: ResumeAnalysis, filename: string) => {
        setAnalysis(result);
        setAnalyzedFilename(filename);
        // Smooth scroll to analysis panel after a short delay
        setTimeout(() => {
            document.getElementById("analysis-panel")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 300);
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Sidebar />

            {/* Main Content */}
            <main
                style={{
                    marginLeft: "240px",
                    flex: 1,
                    padding: "32px",
                    maxWidth: "calc(100vw - 240px)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "32px",
                        flexWrap: "wrap",
                        gap: "16px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "1.8rem",
                                fontWeight: 700,
                                color: "#f1f5f9",
                                marginBottom: "6px",
                            }}
                        >
                            Welcome back 👋
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                            {analysis
                                ? "✅ Resume analyzed! See your skill breakdown below."
                                : "Your AI career coaching dashboard — start by uploading your resume."}
                        </p>
                    </div>

                    {/* Backend Status Badge */}
                    <div
                        id="backend-status-badge"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 14px",
                            borderRadius: "100px",
                            background:
                                health.status === "ok"
                                    ? "rgba(16,185,129,0.1)"
                                    : health.status === "error"
                                        ? "rgba(239,68,68,0.1)"
                                        : "rgba(148,163,184,0.1)",
                            border:
                                health.status === "ok"
                                    ? "1px solid rgba(16,185,129,0.25)"
                                    : health.status === "error"
                                        ? "1px solid rgba(239,68,68,0.25)"
                                        : "1px solid rgba(148,163,184,0.15)",
                            fontSize: "13px",
                        }}
                    >
                        {health.status === "checking" ? (
                            <>
                                <Loader2 size={14} color="#94a3b8" style={{ animation: "spin 1s linear infinite" }} />
                                <span style={{ color: "#94a3b8" }}>Connecting...</span>
                            </>
                        ) : health.status === "ok" ? (
                            <>
                                <CheckCircle size={14} color="#10b981" />
                                <span style={{ color: "#34d399" }}>
                                    Backend Live · {health.provider?.toUpperCase()} · {health.model}
                                </span>
                            </>
                        ) : (
                            <>
                                <XCircle size={14} color="#ef4444" />
                                <span style={{ color: "#f87171" }}>Backend Offline</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        marginBottom: "32px",
                    }}
                >
                    <StatCard icon={FileText} label="Resume" value="Upload & Analyze" color="#3b82f6" href="#" />
                    <StatCard icon={Map} label="Roadmap" value="Generate Plan" color="#8b5cf6" href="#" />
                    <StatCard icon={TrendingUp} label="Market" value="Research Trends" color="#06b6d4" href="#" />
                    <StatCard icon={MessageSquare} label="Interview" value="Start Practice" color="#10b981" href="#" />
                </div>

                {/* ── Upload + Career Goal Cards ─────────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "24px",
                        marginBottom: "24px",
                    }}
                >
                    <UploadResumeCard onAnalysisComplete={handleAnalysisComplete} />
                    <CareerGoalForm />
                </div>

                {/* ── Analysis Panel (appears after analysis completes) ────────── */}
                {analysis && (
                    <div id="analysis-panel" style={{ marginTop: "8px", marginBottom: "24px" }}>
                        {/* Divider */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                marginBottom: "24px",
                            }}
                        >
                            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                            <span
                                style={{
                                    fontSize: "12px",
                                    color: "#475569",
                                    whiteSpace: "nowrap",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                ✨ AI Analysis Results
                            </span>
                            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                        </div>

                        <ResumeAnalysisPanel analysis={analysis} filename={analyzedFilename} />
                    </div>
                )}

                {/* ── Info Banner ───────────────────────────────────────────────── */}
                <div
                    className="glass"
                    style={{
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.08))",
                        border: "1px solid rgba(139,92,246,0.15)",
                    }}
                >
                    <Zap size={20} color="#8b5cf6" style={{ flexShrink: 0 }} />
                    <div>
                        <p style={{ color: "#f1f5f9", fontWeight: 500, fontSize: "14px", marginBottom: "2px" }}>
                            Multi-Agent Pipeline Ready
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                            4 Microsoft AutoGen agents will collaborate to analyze your resume, research job market,
                            build your roadmap, and prep you for interviews — all in one click.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
