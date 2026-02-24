"use client";

import { useEffect, useRef, useState } from "react";
import {
    Map,
    Loader2,
    Sparkles,
    ExternalLink,
    Clock,
    Code2,
    CheckCircle2,
    Circle,
    ChevronDown,
    AlertCircle,
    RotateCcw,
    Trophy,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { generateRoadmap } from "@/services/api";
import type { RoadmapResponse, RoadmapWeek } from "@/types/roadmap";

// ── Constants ──────────────────────────────────────────────────────────────────
const TARGET_ROLES = [
    "Software Engineer",
    "Software Developer",
    "Data Scientist",
    "Data Analyst",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Web Developer",
    "Mobile App Developer",
    "Android Developer",
    "iOS Developer",
    "Cloud Engineer",
    "Cloud Architect",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Deep Learning Engineer",
    "Generative AI Engineer",
    "Prompt Engineer",
    "MLOps Engineer",
    "Data Engineer",
    "Big Data Engineer",
    "Product Manager",
    "Technical Product Manager",
    "Project Manager",
    "Cybersecurity Analyst",
    "Security Engineer",
    "Penetration Tester",
    "Blockchain Developer",
    "Game Developer",
    "AR/VR Developer",
    "Embedded Systems Engineer",
    "IoT Engineer",
    "Robotics Engineer",
    "Automation Engineer",
    "QA Engineer",
    "Test Engineer",
    "UI/UX Designer",
    "Solutions Architect",
    "IT Support Engineer",
    "Systems Engineer",
    "Network Engineer",
    "Research Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
];

const WEEK_COLORS = [
    { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", dot: "#3b82f6", line: "rgba(59,130,246,0.3)" },
    { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", dot: "#8b5cf6", line: "rgba(139,92,246,0.3)" },
    { bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.25)", dot: "#06b6d4", line: "rgba(6,182,212,0.3)" },
    { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", dot: "#10b981", line: "rgba(16,185,129,0.3)" },
    { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", dot: "#f59e0b", line: "rgba(245,158,11,0.3)" },
    { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", dot: "#ef4444", line: "rgba(239,68,68,0.3)" },
];

const LS_KEY = (role: string) => `roadmap_completed_${role.toLowerCase().replace(/\s+/g, "_")}`;

// ── Timeline Week Card ─────────────────────────────────────────────────────────
function WeekCard({
    week,
    color,
    isLast,
    completed,
    onToggle,
    animDelay,
}: {
    week: RoadmapWeek;
    color: typeof WEEK_COLORS[0];
    isLast: boolean;
    completed: boolean;
    onToggle: () => void;
    animDelay: number;
}) {
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), animDelay);
        return () => clearTimeout(t);
    }, [animDelay]);

    return (
        <div
            style={{
                display: "flex",
                gap: "0",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
        >
            {/* ── Timeline spine ──────────────────────────────────────────────── */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "48px",
                    flexShrink: 0,
                    marginRight: "20px",
                }}
            >
                {/* Dot */}
                <button
                    onClick={onToggle}
                    title={completed ? "Mark incomplete" : "Mark complete"}
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: `2px solid ${completed ? color.dot : color.border}`,
                        background: completed
                            ? color.dot
                            : "rgba(15,23,42,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 0.3s ease",
                        boxShadow: completed ? `0 0 16px ${color.dot}60` : "none",
                        zIndex: 1,
                    }}
                >
                    {completed ? (
                        <CheckCircle2 size={16} color="white" />
                    ) : (
                        <span
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: color.dot,
                            }}
                        >
                            {week.week}
                        </span>
                    )}
                </button>

                {/* Vertical line */}
                {!isLast && (
                    <div
                        style={{
                            width: "2px",
                            flex: 1,
                            marginTop: "6px",
                            background: `linear-gradient(to bottom, ${color.line}, transparent)`,
                            minHeight: "40px",
                        }}
                    />
                )}
            </div>

            {/* ── Card ────────────────────────────────────────────────────────── */}
            <div
                style={{
                    flex: 1,
                    marginBottom: isLast ? "0" : "20px",
                    borderRadius: "14px",
                    border: `1px solid ${completed ? color.dot + "50" : color.border}`,
                    background: completed
                        ? `${color.bg}`
                        : "rgba(15,23,42,0.6)",
                    backdropFilter: "blur(12px)",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    boxShadow: completed ? `0 0 24px ${color.dot}18` : "none",
                }}
            >
                {/* Card header */}
                <div
                    style={{
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "12px",
                        cursor: "pointer",
                    }}
                    onClick={() => setExpanded((v) => !v)}
                >
                    <div style={{ flex: 1 }}>
                        {/* Week label */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: color.dot,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                Week {week.week}
                            </span>
                            {completed && (
                                <span
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        color: color.dot,
                                        background: `${color.dot}18`,
                                        border: `1px solid ${color.dot}30`,
                                        padding: "2px 8px",
                                        borderRadius: "100px",
                                    }}
                                >
                                    ✓ Done
                                </span>
                            )}
                        </div>

                        {/* Topic */}
                        <h3
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: completed ? color.dot : "#f1f5f9",
                                lineHeight: 1.4,
                                textDecoration: completed ? "line-through" : "none",
                                opacity: completed ? 0.75 : 1,
                            }}
                        >
                            {week.topic}
                        </h3>

                        {/* Quick stats row */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                marginTop: "10px",
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "12px",
                                    color: "#64748b",
                                }}
                            >
                                <Clock size={12} color={color.dot} />
                                {week.estimated_hours}h estimated
                            </span>
                            <a
                                href={week.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "12px",
                                    color: color.dot,
                                    textDecoration: "none",
                                    fontWeight: 500,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                                <ExternalLink size={11} />
                                Free Resource
                            </a>
                        </div>
                    </div>

                    {/* Expand chevron */}
                    <ChevronDown
                        size={16}
                        color="#475569"
                        style={{
                            flexShrink: 0,
                            marginTop: "4px",
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                        }}
                    />
                </div>

                {/* Expanded: Mini project */}
                {expanded && (
                    <div
                        style={{
                            padding: "0 20px 18px",
                            borderTop: `1px solid ${color.border}`,
                            paddingTop: "14px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                padding: "14px",
                                borderRadius: "10px",
                                background: `${color.bg}`,
                                border: `1px solid ${color.border}`,
                            }}
                        >
                            <Code2 size={16} color={color.dot} style={{ flexShrink: 0, marginTop: "1px" }} />
                            <div>
                                <p
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: color.dot,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        marginBottom: "6px",
                                    }}
                                >
                                    🔨 Mini Project
                                </p>
                                <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                                    {week.mini_project}
                                </p>
                            </div>
                        </div>

                        {/* Full resource link */}
                        <a
                            href={week.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "12px",
                                padding: "10px 14px",
                                borderRadius: "9px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(148,163,184,0.1)",
                                color: "#94a3b8",
                                fontSize: "12px",
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                                wordBreak: "break-all",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = color.dot;
                                e.currentTarget.style.borderColor = color.border;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#94a3b8";
                                e.currentTarget.style.borderColor = "rgba(148,163,184,0.1)";
                            }}
                        >
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                            {week.resource_url}
                        </a>

                        {/* Mark done button */}
                        <button
                            onClick={onToggle}
                            style={{
                                marginTop: "12px",
                                width: "100%",
                                padding: "10px",
                                borderRadius: "9px",
                                border: `1px solid ${completed ? "rgba(239,68,68,0.25)" : color.border}`,
                                background: completed ? "rgba(239,68,68,0.06)" : `${color.bg}`,
                                color: completed ? "#f87171" : color.dot,
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {completed ? (
                                <>
                                    <RotateCcw size={13} /> Mark as Incomplete
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={13} /> Mark as Complete ✓
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Progress bar at top ────────────────────────────────────────────────────────
function ProgressHeader({
    roadmap,
    completed,
}: {
    roadmap: RoadmapResponse;
    completed: Set<number>;
}) {
    const pct = Math.round((completed.size / roadmap.weeks.length) * 100);
    const totalHours = roadmap.weeks.reduce((s, w) => s + w.estimated_hours, 0);
    const doneHours = roadmap.weeks
        .filter((w) => completed.has(w.week))
        .reduce((s, w) => s + w.estimated_hours, 0);

    return (
        <div
            className="glass"
            style={{
                padding: "20px 24px",
                marginBottom: "28px",
                background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.08))",
                border: "1px solid rgba(139,92,246,0.15)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <h2
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#f1f5f9",
                            marginBottom: "3px",
                        }}
                    >
                        🗺️ {roadmap.target_role} — Learning Roadmap
                    </h2>
                    <p style={{ fontSize: "12px", color: "#64748b" }}>
                        {roadmap.weeks.length} weeks · {totalHours}h total · {doneHours}h completed
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p
                        className="gradient-text"
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "1.8rem",
                            fontWeight: 800,
                            lineHeight: 1,
                        }}
                    >
                        {pct}%
                    </p>
                    <p style={{ fontSize: "11px", color: "#64748b" }}>Complete</p>
                </div>
            </div>

            {/* Progress bar */}
            <div
                style={{
                    height: "8px",
                    borderRadius: "100px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #3b82f6, #818cf8, #8b5cf6)",
                        borderRadius: "100px",
                        transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: "0 0 12px rgba(139,92,246,0.5)",
                    }}
                />
            </div>

            {pct === 100 && (
                <div
                    style={{
                        marginTop: "14px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        color: "#34d399",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Trophy size={15} />
                    🎉 Roadmap complete! You&apos;re ready to land that role.
                </div>
            )}
        </div>
    );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function RoadmapSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: "flex", gap: "20px", opacity: 1 - i * 0.15 }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "rgba(148,163,184,0.08)",
                            flexShrink: 0,
                            animation: "pulse-skeleton 1.5s ease-in-out infinite",
                        }}
                    />
                    <div
                        style={{
                            flex: 1,
                            height: "110px",
                            borderRadius: "14px",
                            background: "rgba(148,163,184,0.06)",
                            border: "1px solid rgba(148,163,184,0.08)",
                            animation: "pulse-skeleton 1.5s ease-in-out infinite",
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
    const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
    const [customGaps, setCustomGaps] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
    const [completed, setCompleted] = useState<Set<number>>(new Set());
    const resultsRef = useRef<HTMLDivElement>(null);

    // Load completed weeks from localStorage when roadmap changes
    useEffect(() => {
        if (!roadmap) return;
        const raw = localStorage.getItem(LS_KEY(roadmap.target_role));
        if (raw) {
            try {
                setCompleted(new Set(JSON.parse(raw) as number[]));
            } catch {
                setCompleted(new Set());
            }
        } else {
            setCompleted(new Set());
        }
    }, [roadmap]);

    const toggleWeek = (weekNum: number) => {
        if (!roadmap) return;
        setCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(weekNum)) {
                next.delete(weekNum);
            } else {
                next.add(weekNum);
            }
            // Persist to localStorage
            localStorage.setItem(
                LS_KEY(roadmap.target_role),
                JSON.stringify([...next])
            );
            return next;
        });
    };

    const handleGenerate = async () => {
        setStatus("loading");
        setError(null);
        setRoadmap(null);

        // Build skill_gaps list from custom input or sensible defaults
        const gapsRaw = customGaps.trim();
        const skillGaps = gapsRaw
            ? gapsRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : ["Core programming concepts", "System design", "Industry tools"];

        try {
            const result = await generateRoadmap(selectedRole, skillGaps);
            setRoadmap(result);
            setStatus("done");
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 200);
        } catch (err) {
            setStatus("error");
            const msg = err instanceof Error ? err.message : "Failed to generate roadmap.";
            setError(msg.includes("timeout") ? "Request timed out — the AI took too long. Try again." : msg);
        }
    };

    return (
        <>
            {/* Skeleton keyframe injected inline */}
            <style>{`
                @keyframes pulse-skeleton {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>

            <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
                <Sidebar />

                <main
                    style={{
                        marginLeft: "240px",
                        flex: 1,
                        padding: "32px",
                        maxWidth: "calc(100vw - 240px)",
                    }}
                >
                    {/* ── Page Header ──────────────────────────────────────── */}
                    <div style={{ marginBottom: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))",
                                    border: "1px solid rgba(139,92,246,0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Map size={18} color="#a78bfa" />
                            </div>
                            <h1
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "1.8rem",
                                    fontWeight: 700,
                                    color: "#f1f5f9",
                                }}
                            >
                                Career Roadmap
                            </h1>
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: "14px", paddingLeft: "52px" }}>
                            Get a personalized 6-week learning plan built by the AI Career Coach agent.
                        </p>
                    </div>

                    {/* ── Generator Card ───────────────────────────────────── */}
                    <div
                        className="glass"
                        style={{
                            padding: "28px",
                            marginBottom: "32px",
                            background: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(59,130,246,0.04))",
                            border: "1px solid rgba(139,92,246,0.15)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                            <Sparkles size={16} color="#a78bfa" />
                            <p
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "0.95rem",
                                    fontWeight: 600,
                                    color: "#f1f5f9",
                                }}
                            >
                                Configure Your Roadmap
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: "16px",
                                marginBottom: "20px",
                            }}
                        >
                            {/* Target Role dropdown */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#94a3b8",
                                        marginBottom: "8px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    Target Role
                                </label>
                                <select
                                    id="roadmap-role-select"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "11px 14px",
                                        borderRadius: "10px",
                                        background: "rgba(15,23,42,0.8)",
                                        border: "1px solid rgba(139,92,246,0.25)",
                                        color: "#f1f5f9",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        outline: "none",
                                        appearance: "none",
                                    }}
                                >
                                    {TARGET_ROLES.map((role) => (
                                        <option key={role} value={role} style={{ background: "#0f172a" }}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Skill gaps input */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#94a3b8",
                                        marginBottom: "8px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    Skill Gaps{" "}
                                    <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>
                                        (comma separated, optional)
                                    </span>
                                </label>
                                <input
                                    id="roadmap-gaps-input"
                                    type="text"
                                    value={customGaps}
                                    onChange={(e) => setCustomGaps(e.target.value)}
                                    placeholder="e.g. Docker, Kubernetes, CI/CD"
                                    style={{
                                        width: "100%",
                                        padding: "11px 14px",
                                        borderRadius: "10px",
                                        background: "rgba(15,23,42,0.8)",
                                        border: "1px solid rgba(148,163,184,0.12)",
                                        color: "#f1f5f9",
                                        fontSize: "14px",
                                        outline: "none",
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onFocus={(e) =>
                                        (e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)")
                                    }
                                    onBlur={(e) =>
                                        (e.currentTarget.style.borderColor = "rgba(148,163,184,0.12)")
                                    }
                                />
                            </div>
                        </div>

                        {/* Generate button */}
                        <button
                            id="roadmap-generate-btn"
                            className="btn-glow"
                            onClick={handleGenerate}
                            disabled={status === "loading"}
                            style={{
                                padding: "13px 28px",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: status === "loading" ? "not-allowed" : "pointer",
                                opacity: status === "loading" ? 0.7 : 1,
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {status === "loading" ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            style={{ animation: "spin 1s linear infinite" }}
                                        />
                                        AI is building your roadmap…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={15} />
                                        Generate My Roadmap
                                    </>
                                )}
                            </span>
                        </button>

                        {status === "loading" && (
                            <p
                                style={{
                                    marginTop: "12px",
                                    fontSize: "12px",
                                    color: "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <Circle size={8} color="#818cf8" style={{ animation: "pulse-skeleton 1s ease-in-out infinite" }} />
                                Career Coach agent is crafting your plan… (~15-25 seconds)
                            </p>
                        )}
                    </div>

                    {/* ── Error ─────────────────────────────────────────────── */}
                    {status === "error" && error && (
                        <div
                            style={{
                                padding: "14px 18px",
                                borderRadius: "12px",
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                color: "#f87171",
                                fontSize: "13px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                marginBottom: "24px",
                            }}
                        >
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                            {error}
                        </div>
                    )}

                    {/* ── Skeleton ──────────────────────────────────────────── */}
                    {status === "loading" && <RoadmapSkeleton />}

                    {/* ── Results ───────────────────────────────────────────── */}
                    {status === "done" && roadmap && (
                        <div ref={resultsRef}>
                            {/* Progress header */}
                            <ProgressHeader roadmap={roadmap} completed={completed} />

                            {/* Timeline */}
                            <div>
                                {roadmap.weeks.map((week, idx) => {
                                    const color = WEEK_COLORS[idx % WEEK_COLORS.length];
                                    return (
                                        <WeekCard
                                            key={week.week}
                                            week={week}
                                            color={color}
                                            isLast={idx === roadmap.weeks.length - 1}
                                            completed={completed.has(week.week)}
                                            onToggle={() => toggleWeek(week.week)}
                                            animDelay={idx * 120}
                                        />
                                    );
                                })}
                            </div>

                            {/* Footer note */}
                            <div
                                style={{
                                    marginTop: "24px",
                                    padding: "14px 18px",
                                    borderRadius: "12px",
                                    background: "rgba(59,130,246,0.05)",
                                    border: "1px solid rgba(59,130,246,0.12)",
                                    fontSize: "12px",
                                    color: "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <CheckCircle2 size={13} color="#3b82f6" />
                                Progress is saved automatically in your browser. Click week circles to mark complete.
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
