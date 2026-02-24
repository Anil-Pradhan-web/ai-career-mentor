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

    const [greeting, setGreeting] = useState("Welcome back 👋");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning 👋");
        else if (hour < 18) setGreeting("Good afternoon 👋");
        else setGreeting("Good evening 👋");

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
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            {/* Dynamic Background Blobs */}
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    top: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    bottom: "-20%",
                    left: "-5%",
                    width: "700px",
                    height: "700px",
                    background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)",
                    zIndex: 0,
                    pointerEvents: "none",
                    animationDelay: "1.5s"
                }}
            />

            <Sidebar />

            {/* Main Content */}
            <main
                style={{
                    marginLeft: "240px",
                    flex: 1,
                    padding: "48px",
                    maxWidth: "calc(100vw - 240px)",
                    position: "relative",
                    zIndex: 1
                }}
            >
                {/* Header */}
                <div
                    className="animate-fade-up"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "48px",
                        flexWrap: "wrap",
                        gap: "16px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "2.4rem",
                                fontWeight: 800,
                                color: "#f8fafc",
                                marginBottom: "8px",
                                letterSpacing: "-0.02em"
                            }}
                        >
                            {greeting}
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "15px", maxWidth: "600px", lineHeight: 1.6 }}>
                            {analysis
                                ? "✅ Resume analyzed! See your complete skill breakdown below."
                                : "Your AI-powered career coaching hub. Start by uploading your resume to unlock personalized roadmaps and insights."}
                        </p>
                    </div>

                    {/* Backend Status Badge */}
                    <div
                        id="backend-status-badge"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 18px",
                            borderRadius: "100px",
                            background:
                                health.status === "ok"
                                    ? "rgba(16,185,129,0.08)"
                                    : health.status === "error"
                                        ? "rgba(239,68,68,0.08)"
                                        : "rgba(148,163,184,0.08)",
                            border:
                                health.status === "ok"
                                    ? "1px solid rgba(16,185,129,0.25)"
                                    : health.status === "error"
                                        ? "1px solid rgba(239,68,68,0.25)"
                                        : "1px solid rgba(148,163,184,0.15)",
                            fontSize: "13px",
                            fontWeight: 600,
                            backdropFilter: "blur(12px)",
                            boxShadow: health.status === "ok" ? "0 0 20px rgba(16,185,129,0.1)" : "none"
                        }}
                    >
                        {health.status === "checking" ? (
                            <>
                                <Loader2 size={15} color="#94a3b8" style={{ animation: "spin 1s linear infinite" }} />
                                <span style={{ color: "#94a3b8" }}>Connecting...</span>
                            </>
                        ) : health.status === "ok" ? (
                            <>
                                <CheckCircle size={15} color="#10b981" />
                                <span style={{ color: "#34d399" }}>
                                    System Online · {health.provider?.toUpperCase()}
                                </span>
                            </>
                        ) : (
                            <>
                                <XCircle size={15} color="#ef4444" />
                                <span style={{ color: "#f87171" }}>System Offline</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div
                    className="animate-fade-up-delay-1"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginBottom: "48px",
                    }}
                >
                    <StatCard icon={FileText} label="Step 1" value="Analyze Resume" color="#3b82f6" href="/dashboard/resume" />
                    <StatCard icon={Map} label="Step 2" value="Generate Roadmap" color="#8b5cf6" href="/dashboard/roadmap" />
                    <StatCard icon={TrendingUp} label="Step 3" value="Market Insights" color="#06b6d4" href="/dashboard/market" />
                    <StatCard icon={MessageSquare} label="Step 4" value="Mock Interview" color="#10b981" href="/dashboard/interview" />
                </div>

                {/* ── Upload + Career Goal Cards ─────────────────────────────── */}
                <div
                    className="animate-fade-up-delay-2"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                        gap: "32px",
                        marginBottom: "40px",
                    }}
                >
                    <UploadResumeCard onAnalysisComplete={handleAnalysisComplete} />
                    <CareerGoalForm />
                </div>

                {/* ── Analysis Panel (appears after analysis completes) ────────── */}
                {analysis && (
                    <div id="analysis-panel" className="animate-fade-up" style={{ marginTop: "16px", marginBottom: "40px" }}>
                        {/* Divider */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                marginBottom: "32px",
                            }}
                        >
                            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(148,163,184,0.2))" }} />
                            <span
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#94a3b8",
                                    whiteSpace: "nowrap",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                <Zap size={14} color="#8b5cf6" />
                                AI Analysis Complete
                            </span>
                            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(148,163,184,0.2))" }} />
                        </div>

                        <ResumeAnalysisPanel analysis={analysis} filename={analyzedFilename} />
                    </div>
                )}

            </main>
        </div>
    );
}
