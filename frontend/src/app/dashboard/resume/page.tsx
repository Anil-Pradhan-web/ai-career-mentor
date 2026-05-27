"use client";

import { useState } from "react";
import { FileText, Zap, Play } from "lucide-react";
import UploadResumeCard from "@/components/UploadResumeCard";
import ResumeAnalysisPanel from "@/components/ResumeAnalysisPanel";
import ModelSelector from "@/components/ModelSelector";
import { ResumeAnalysis } from "@/types";
import { useRouter } from "next/navigation";

export default function ResumePage() {
    const router = useRouter();
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
                                <ModelSelector allowedProviders={["nvidia", "groq", "google"]} />
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "6px", display: "flex", gap: "12px", alignItems: "center" }}>
                                <span>🤖 Default: <strong>NVIDIA NIM</strong></span>
                                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                                <span>⚙️ Allowed: NVIDIA, Groq, Google</span>
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
                        
                        {/* Practice CTA Banner */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "20px",
                            padding: "24px 32px",
                            marginBottom: "32px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "20px",
                            boxShadow: "0 10px 30px rgba(168, 85, 247, 0.1)"
                        }}>
                            <div>
                                <h3 style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "1.35rem",
                                    fontWeight: 700,
                                    color: "white",
                                    marginBottom: "4px"
                                }}>
                                    Practice your skills through our interview agent
                                </h3>
                                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>
                                    Your resume is analyzed! Start a tailored mock interview simulation now.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/interview")}
                                style={{
                                    padding: "14px 28px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)",
                                    color: "white",
                                    fontWeight: 700,
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    boxShadow: "0 8px 20px rgba(168,85,247,0.3)"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 25px rgba(168,85,247,0.4)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(168,85,247,0.3)"; }}
                            >
                                <Play size={16} fill="white" /> Start Interview
                            </button>
                        </div>

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
