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
    Sparkles,
    BrainCircuit,
    Bot,
    Target,
    Briefcase,
    ArrowRight
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { checkHealth } from "@/services/api";

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
                            Your AI-powered career coaching hub. Choose a tool below to unlock personalized roadmaps and insights.
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

                {/* ── Featured Action: Full Analysis ────────────────────────── */}
                <div className="animate-fade-up-delay-2" style={{ marginBottom: "48px" }}>
                    <div
                        className="glass feature-card"
                        style={{
                            padding: "40px",
                            borderRadius: "24px",
                            background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))",
                            border: "1px solid rgba(139,92,246,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "32px",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Diagonal glowing slash */}
                        <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "200px", height: "200%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)", transform: "rotate(35deg)", pointerEvents: "none" }} />

                        <div style={{ flex: "1 1 400px", position: "relative", zIndex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <div style={{ padding: "6px 12px", background: "rgba(168,85,247,0.15)", borderRadius: "100px", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Sparkles size={14} /> Mega Feature
                                </div>
                            </div>
                            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "12px", lineHeight: 1.2 }}>
                                Full Career Analysis
                            </h2>
                            <p style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: 1.6, marginBottom: "32px", maxWidth: "550px" }}>
                                Let our entire team of AI agents collaborate in a live GroupChat. They'll analyze your resume, research your local job market, and build a personalized 6-week roadmap—all at once.
                            </p>
                            <a
                                href="/dashboard/full-analysis"
                                className="btn-glow"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                                    color: "white",
                                    padding: "14px 32px",
                                    borderRadius: "14px",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    fontSize: "15px",
                                    boxShadow: "0 10px 25px -5px rgba(168,85,247,0.4)",
                                    border: "1px solid rgba(255,255,255,0.2)"
                                }}
                            >
                                Launch AI Orchestrator <ArrowRight size={18} />
                            </a>
                        </div>

                        <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, flexShrink: 0 }}>
                            <div className="animate-pulse-glow" style={{ position: "absolute", width: "150%", height: "150%", background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)" }} />
                            <BrainCircuit size={90} color="#e879f9" style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 0 20px rgba(232,121,249,0.5))" }} />
                        </div>
                    </div>
                </div>

                {/* ── Your AI Team ────────────────────────────────────────────── */}
                <div className="animate-fade-up-delay-3" style={{ marginBottom: "60px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                        <Bot size={22} color="#94a3b8" />
                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9" }}>
                            Meet Your Dedicated AI Team
                        </h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                        {/* Agent 1 */}
                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px", border: "1px solid rgba(59,130,246,0.15)", background: "linear-gradient(180deg, rgba(59,130,246,0.04), transparent)" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(59,130,246,0.2)" }}>
                                <FileText size={22} color="#60a5fa" />
                            </div>
                            <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#f8fafc", marginBottom: "10px" }}>Resume Analyst</h4>
                            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>An expert at parsing resumes. Identifies your core strengths, detects missing technical abilities, and maps out your experience.</p>
                        </div>

                        {/* Agent 2 */}
                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px", border: "1px solid rgba(6,182,212,0.15)", background: "linear-gradient(180deg, rgba(6,182,212,0.04), transparent)" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(6,182,212,0.2)" }}>
                                <TrendingUp size={22} color="#22d3ee" />
                            </div>
                            <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#f8fafc", marginBottom: "10px" }}>Market Researcher</h4>
                            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>Connected to live internet search. Scans real-time job boards and databases to provide accurate salary data and demand trends.</p>
                        </div>

                        {/* Agent 3 */}
                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.15)", background: "linear-gradient(180deg, rgba(139,92,246,0.04), transparent)" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(139,92,246,0.2)" }}>
                                <Target size={22} color="#a78bfa" />
                            </div>
                            <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#f8fafc", marginBottom: "10px" }}>Career Coach</h4>
                            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>Your personal mentor. Takes your skill gaps and builds a highly detailed, 6-week actionable learning roadmap with free resources.</p>
                        </div>

                        {/* Agent 4 */}
                        <div className="glass feature-card" style={{ padding: "28px", borderRadius: "20px", border: "1px solid rgba(16,185,129,0.15)", background: "linear-gradient(180deg, rgba(16,185,129,0.04), transparent)" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(16,185,129,0.2)" }}>
                                <MessageSquare size={22} color="#34d399" />
                            </div>
                            <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#f8fafc", marginBottom: "10px" }}>Mock Interviewer</h4>
                            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>A rigorous technical evaluator. Conducts realistic interviews based on your target role and provides immediate, actionable feedback.</p>
                        </div>
                    </div>
                </div>            </main>
        </div>
    );
}
