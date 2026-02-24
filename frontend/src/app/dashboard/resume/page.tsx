"use client";

import { useState } from "react";
import { FileText, Zap } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UploadResumeCard from "@/components/UploadResumeCard";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import type { ResumeAnalysis } from "@/types/resume";

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
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            {/* Dynamic Background Blobs */}
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    top: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />

            <Sidebar />

            {/* Main Content */}
            <main
                style={{
                    marginLeft: "240px",
                    flex: 1,
                    padding: "48px",
                    maxWidth: "calc(100vw - 240px)",
                    position: "relative",
                    zIndex: 1
                }}
            >
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
                                background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                                border: "1px solid rgba(59,130,246,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FileText size={24} color="#60a5fa" />
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
                            <p style={{ color: "#94a3b8", fontSize: "15px", maxWidth: "600px" }}>
                                Let our AI agent scan your resume and identify strengths, skills, and areas for improvement.
                            </p>
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
                                <Zap size={14} color="#60a5fa" />
                                Resume Analysis Detailed Breakdown
                            </span>
                            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(148,163,184,0.2))" }} />
                        </div>

                        <ResumeAnalysisPanel analysis={analysis} filename={analyzedFilename} />
                    </div>
                )}
            </main>
        </div>
    );
}
