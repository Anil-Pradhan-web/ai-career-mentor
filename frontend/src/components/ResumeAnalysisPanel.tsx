"use client";

import { useEffect, useState } from "react";
import {
    Sparkles,
    AlertTriangle,
    User,
    Trophy,
    TrendingUp,
    Clock,
    ChevronDown,
    Target,
    CheckCircle2,
    Briefcase,
} from "lucide-react";
import type { ResumeAnalysis } from "@/types";

interface Props {
    analysis: ResumeAnalysis;
    filename: string;
}

// ── Skill Badge ────────────────────────────────────────────────────────────────
function SkillBadge({
    label,
    color,
    bg,
    border,
    delay = 0,
}: {
    label: string;
    color: string;
    bg: string;
    border: string;
    delay?: number;
}) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "5px 12px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 500,
                color,
                background: bg,
                border: `1px solid ${border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </span>
    );
}

// ── Progress Bar ────────────────────────────────────────────────────────────────
function SkillProgressBar({
    label,
    percent,
    color,
    delay = 0,
}: {
    label: string;
    percent: number;
    color: string;
    delay?: number;
}) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(percent), delay + 100);
        return () => clearTimeout(t);
    }, [percent, delay]);

    return (
        <div style={{ marginBottom: "12px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    alignItems: "center",
                }}
            >
                <span style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{percent}%</span>
            </div>
            <div
                style={{
                    height: "6px",
                    borderRadius: "100px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${width}%`,
                        background: color,
                        borderRadius: "100px",
                        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: `0 0 8px ${color}60`,
                    }}
                />
            </div>
        </div>
    );
}

// ── Section Card ───────────────────────────────────────────────────────────────
function SectionCard({
    title,
    icon: Icon,
    iconColor,
    borderColor,
    children,
}: {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    borderColor: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className="glass"
            style={{
                padding: "24px",
                borderColor,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        background: `${iconColor}18`,
                        border: `1px solid ${iconColor}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Icon size={16} color={iconColor} />
                </div>
                <h3
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#f1f5f9",
                    }}
                >
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

// ── Skill proficiency indicator — uses position in list as a proxy ──────────
// Skills from the LLM are ordered by relevance/importance, so position-based
// scoring respects the actual data (unlike the old hash-based fake percent).
function skillPercent(index: number, total: number): number {
    if (total <= 1) return 95;
    // First skill ~95%, last skill ~60%, linear gradient
    return Math.round(95 - (index / (total - 1)) * 35);
}

// ── Safely access breakdown values to prevent NaN ───────────────────────────
function safeBreakdownValue(bd: any, key: string): number {
    if (!bd) return 0;
    const val = Number(bd[key]);
    return isNaN(val) ? 0 : val;
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export default function ResumeAnalysisPanel({ analysis, filename }: Props) {
    const [expanded, setExpanded] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    const {
        technical_skills = [],
        soft_skills = [],
        years_of_experience = 0,
        experience_breakdown = [],
        top_strengths = [],
        skill_gaps = [],
        ats_score,
        ats_score_breakdown,
        rag_benchmarks,
    } = analysis || {};

    // Guard safe breakdown values
    const bd = ats_score_breakdown || {};
    const bdKeywords = safeBreakdownValue(bd, "keywords");
    const bdAchievements = safeBreakdownValue(bd, "achievements");
    const bdActionVerbs = safeBreakdownValue(bd, "action_verbs");
    const bdFormatting = safeBreakdownValue(bd, "formatting_and_length");

    const candidateSkillsLower = technical_skills.map((s) => s.toLowerCase());
    const matchCount = rag_benchmarks
        ? rag_benchmarks.gold_standard_skills.filter((s) =>
              candidateSkillsLower.includes(s.toLowerCase())
          ).length
        : 0;
    const totalGoldSkills = rag_benchmarks ? rag_benchmarks.gold_standard_skills.length : 0;
    const skillMatchPercent =
        totalGoldSkills > 0 ? Math.round((matchCount / totalGoldSkills) * 100) : 0;

    return (
        <div
            style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
        >
            {/* ── Header Banner ─────────────────────────────────────────────── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                            border: "1px solid rgba(139,92,246,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Sparkles size={18} color="#a78bfa" />
                    </div>
                    <div>
                        <h2
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: "#f1f5f9",
                                marginBottom: "2px",
                            }}
                        >
                            Resume Analysis Results
                        </h2>
                        <p style={{ fontSize: "12px", color: "#64748b" }}>
                            {filename} · {technical_skills.length + soft_skills.length} skills found ·{" "}
                            {years_of_experience} yr{years_of_experience !== 1 ? "s" : ""} experience
                        </p>
                    </div>
                </div>
                
                <div
                    style={{
                        padding: "8px 16px",
                        borderRadius: "100px",
                        background: typeof ats_score === "number" && ats_score >= 80 ? "rgba(16,185,129,0.15)" : typeof ats_score === "number" && ats_score >= 60 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                        border: `1px solid ${typeof ats_score === "number" && ats_score >= 80 ? "rgba(16,185,129,0.4)" : typeof ats_score === "number" && ats_score >= 60 ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: typeof ats_score === "number" && ats_score >= 80 ? "#34d399" : typeof ats_score === "number" && ats_score >= 60 ? "#fbbf24" : "#f87171" }}>
                        ATS Score: {ats_score ?? "N/A"}/100
                    </span>
                </div>

                <button
                    onClick={() => setExpanded((v) => !v)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(148,163,184,0.15)",
                        background: "transparent",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: "13px",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                        e.currentTarget.style.color = "#c4b5fd";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)";
                        e.currentTarget.style.color = "#94a3b8";
                    }}
                >
                    {expanded ? "Collapse" : "Expand"}
                    <ChevronDown
                        size={14}
                        style={{
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                        }}
                    />
                </button>
            </div>

            {expanded && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {/* ── RAG Benchmarks Comparison Section ────────────────────────── */}
                    {rag_benchmarks && (
                        <div
                            className="glass"
                            style={{
                                gridColumn: "1 / -1",
                                padding: "24px",
                                borderColor: "rgba(139,92,246,0.3)",
                                background: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(6,182,212,0.04))",
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "12px",
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    paddingBottom: "16px",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            background: "rgba(139,92,246,0.15)",
                                            border: "1px solid rgba(139,92,246,0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Target size={18} color="#a78bfa" />
                                    </div>
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: "'Space Grotesk', sans-serif",
                                                fontSize: "1.05rem",
                                                fontWeight: 700,
                                                color: "#f1f5f9",
                                            }}
                                        >
                                            RAG Target Role Alignment
                                        </h3>
                                        <p style={{ fontSize: "12px", color: "#64748b" }}>
                                            Benchmarked against Gold Standard criteria for the target role
                                        </p>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <span style={{ fontSize: "11px", color: "#64748b" }}>Skills Match Rate</span>
                                        <span
                                            style={{
                                                fontFamily: "'Space Grotesk', sans-serif",
                                                fontSize: "1.25rem",
                                                fontWeight: 700,
                                                color: skillMatchPercent >= 70 ? "#34d399" : skillMatchPercent >= 40 ? "#fbbf24" : "#f87171",
                                            }}
                                        >
                                            {skillMatchPercent}%
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                            borderRadius: "50%",
                                            border: `3px solid ${skillMatchPercent >= 70 ? "rgba(16,185,129,0.2)" : skillMatchPercent >= 40 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
                                            borderTopColor: skillMatchPercent >= 70 ? "#10b981" : skillMatchPercent >= 40 ? "#f59e0b" : "#ef4444",
                                            transform: "rotate(-45deg)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Benchmarks Comparison Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: "20px",
                                }}
                            >
                                {/* Gold Standard Skills */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <CheckCircle2 size={14} color="#10b981" /> Gold Standard Skills Map
                                    </h4>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {rag_benchmarks.gold_standard_skills.map((skill) => {
                                            const matches = candidateSkillsLower.includes(skill.toLowerCase());
                                            return (
                                                <span
                                                    key={skill}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        padding: "4px 10px",
                                                        borderRadius: "100px",
                                                        fontSize: "11px",
                                                        fontWeight: 500,
                                                        color: matches ? "#34d399" : "#94a3b8",
                                                        background: matches ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                                                        border: `1px solid ${matches ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
                                                    }}
                                                >
                                                    {matches ? "✓" : "○"} {skill}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Core Concepts & Common Toolchain */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {/* Core Concepts */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                                            💡 Core Concepts Alignment
                                        </h4>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {rag_benchmarks.core_concepts.map((concept) => {
                                                const matches = candidateSkillsLower.includes(concept.toLowerCase()) || 
                                                    (technical_skills && technical_skills.some((s: string) => s.toLowerCase().includes(concept.toLowerCase())));
                                                return (
                                                    <span
                                                        key={concept}
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                            padding: "4px 10px",
                                                            borderRadius: "100px",
                                                            fontSize: "11px",
                                                            fontWeight: 500,
                                                            color: matches ? "#818cf8" : "#94a3b8",
                                                            background: matches ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                                                            border: `1px solid ${matches ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}`,
                                                        }}
                                                    >
                                                        {matches ? "✓" : "○"} {concept}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Common Toolchain */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                                            🛠️ Required Toolchain Match
                                        </h4>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {rag_benchmarks.common_toolchain.map((tool) => {
                                                const matches = candidateSkillsLower.includes(tool.toLowerCase());
                                                return (
                                                    <span
                                                        key={tool}
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                            padding: "4px 10px",
                                                            borderRadius: "100px",
                                                            fontSize: "11px",
                                                            fontWeight: 500,
                                                            color: matches ? "#06b6d4" : "#94a3b8",
                                                            background: matches ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.02)",
                                                            border: `1px solid ${matches ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.06)"}`,
                                                        }}
                                                    >
                                                        {matches ? "✓" : "○"} {tool}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Experience Benchmarks Comparison */}
                            <div
                                style={{
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                    paddingTop: "16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Briefcase size={14} color="#06b6d4" /> Role Experience Expectations
                                </h4>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                        gap: "12px",
                                    }}
                                >
                                    {/* Junior Benchmark */}
                                    <div
                                        style={{
                                            padding: "14px",
                                            borderRadius: "12px",
                                            background: years_of_experience < 3 ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.01)",
                                            border: `1px solid ${years_of_experience < 3 ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.05)"}`,
                                            position: "relative",
                                        }}
                                    >
                                        {years_of_experience < 3 && (
                                            <span style={{ position: "absolute", top: "10px", right: "12px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", border: "1px solid rgba(59,130,246,0.4)" }}>
                                                Your Level Match
                                            </span>
                                        )}
                                        <h5 style={{ fontSize: "12px", fontWeight: 700, color: years_of_experience < 3 ? "#60a5fa" : "#94a3b8", marginBottom: "6px" }}>
                                            Junior Level Expectations
                                        </h5>
                                        <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.4" }}>
                                            {rag_benchmarks.experience_benchmarks.junior}
                                        </p>
                                    </div>

                                    {/* Senior Benchmark */}
                                    <div
                                        style={{
                                            padding: "14px",
                                            borderRadius: "12px",
                                            background: years_of_experience >= 3 ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.01)",
                                            border: `1px solid ${years_of_experience >= 3 ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)"}`,
                                            position: "relative",
                                        }}
                                    >
                                        {years_of_experience >= 3 && (
                                            <span style={{ position: "absolute", top: "10px", right: "12px", background: "rgba(139,92,246,0.2)", color: "#c084fc", fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", border: "1px solid rgba(139,92,246,0.4)" }}>
                                                Your Level Match
                                            </span>
                                        )}
                                        <h5 style={{ fontSize: "12px", fontWeight: 700, color: years_of_experience >= 3 ? "#c084fc" : "#94a3b8", marginBottom: "6px" }}>
                                            Senior Level Expectations
                                        </h5>
                                        <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.4" }}>
                                            {rag_benchmarks.experience_benchmarks.senior}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── 1. Experience Summary ────────────────────────────────── */}
                    <SectionCard
                        title={
                            years_of_experience <= 0
                                ? "🎓 Fresher / No Professional Experience"
                                : years_of_experience < 1 
                                    ? `${Math.round(years_of_experience * 12)} Month${Math.round(years_of_experience * 12) !== 1 ? "s" : ""} of Experience`
                                    : `${years_of_experience} Year${years_of_experience !== 1 ? "s" : ""} of Experience`
                        }
                        icon={Clock}
                        iconColor="#06b6d4"
                        borderColor="rgba(6,182,212,0.2)"
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    minWidth: "120px",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    background: "rgba(6,182,212,0.06)",
                                    border: "1px solid rgba(6,182,212,0.15)",
                                    textAlign: "center",
                                }}
                            >
                                <p
                                    className="gradient-text"
                                    style={{
                                        fontFamily: "'Space Grotesk', sans-serif",
                                        fontSize: "2.2rem",
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        marginBottom: "4px",
                                    }}
                                >
                                    {years_of_experience <= 0 ? "—" : years_of_experience < 1 ? Math.round(years_of_experience * 12) : years_of_experience}
                                </p>
                                <p style={{ fontSize: "11px", color: "#64748b" }}>{years_of_experience <= 0 ? "Fresher" : years_of_experience < 1 ? "Months" : "Years"}</p>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    minWidth: "120px",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    background: "rgba(139,92,246,0.06)",
                                    border: "1px solid rgba(139,92,246,0.15)",
                                    textAlign: "center",
                                }}
                            >
                                <p
                                    style={{
                                        fontFamily: "'Space Grotesk', sans-serif",
                                        fontSize: "2.2rem",
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        marginBottom: "4px",
                                        color: "#a78bfa",
                                    }}
                                >
                                    {technical_skills.length}
                                </p>
                                <p style={{ fontSize: "11px", color: "#64748b" }}>Tech Skills</p>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    minWidth: "120px",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    background: "rgba(16,185,129,0.06)",
                                    border: "1px solid rgba(16,185,129,0.15)",
                                    textAlign: "center",
                                }}
                            >
                                <p
                                    style={{
                                        fontFamily: "'Space Grotesk', sans-serif",
                                        fontSize: "2.2rem",
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        marginBottom: "4px",
                                        color: "#34d399",
                                    }}
                                >
                                    {soft_skills.length}
                                </p>
                                <p style={{ fontSize: "11px", color: "#64748b" }}>Soft Skills</p>
                            </div>
                        </div>
                        
                        {experience_breakdown && experience_breakdown.length > 0 && (
                            <div style={{ marginTop: "16px", borderTop: "1px solid rgba(6,182,212,0.15)", paddingTop: "16px" }}>
                                <p style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                                    Detected Work Experience
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {experience_breakdown.map((exp, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.4" }}>
                                            <span style={{ color: "#06b6d4", marginTop: "2px" }}>•</span>
                                            <span>{exp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* ── 1.5. ATS Score Breakdown ────────────────────────────── */}
                    {ats_score_breakdown && (
                        <SectionCard
                            title="📊 ATS Score Breakdown"
                            icon={TrendingUp}
                            iconColor="#10b981"
                            borderColor="rgba(16,185,129,0.2)"
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                <SkillProgressBar
                                    label={`Keywords & Hard Skills (${bdKeywords}/35)`}
                                    percent={Math.round((bdKeywords / 35) * 100)}
                                    color="linear-gradient(90deg, #10b981, #34d399)"
                                    delay={100}
                                />
                                <SkillProgressBar
                                    label={`Quantified Achievements (${bdAchievements}/30)`}
                                    percent={Math.round((bdAchievements / 30) * 100)}
                                    color="linear-gradient(90deg, #f59e0b, #fbbf24)"
                                    delay={200}
                                />
                                <SkillProgressBar
                                    label={`Action Verbs (${bdActionVerbs}/20)`}
                                    percent={Math.round((bdActionVerbs / 20) * 100)}
                                    color="linear-gradient(90deg, #3b82f6, #60a5fa)"
                                    delay={300}
                                />
                                <SkillProgressBar
                                    label={`Formatting & Length (${bdFormatting}/15)`}
                                    percent={Math.round((bdFormatting / 15) * 100)}
                                    color="linear-gradient(90deg, #8b5cf6, #a78bfa)"
                                    delay={400}
                                />
                            </div>
                        </SectionCard>
                    )}

                    {/* ── 2. Top Strengths ─────────────────────────────────────── */}
                    <SectionCard
                        title="🏆 Top Strengths"
                        icon={Trophy}
                        iconColor="#f59e0b"
                        borderColor="rgba(245,158,11,0.2)"
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {top_strengths.map((s, i) => (
                                <div
                                    key={s}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "10px 14px",
                                        borderRadius: "10px",
                                        background: "rgba(245,158,11,0.05)",
                                        border: "1px solid rgba(245,158,11,0.12)",
                                        opacity: mounted ? 1 : 0,
                                        transform: mounted ? "translateX(0)" : "translateX(-12px)",
                                        transition: `opacity 0.5s ease ${i * 0.1 + 0.2}s, transform 0.5s ease ${i * 0.1 + 0.2}s`,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "22px",
                                            height: "22px",
                                            borderRadius: "50%",
                                            background: "rgba(245,158,11,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: "#fbbf24",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* ── 3. Technical Skills with Progress Bars ───────────────── */}
                    <SectionCard
                        title="⚡ Your Top Skills"
                        icon={TrendingUp}
                        iconColor="#3b82f6"
                        borderColor="rgba(59,130,246,0.2)"
                    >
                        <div>
                            {technical_skills.slice(0, 8).map((skill, i) => (
                                <SkillProgressBar
                                    key={skill}
                                    label={skill}
                                    percent={skillPercent(i, technical_skills.slice(0, 8).length)}
                                    color="linear-gradient(90deg, #3b82f6, #818cf8)"
                                    delay={i * 80}
                                />
                            ))}
                            {soft_skills.length > 0 && (
                                <>
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            color: "#475569",
                                            marginTop: "16px",
                                            marginBottom: "10px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        Soft Skills
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {soft_skills.map((s, i) => (
                                            <SkillBadge
                                                key={s}
                                                label={s}
                                                color="#a78bfa"
                                                bg="rgba(139,92,246,0.1)"
                                                border="rgba(139,92,246,0.25)"
                                                delay={i * 60}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </SectionCard>

                    {/* ── 4. Skill Gaps ─────────────────────────────────────────── */}
                    <SectionCard
                        title="🔴 Skill Gaps to Address"
                        icon={AlertTriangle}
                        iconColor="#f97316"
                        borderColor="rgba(249,115,22,0.25)"
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                            {skill_gaps.map((gap, i) => (
                                <div
                                    key={gap}
                                    style={{
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        background:
                                            i === 0
                                                ? "rgba(239,68,68,0.08)"
                                                : i === 1
                                                    ? "rgba(249,115,22,0.07)"
                                                    : "rgba(234,179,8,0.06)",
                                        border: `1px solid ${i === 0
                                            ? "rgba(239,68,68,0.2)"
                                            : i === 1
                                                ? "rgba(249,115,22,0.18)"
                                                : "rgba(234,179,8,0.15)"
                                            }`,
                                        opacity: mounted ? 1 : 0,
                                        transform: mounted ? "translateX(0)" : "translateX(12px)",
                                        transition: `opacity 0.5s ease ${i * 0.12 + 0.2}s, transform 0.5s ease ${i * 0.12 + 0.2}s`,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontSize: "14px", alignSelf: "flex-start", marginTop: "2px" }}>
                                            {i === 0 ? "🔴" : i === 1 ? "🟠" : "🟡"}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <p
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#f1f5f9",
                                                    marginBottom: "4px",
                                                    lineHeight: "1.4"
                                                }}
                                            >
                                                {gap}
                                            </p>
                                            <p style={{ fontSize: "11px", color: "#64748b" }}>
                                                {i === 0
                                                    ? "High priority (Critical for top companies)"
                                                    : i === 1
                                                        ? "Medium priority (Rapidly growing demand)"
                                                        : "Competitive advantage (Good to have)"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div
                            style={{
                                padding: "12px 16px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.08))",
                                border: "1px solid rgba(139,92,246,0.15)",
                                fontSize: "12px",
                                color: "#94a3b8",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <Sparkles size={13} color="#818cf8" />
                            Set your target role below to get a personalized roadmap to close these gaps!
                        </div>
                    </SectionCard>

                    {/* ── 5. All Technical Skills ──────────────────────────────── */}
                    <SectionCard
                        title="🧠 All Technical Skills Detected"
                        icon={User}
                        iconColor="#06b6d4"
                        borderColor="rgba(6,182,212,0.2)"
                    >
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {technical_skills.map((s, i) => (
                                <SkillBadge
                                    key={s}
                                    label={s}
                                    color="#67e8f9"
                                    bg="rgba(6,182,212,0.08)"
                                    border="rgba(6,182,212,0.2)"
                                    delay={i * 40}
                                />
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
}
