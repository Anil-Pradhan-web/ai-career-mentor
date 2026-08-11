import React from "react";
import { LinkedInStrategy } from "@/types";
import { Briefcase, Award, Zap, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
    strategy: LinkedInStrategy;
}

export default function LinkedInPanel({ strategy }: Props) {
    if (!strategy) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Headlines */}
                <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "rgba(10,102,194,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Briefcase size={20} color="#0a66c2" />
                        </div>
                        <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.2rem", fontWeight: 700 }}>Optimized Headlines</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {strategy.headlines?.map((h, i) => (
                            <div key={i} style={{ padding: "16px", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--fg-primary)", fontSize: "0.95rem" }}>
                                {h}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Skills */}
                    <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                            <Zap size={18} color="var(--accent-amber)" />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Demanding Skills</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {strategy.demanding_skills?.map((s, i) => (
                                <span key={i} style={{ padding: "6px 14px", borderRadius: "100px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "var(--accent-amber)", fontSize: "0.85rem", fontWeight: 600 }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Certs & ATS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <Award size={18} color="var(--accent-emerald)" />
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Certifications</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {strategy.certifications?.map((c, i) => (
                                    <div key={i} style={{ color: "var(--accent-emerald)", fontSize: "0.85rem" }}>• {c}</div>
                                ))}
                            </div>
                        </div>
                        {strategy.ats_keywords_to_inject && strategy.ats_keywords_to_inject.length > 0 && (
                            <div className="glass" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                    <Zap size={18} color="var(--accent-rose)" />
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>High-Impact ATS Keywords</span>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {strategy.ats_keywords_to_inject.map((s, i) => (
                                        <span key={i} style={{ padding: "6px 14px", borderRadius: "100px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--accent-rose)", fontSize: "0.85rem", fontWeight: 600 }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recruiter Trends & Profile Density */}
            {strategy.recruiter_search_trends && strategy.recruiter_search_trends.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Briefcase size={20} color="var(--brand)" />
                            </div>
                            <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.2rem", fontWeight: 700 }}>Recruiter Search Trends</h3>
                        </div>
                        <ul style={{ color: "var(--fg-secondary)", fontSize: "0.95rem", paddingLeft: "20px" }}>
                            {strategy.recruiter_search_trends.map((t, i) => <li key={i} style={{ marginBottom: "8px" }}>{t}</li>)}
                        </ul>
                    </div>
                    <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={20} color="var(--accent-amber)" />
                            </div>
                            <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.2rem", fontWeight: 700 }}>Profile Density Advice</h3>
                        </div>
                        <p style={{ color: "var(--fg-secondary)", fontSize: "1rem", lineHeight: 1.6 }}>
                            {strategy.profile_density_advice}
                        </p>
                    </div>
                </div>
            )}

            {/* About */}
            <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-xl)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={20} color="var(--accent-purple)" />
                    </div>
                    <h3 className="font-display" style={{ color: "var(--fg-primary)", fontSize: "1.2rem", fontWeight: 700 }}>About Section</h3>
                </div>
                <div className="markdown-content" style={{ color: "var(--fg-secondary)", fontSize: "1.05rem", lineHeight: 1.8, background: "var(--bg-surface)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
                    <ReactMarkdown>{strategy.about_section || ""}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
