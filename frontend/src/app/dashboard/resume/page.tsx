"use client";

import { useState } from "react";
import { FileText, Zap } from "lucide-react";
import UploadResumeCard from "@/components/UploadResumeCard";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import ModelSelector from "@/components/ModelSelector";
import { ResumeAnalysis } from "@/types";

export default function ResumePage() {
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [analyzedFilename, setAnalyzedFilename] = useState<string>("");

    const handleAnalysisComplete = (result: ResumeAnalysis, filename: string) => {
        setAnalysis(result);
        setAnalyzedFilename(filename);
        // Smooth scroll to analysis panel after a short delay
        setTimeout(() => {
            document.getElementById("analysis-panel")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 300);
    };

    return (
        <main
            style={{
                flex: 1,
                padding: "48px",
                width: "100%",
                position: "relative",
                zIndex: 1
            }}
        >
            <div style={{ paddingLeft: "50px" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FileText size={24} color="#818cf8" />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "2.2rem",
                                    fontWeight: 800,
                                    color: "#f8fafc",
                                    marginBottom: "4px",
                                    letterSpacing: "-0.02em"
                                }}
                            >
                                Resume Analyzer
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "600px" }}>
                                    Let our AI agent scan your resume and identify strengths, skills, and areas for improvement.
                                </p>
                                <ModelSelector />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Upload Card ─────────────────────────────── */}
                <div className="animate-fade-up-delay-1" style={{ marginBottom: "40px", maxWidth: "800px" }}>
                    <UploadResumeCard onAnalysisComplete={handleAnalysisComplete} />
                </div>

                {/* ── Analysis Panel ────────── */}
                {analysis && (
                    <div id="analysis-panel" className="animate-fade-up" style={{ marginTop: "16px", marginBottom: "40px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                marginBottom: "32px",
                            }}
                        >
                            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(148,163,184,0.2))" }} />
                            <span
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#94a3b8",
                                    whiteSpace: "nowrap",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                <Zap size={14} color="#6366f1" />
                                Resume Analysis Detailed Breakdown
                            </span>
                            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(148,163,184,0.2))" }} />
                        </div>

                        <ResumeAnalysisPanel analysis={analysis} filename={analyzedFilename} />
                    </div>
                )}
            </div>
        </main>
    );
}
