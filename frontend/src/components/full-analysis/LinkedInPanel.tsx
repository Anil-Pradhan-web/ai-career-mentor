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
                <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(10, 102, 194, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Briefcase size={20} color="#0a66c2" />
                        </div>
                        <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700 }}>Optimized Headlines</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {strategy.headlines?.map((h, i) => (
                            <div key={i} style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
                                {h}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Skills */}
                    <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                            <Zap size={18} color="#f59e0b" />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Demanding Skills</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {strategy.demanding_skills?.map((s, i) => (
                                <span key={i} style={{ padding: "6px 14px", borderRadius: "100px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 600 }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Certs */}
                    <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                            <Award size={18} color="#10b981" />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Certifications</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {strategy.certifications?.map((c, i) => (
                                <div key={i} style={{ color: "#34d399", fontSize: "0.85rem" }}>• {c}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* About */}
            <div style={{ padding: "32px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={20} color="#a855f7" />
                    </div>
                    <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700 }}>About Section</h3>
                </div>
                <div className="markdown-content" style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", lineHeight: 1.8, background: "rgba(255,255,255,0.02)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <ReactMarkdown>
                        {strategy.about_section || ""}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
