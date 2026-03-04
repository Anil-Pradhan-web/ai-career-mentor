"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
    ArrowRight, FileText, Map, TrendingUp, MessageSquare,
    BrainCircuit, CheckCircle2, Clock, BarChart2, Zap,
    Activity, ChevronRight,
} from "lucide-react";
import { checkHealth } from "@/services/api";

const QUICK_ACTIONS = [
    {
        icon: BrainCircuit, label: "Full Analysis",
        desc: "Resume + market + roadmap — all at once",
        href: "/dashboard/full-analysis",
        color: "#a78bfa", border: "rgba(167,139,250,0.15)", bg: "rgba(167,139,250,0.06)",
    },
    {
        icon: FileText, label: "Resume Analyzer",
        desc: "Get a detailed score and skill gap report",
        href: "/dashboard/resume",
        color: "#818cf8", border: "rgba(91,110,248,0.15)", bg: "rgba(91,110,248,0.06)",
    },
    {
        icon: Map, label: "My Roadmap",
        desc: "Week-by-week personalised learning plan",
        href: "/dashboard/roadmap",
        color: "#34d399", border: "rgba(52,211,153,0.15)", bg: "rgba(52,211,153,0.06)",
    },
    {
        icon: TrendingUp, label: "Market Trends",
        desc: "Salary bands & in-demand skills near you",
        href: "/dashboard/market",
        color: "#06b6d4", border: "rgba(6,182,212,0.15)", bg: "rgba(6,182,212,0.06)",
    },
    {
        icon: MessageSquare, label: "Mock Interview",
        desc: "Live AI interview with real-time coaching",
        href: "/dashboard/interview",
        color: "#f59e0b", border: "rgba(245,158,11,0.15)", bg: "rgba(245,158,11,0.06)",
    },
];

const AI_AGENTS = [
    { name: "Resume Analyst", desc: "Parses your CV, scores every section, and flags weak spots against live JD benchmarks.", color: "#818cf8", initial: "RA" },
    { name: "Market Researcher", desc: "Pulls real-time salary data, skill demand signals, and top hiring companies for your role.", color: "#06b6d4", initial: "MR" },
    { name: "Career Coach", desc: "Builds a personalised roadmap based on your current skills and target role timeline.", color: "#34d399", initial: "CC" },
    { name: "Interview Trainer", desc: "Conducts mock interviews, listens to your answers, and gives actionable feedback in real time.", color: "#f59e0b", initial: "IT" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [backendOk, setBackendOk] = useState<boolean | null>(null);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.replace("/login"); return; }
        const n = localStorage.getItem("userName") || "User";
        setUserName(n);
        const onStorage = () => setUserName(localStorage.getItem("userName") || "User");
        window.addEventListener("storage", onStorage);

        checkHealth()
            .then(d => setBackendOk(d.status === "ok"))
            .catch(() => setBackendOk(false));

        return () => window.removeEventListener("storage", onStorage);
    }, [router]);

    return (
        <div className="dashboard-root" style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
            <Sidebar />

            <main style={{
                marginLeft: "248px",
                flex: 1,
                maxWidth: "calc(100vw - 248px)",
                padding: "36px 40px",
                position: "relative",
                zIndex: 1,
            }}>
                {/* ── Top bar ───────────────────────────────────────────────── */}
                <div className="animate-fade-up" style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "36px",
                    gap: "16px",
                    flexWrap: "wrap",
                }}>
                    <div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>{greeting},</p>
                        <h1 style={{
                            fontFamily: "'Space Grotesk',sans-serif",
                            fontSize: "1.9rem", fontWeight: 800,
                            color: "var(--text-primary)", lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                        }}>{userName} 👋</h1>
                    </div>

                    {/* Backend status badge */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 14px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-full)",
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: "7px", height: "7px", borderRadius: "50%",
                            background: backendOk === null ? "#f59e0b" : backendOk ? "#10b981" : "#ef4444",
                            boxShadow: backendOk ? "0 0 6px #10b981" : backendOk === false ? "0 0 6px #ef4444" : "0 0 6px #f59e0b",
                        }} />
                        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                            AI backend {backendOk === null ? "checking…" : backendOk ? "online" : "offline"}
                        </span>
                    </div>
                </div>

                {/* ── Quick Stats row ────────────────────────────────────────── */}
                <div className="animate-fade-up-delay-1" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "14px",
                    marginBottom: "36px",
                }}>
                    {[
                        { icon: Activity, label: "Sessions", value: "1", color: "#818cf8" },
                        { icon: CheckCircle2, label: "Tasks done", value: "0", color: "#10b981" },
                        { icon: BarChart2, label: "Profile score", value: "—", color: "#f59e0b" },
                        { icon: Clock, label: "Hours saved", value: "0", color: "#06b6d4" },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} style={{
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-default)",
                                borderRadius: "var(--radius-lg)",
                                padding: "18px 20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                            }}>
                                <div style={{
                                    width: "36px", height: "36px",
                                    background: s.color + "14",
                                    border: `1px solid ${s.color}28`,
                                    borderRadius: "10px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <Icon size={17} color={s.color} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "3px" }}>{s.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Quick Actions grid ─────────────────────────────────────── */}
                <div className="animate-fade-up-delay-2" style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            Quick Actions
                        </h2>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "14px",
                    }}>
                        {QUICK_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                                    <div className="feature-card" style={{
                                        background: action.bg,
                                        border: `1px solid ${action.border}`,
                                        borderRadius: "var(--radius-lg)",
                                        padding: "20px",
                                        cursor: "pointer",
                                    }}>
                                        <div style={{
                                            width: "36px", height: "36px",
                                            background: action.color + "20",
                                            border: `1px solid ${action.color}30`,
                                            borderRadius: "10px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            marginBottom: "14px",
                                        }}>
                                            <Icon size={18} color={action.color} />
                                        </div>
                                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "5px" }}>
                                            {action.label}
                                        </div>
                                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                            {action.desc}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "14px", color: action.color, fontSize: "0.75rem", fontWeight: 600 }}>
                                            Open <ChevronRight size={13} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* ── AI Agents section ──────────────────────────────────────── */}
                <div className="animate-fade-up-delay-3">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            Your AI Team
                        </h2>
                        <span className="badge badge-green">
                            <div style={{ width: "5px", height: "5px", background: "var(--accent-emerald)", borderRadius: "50%" }} />
                            All agents online
                        </span>
                    </div>

                    <div className="ai-team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
                        {AI_AGENTS.map((agent) => (
                            <div key={agent.name} style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "14px",
                                padding: "20px",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-default)",
                                borderRadius: "var(--radius-lg)",
                                transition: "border-color 0.15s",
                            }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"}
                            >
                                <div style={{
                                    width: "38px", height: "38px", borderRadius: "50%",
                                    background: agent.color + "18",
                                    border: `1px solid ${agent.color}30`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.68rem", fontWeight: 700, color: agent.color,
                                    flexShrink: 0,
                                }}>{agent.initial}</div>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>{agent.name}</span>
                                        <span style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 5px #10b981" }} />
                                    </div>
                                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{agent.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link href="/dashboard/full-analysis" style={{ textDecoration: "none", display: "block", marginTop: "14px" }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            padding: "15px",
                            background: "rgba(91,110,248,0.06)",
                            border: "1px solid rgba(91,110,248,0.14)",
                            borderRadius: "var(--radius-lg)",
                            cursor: "pointer",
                            transition: "background 0.15s, border-color 0.15s",
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(91,110,248,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,110,248,0.25)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(91,110,248,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,110,248,0.14)"; }}
                        >
                            <Zap size={16} color="#818cf8" />
                            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.88rem", fontWeight: 700, color: "#818cf8" }}>
                                Launch all agents — Full Career Analysis
                            </span>
                            <ArrowRight size={15} color="#818cf8" />
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
