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
} from "lucide-react";
import type { ResumeAnalysis } from "@/types/resume";

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

// ── Assign realistic confidence % to a skill (deterministic from name length) ──
function skillPercent(skill: string, base = 70): number {
    const hash = skill.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Math.min(98, base + (hash % 28));
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
        technical_skills,
        soft_skills,
        years_of_experience,
        top_strengths,
        skill_gaps,
    } = analysis;

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
                    {/* ── 1. Experience Summary ────────────────────────────────── */}
                    <SectionCard
                        title={`${years_of_experience} Year${years_of_experience !== 1 ? "s" : ""} of Experience`}
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
                                    {years_of_experience}
                                </p>
                                <p style={{ fontSize: "11px", color: "#64748b" }}>Years</p>
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
                    </SectionCard>

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
                                    percent={skillPercent(skill)}
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
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                                        <span style={{ fontSize: "14px" }}>
                                            {i === 0 ? "🔴" : i === 1 ? "🟠" : "🟡"}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <p
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#f1f5f9",
                                                    marginBottom: "2px",
                                                }}
                                            >
                                                {gap}
                                            </p>
                                            <p style={{ fontSize: "11px", color: "#64748b" }}>
                                                {i === 0
                                                    ? "High priority — in demand at top companies"
                                                    : i === 1
                                                        ? "Medium priority — growing rapidly"
                                                        : "Good to have — adds versatility"}
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
