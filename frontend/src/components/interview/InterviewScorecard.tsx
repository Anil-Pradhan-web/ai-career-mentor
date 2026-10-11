"use client";

import React, { useState } from "react";
import {
    Award, CheckCircle2, AlertCircle, Sparkles, RotateCcw,
    ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Zap,
    BookOpen, ExternalLink, HelpCircle
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface QuestionReviewItem {
    question_number: number;
    question: string;
    score: number;
    candidate_takeaway?: string;
    gold_standard_answer?: string;
}

interface ScorecardData {
    overall_score: number;
    hiring_verdict?: string;
    executive_summary?: string;
    category_scores?: {
        technical_depth?: number;
        problem_solving?: number;
        communication?: number;
        culture_fit?: number;
    };
    strengths?: string[];
    improvements?: string[];
    advice?: string[];
    question_reviews?: QuestionReviewItem[];
}

interface Props {
    score: number | null;
    rawFeedback: string;
    scorecardData?: ScorecardData | null;
    role: string;
    companyName: string;
    onRetake: () => void;
    onViewHistory: () => void;
}

export default function InterviewScorecard({
    score,
    rawFeedback,
    scorecardData,
    role,
    companyName,
    onRetake,
    onViewHistory
}: Props) {
    const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({ 1: true });

    const toggleQuestion = (num: number) => {
        setOpenQuestions(prev => ({ ...prev, [num]: !prev[num] }));
    };

    const finalScore = score !== null ? Math.round(score) : (scorecardData?.overall_score ? Math.round(scorecardData.overall_score) : 75);

    // Extract verdict
    let verdict = scorecardData?.hiring_verdict;
    if (!verdict) {
        if (finalScore >= 88) verdict = "Strong Hire";
        else if (finalScore >= 75) verdict = "Hire";
        else if (finalScore >= 65) verdict = "Leaning Hire";
        else if (finalScore >= 50) verdict = "Leaning No Hire";
        else verdict = "No Hire";
    }

    const getVerdictColor = (v: string) => {
        if (v === "Strong Hire") return { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)", color: "var(--accent-emerald)" };
        if (v === "Hire") return { bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.3)", color: "var(--accent-cyan)" };
        if (v === "Leaning Hire") return { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)", color: "var(--accent-amber)" };
        if (v === "Leaning No Hire") return { bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.3)", color: "#f97316" };
        return { bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.3)", color: "var(--accent-rose)" };
    };

    const verdictStyle = getVerdictColor(verdict);

    const categories = [
        { label: "Technical Depth & Foundations", score: Math.round(scorecardData?.category_scores?.technical_depth ?? finalScore), color: "var(--brand)" },
        { label: "Problem Solving & Complexity", score: Math.round(scorecardData?.category_scores?.problem_solving ?? finalScore), color: "var(--accent-purple)" },
        { label: "Structured Communication", score: Math.round(scorecardData?.category_scores?.communication ?? Math.min(100, finalScore + 5)), color: "var(--accent-cyan)" },
        { label: "Company & Principle Alignment", score: Math.round(scorecardData?.category_scores?.culture_fit ?? finalScore), color: "var(--accent-amber)" },
    ];

    const strengths = scorecardData?.strengths?.length ? scorecardData.strengths : [
        "Sound foundational problem decomposition",
        "Clear articulation of core implementation logic",
        "Good awareness of edge case possibilities"
    ];

    const improvements = scorecardData?.improvements?.length ? scorecardData.improvements : [
        "Deepen space and time complexity trade-off explanations",
        "Structure multi-tier architecture components more explicitly",
        "Address concurrency and memory footprint under high traffic"
    ];

    const advice = scorecardData?.advice?.length ? scorecardData.advice : [
        "Practice mock system design scenarios under time constraints",
        "Review database indexing and distributed caching patterns",
        "Frame behavioral scenarios using the STAR framework"
    ];

    return (
        <div className="animate-fade-up" style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "60px" }}>
            {/* Top Score & Verdict Hero Banner */}
            <div
                className="card"
                style={{
                    padding: "36px 32px",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-default)",
                    background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(59,130,246,0.04) 100%)",
                    marginBottom: "24px"
                }}
            >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-muted)" }}>
                                Mock Evaluation Scorecard
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>•</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand)" }}>
                                {companyName || "Top Tech Company"}
                            </span>
                        </div>
                        <h1 className="font-display" style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--fg-primary)", marginBottom: "6px" }}>
                            {role} Simulation Report
                        </h1>
                        <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)", maxWidth: "480px", lineHeight: 1.5 }}>
                            {scorecardData?.executive_summary || "Complete 360-degree candidate evaluation based on industry hiring rubrics and technical mastery."}
                        </p>
                    </div>

                    {/* Verdict & Score Pill */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                        <div style={{
                            padding: "8px 16px", borderRadius: "100px",
                            background: verdictStyle.bg, border: `1px solid ${verdictStyle.border}`,
                            color: verdictStyle.color, fontWeight: 800, fontSize: "0.9rem",
                            display: "flex", alignItems: "center", gap: "6px"
                        }}>
                            <ShieldCheck size={16} />
                            <span>{verdict}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                            <span style={{ fontSize: "2.75rem", fontWeight: 900, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>
                                {finalScore}
                            </span>
                            <span style={{ fontSize: "1.1rem", color: "var(--fg-muted)", fontWeight: 700 }}>
                                / 100
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Benchmarks Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="card"
                        style={{ padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}
                    >
                        <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", fontWeight: 600, marginBottom: "8px", minHeight: "32px" }}>
                            {cat.label}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--fg-primary)" }}>
                                {cat.score}%
                            </span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "var(--bg-elevated)", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ width: `${cat.score}%`, height: "100%", background: cat.color, borderRadius: "99px" }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Strengths & Improvements Columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {/* Strengths */}
                <div className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(16, 185, 129, 0.15)", background: "rgba(16, 185, 129, 0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", color: "var(--accent-emerald)" }}>
                        <CheckCircle2 size={18} />
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg-primary)" }}>Demonstrated Strengths</h3>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {strengths.map((s, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.825rem", color: "var(--fg-secondary)", lineHeight: 1.4 }}>
                                <span style={{ color: "var(--accent-emerald)", fontWeight: 700, marginTop: "2px" }}>✓</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Growth Areas */}
                <div className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(245, 158, 11, 0.15)", background: "rgba(245, 158, 11, 0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", color: "var(--accent-amber)" }}>
                        <AlertCircle size={18} />
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg-primary)" }}>Growth Opportunities</h3>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {improvements.map((imp, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.825rem", color: "var(--fg-secondary)", lineHeight: 1.4 }}>
                                <span style={{ color: "var(--accent-amber)", fontWeight: 700, marginTop: "2px" }}>•</span>
                                <span>{imp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Question-by-Question Gold-Standard Review Accordion */}
            {scorecardData?.question_reviews && scorecardData.question_reviews.length > 0 && (
                <div className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <Sparkles size={18} style={{ color: "var(--brand)" }} />
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--fg-primary)" }}>
                            Question-by-Question Gold-Standard Review
                        </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {scorecardData.question_reviews.map((qr) => {
                            const isOpen = !!openQuestions[qr.question_number];
                            return (
                                <div
                                    key={qr.question_number}
                                    style={{
                                        border: "1px solid var(--border-subtle)",
                                        borderRadius: "var(--radius-md)",
                                        background: "var(--bg-surface)",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div
                                        onClick={() => toggleQuestion(qr.question_number)}
                                        style={{
                                            padding: "14px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",
                                            background: isOpen ? "var(--bg-elevated)" : "transparent"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{
                                                fontSize: "0.75rem", fontWeight: 800, padding: "2px 8px",
                                                borderRadius: "4px", background: "var(--brand-glow)", color: "var(--brand)"
                                            }}>
                                                Q{qr.question_number}
                                            </span>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--fg-primary)" }}>
                                                {qr.question || `Question ${qr.question_number}`}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-muted)" }}>
                                                {qr.score}%
                                            </span>
                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                            {qr.candidate_takeaway && (
                                                <div>
                                                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                                                        Assessment Notes
                                                    </div>
                                                    <p style={{ fontSize: "0.825rem", color: "var(--fg-secondary)", lineHeight: 1.45 }}>
                                                        {qr.candidate_takeaway}
                                                    </p>
                                                </div>
                                            )}

                                            {qr.gold_standard_answer && (
                                                <div style={{
                                                    padding: "14px",
                                                    background: "rgba(59, 130, 246, 0.05)",
                                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                                    borderRadius: "8px"
                                                }}>
                                                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <Zap size={12} />
                                                        <span>Staff-Engineer Gold-Standard Model Answer</span>
                                                    </div>
                                                    <p style={{ fontSize: "0.825rem", color: "var(--fg-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                                        {qr.gold_standard_answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actionable Advice & Next Steps */}
            <div className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", marginBottom: "30px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <BookOpen size={18} style={{ color: "var(--accent-purple)" }} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg-primary)" }}>Recommended Preparation Steps</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                    {advice.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.825rem", color: "var(--fg-secondary)" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-purple)" }} />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <Link
                        href="/dashboard/roadmap"
                        className="btn btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}
                    >
                        <span>Practice Target Topics in Roadmap</span>
                        <ArrowRight size={14} />
                    </Link>
                    <button
                        onClick={onRetake}
                        className="btn btn-secondary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600 }}
                    >
                        <RotateCcw size={14} />
                        <span>Retake / New Simulation</span>
                    </button>
                    <button
                        onClick={onViewHistory}
                        className="btn btn-ghost"
                        style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}
                    >
                        View Past Sessions
                    </button>
                </div>
            </div>

            {/* Fallback Markdown Report Accordion (if user wants to view raw text) */}
            {rawFeedback && (
                <details style={{ fontSize: "0.8rem", color: "var(--fg-muted)", cursor: "pointer" }}>
                    <summary style={{ marginBottom: "10px" }}>View Raw Feedback Transcript Report</summary>
                    <div className="card markdown-content" style={{ padding: "20px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
                        <ReactMarkdown>{rawFeedback}</ReactMarkdown>
                    </div>
                </details>
            )}
        </div>
    );
}
