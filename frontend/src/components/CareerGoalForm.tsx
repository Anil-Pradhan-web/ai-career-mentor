"use client";

import { useState } from "react";
import { Target, Loader2, ArrowRight } from "lucide-react";

const POPULAR_ROLES = [
    "Full Stack Developer",
    "Data Scientist",
    "ML Engineer",
    "Cloud Architect",
    "DevOps Engineer",
    "Product Manager",
    "UI/UX Designer",
    "Backend Developer",
];

interface Props {
    onSubmit?: (role: string) => void;
}

export default function CareerGoalForm({ onSubmit }: Props) {
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) return;
        setLoading(true);
        // Will hook to actual API (Day 4 — roadmap generation)
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            onSubmit?.(role);
        }, 800);
    };

    return (
        <div
            className="glass"
            style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}
        >
            {/* Header */}
            <div>
                <h3
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "#f1f5f9",
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Target size={18} color="#8b5cf6" />
                    Set Your Career Goal
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                    Tell us your target role — we'll build your personalized roadmap
                </p>
            </div>

            {submitted ? (
                <div
                    style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(139,92,246,0.1)",
                        border: "1px solid rgba(139,92,246,0.25)",
                        textAlign: "center",
                    }}
                >
                    <p style={{ color: "#a78bfa", fontWeight: 600, marginBottom: "4px" }}>
                        🎯 Goal Set: {role}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                        Roadmap generation ready (Day 4)
                    </p>
                    <button
                        onClick={() => { setSubmitted(false); setRole(""); }}
                        style={{
                            marginTop: "12px",
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "12px",
                            textDecoration: "underline",
                        }}
                    >
                        Change goal
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Input */}
                    <div style={{ position: "relative" }}>
                        <input
                            id="career-goal-input"
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Full Stack Developer, Data Scientist..."
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                background: "rgba(15,23,42,0.6)",
                                border: "1px solid rgba(148,163,184,0.15)",
                                borderRadius: "10px",
                                color: "#f1f5f9",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s",
                                boxSizing: "border-box",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.15)")}
                        />
                    </div>

                    {/* Popular roles */}
                    <div>
                        <p style={{ fontSize: "12px", color: "#475569", marginBottom: "8px" }}>
                            Popular roles:
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {POPULAR_ROLES.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    id={`role-chip-${r.toLowerCase().replace(/\s+/g, "-")}`}
                                    onClick={() => setRole(r)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: "100px",
                                        fontSize: "12px",
                                        background:
                                            role === r ? "rgba(139,92,246,0.2)" : "rgba(148,163,184,0.05)",
                                        border:
                                            role === r ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(148,163,184,0.1)",
                                        color: role === r ? "#a78bfa" : "#94a3b8",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        id="career-goal-submit-btn"
                        type="submit"
                        disabled={!role.trim() || loading}
                        className="btn-glow"
                        style={{
                            padding: "12px",
                            fontSize: "14px",
                            opacity: !role.trim() || loading ? 0.5 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {loading ? (
                                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Setting goal...</>
                            ) : (
                                <>Generate My Roadmap <ArrowRight size={16} /></>
                            )}
                        </span>
                    </button>
                </form>
            )}
        </div>
    );
}
