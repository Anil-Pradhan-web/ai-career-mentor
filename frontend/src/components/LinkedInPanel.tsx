"use client";

import React, { useState } from "react";
import { LinkedInStrategy } from "@/types";
import { Briefcase, Award, Zap, FileText, Check, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

interface Props {
    strategy: LinkedInStrategy;
}

export default function LinkedInPanel({ strategy }: Props) {
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [copiedTemplate, setCopiedTemplate] = useState(false);
    const [copiedPost, setCopiedPost] = useState(false);

    if (!strategy) return null;

    const outreachTemplates = strategy.outreach_templates || [];
    const currentTemplate = outreachTemplates[selectedTemplate];
    const postDraft = strategy.featured_post_draft;

    const copyOutreach = () => {
        if (!currentTemplate) return;
        const text = `Subject: ${currentTemplate.subject}\n\n${currentTemplate.message}`;
        navigator.clipboard.writeText(text);
        setCopiedTemplate(true);
        toast.success("Outreach DM copied to clipboard!");
        setTimeout(() => setCopiedTemplate(false), 2000);
    };

    const copyPost = () => {
        if (!postDraft) return;
        const text = postDraft.full_formatted_post || [
            postDraft.hook,
            postDraft.problem,
            postDraft.stack_and_architecture,
            postDraft.results_and_metrics,
            postDraft.call_to_action,
        ].filter(Boolean).join("\n\n");

        navigator.clipboard.writeText(text);
        setCopiedPost(true);
        toast.success("Viral post draft copied to clipboard!");
        setTimeout(() => setCopiedPost(false), 2000);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-up">
            {/* Headlines & Demanding Skills Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                {/* Headlines */}
                <div className="glass" style={{ padding: "28px", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(10,102,194,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Briefcase size={18} color="#0a66c2" />
                        </div>
                        <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.1rem", fontWeight: 700 }}>Optimized Headlines</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {strategy.headlines?.map((h, i) => (
                            <div key={i} style={{ padding: "14px", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--fg-primary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                                {h}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Skills */}
                    <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                            <Zap size={16} color="var(--accent-amber)" />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>High-Frequency Recruiter Skills</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {strategy.demanding_skills?.map((s, i) => (
                                <span key={i} style={{ padding: "5px 12px", borderRadius: "100px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "var(--accent-amber)", fontSize: "0.8rem", fontWeight: 600 }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Certs & ATS Keywords */}
                    <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                            <Award size={16} color="var(--accent-emerald)" />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Recommended Certifications</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {strategy.certifications?.map((c, i) => (
                                <div key={i} style={{ color: "var(--accent-emerald)", fontSize: "0.85rem" }}>• {c}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Outreach DM Templates */}
            {outreachTemplates.length > 0 && (
                <div className="glass" style={{ padding: "28px", borderRadius: "var(--radius-xl)", border: "1px solid rgba(59,130,246,0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Send size={18} color="var(--brand)" />
                            </div>
                            <div>
                                <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.1rem", fontWeight: 700 }}>
                                    Targeted Cold Outreach DM Templates
                                </h3>
                                <p style={{ fontSize: "12px", color: "var(--fg-muted)" }}>Pre-crafted messages designed for 40%+ reply rates</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {outreachTemplates.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedTemplate(idx)}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        border: selectedTemplate === idx ? "1px solid var(--brand)" : "1px solid var(--border-subtle)",
                                        background: selectedTemplate === idx ? "rgba(59,130,246,0.15)" : "var(--bg-surface)",
                                        color: selectedTemplate === idx ? "var(--brand-light)" : "var(--fg-muted)",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    {t.target || `Template ${idx + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {currentTemplate && (
                        <div style={{ padding: "18px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase" }}>Target Audience</span>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand-light)" }}>{currentTemplate.target}</p>
                                </div>
                                <button
                                    onClick={copyOutreach}
                                    className="btn btn-ghost"
                                    style={{ padding: "6px 14px", fontSize: "12px", height: "auto", display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    {copiedTemplate ? <Check size={14} color="var(--accent-emerald)" /> : <Send size={14} />}
                                    {copiedTemplate ? "Copied" : "Copy Template"}
                                </button>
                            </div>
                            <div>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase" }}>Subject Line</span>
                                <p style={{ fontSize: "13px", color: "var(--fg-primary)", fontWeight: 500 }}>{currentTemplate.subject}</p>
                            </div>
                            <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
                                <p style={{ fontSize: "13px", color: "var(--fg-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{currentTemplate.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Viral Project Showcase Post Draft */}
            {postDraft && (
                <div className="glass" style={{ padding: "28px", borderRadius: "var(--radius-xl)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Sparkles size={18} color="var(--accent-purple)" />
                            </div>
                            <div>
                                <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.1rem", fontWeight: 700 }}>
                                    Viral Project Showcase Post Draft
                                </h3>
                                <p style={{ fontSize: "12px", color: "var(--fg-muted)" }}>Framework: Hook → Problem → Tech Stack & Architecture → Metrics → Call to Action</p>
                            </div>
                        </div>
                        <button
                            onClick={copyPost}
                            className="btn btn-ghost"
                            style={{ padding: "6px 14px", fontSize: "12px", height: "auto", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            {copiedPost ? <Check size={14} color="var(--accent-emerald)" /> : <Send size={14} />}
                            {copiedPost ? "Copied" : "Copy Post Draft"}
                        </button>
                    </div>

                    <div style={{ padding: "18px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {postDraft.full_formatted_post ? (
                            <p style={{ fontSize: "13px", color: "var(--fg-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                {postDraft.full_formatted_post}
                            </p>
                        ) : (
                            <>
                                {postDraft.hook && <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--fg-primary)" }}>{postDraft.hook}</p>}
                                {postDraft.problem && <p style={{ fontSize: "13px", color: "var(--fg-secondary)" }}>{postDraft.problem}</p>}
                                {postDraft.stack_and_architecture && (
                                    <div style={{ padding: "10px 14px", background: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "12.5px", color: "var(--brand-light)" }}>
                                        {postDraft.stack_and_architecture}
                                    </div>
                                )}
                                {postDraft.results_and_metrics && <p style={{ fontSize: "13px", color: "var(--accent-emerald)", fontWeight: 500 }}>📈 {postDraft.results_and_metrics}</p>}
                                {postDraft.call_to_action && <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontStyle: "italic" }}>{postDraft.call_to_action}</p>}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* About Section */}
            <div className="glass" style={{ padding: "28px", borderRadius: "var(--radius-xl)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={18} color="var(--accent-purple)" />
                    </div>
                    <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.1rem", fontWeight: 700 }}>About Bio Section</h3>
                </div>
                <div className="markdown-content" style={{ color: "var(--fg-secondary)", fontSize: "0.95rem", lineHeight: 1.8, background: "var(--bg-surface)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
                    <ReactMarkdown>{strategy.about_section || ""}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
