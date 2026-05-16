"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from "lucide-react";
import { analyzeResume } from "@/services/api";
import type { ResumeAnalysis } from "@/types";

interface Props {
    onAnalysisComplete?: (analysis: ResumeAnalysis, filename: string) => void;
}

type Status = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function UploadResumeCard({ onAnalysisComplete }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted.length === 0) return;
        setFile(accepted[0]);
        setStatus("idle");
        setError(null);
        setProgress(0);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
    });

    const removeFile = () => {
        setFile(null);
        setStatus("idle");
        setError(null);
        setProgress(0);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setError(null);

        // ── Stage 1: Uploading ────────────────────────────────────────────────
        setStatus("uploading");
        setProgress(20);

        try {
            // ── Stage 2: AI Analyzing ─────────────────────────────────────────
            setStatus("analyzing");

            // Fake progress animation while LLM runs (10-20s)
            const progressInterval = setInterval(() => {
                setProgress((p) => (p < 88 ? p + 4 : p));
            }, 800);

            const result = await analyzeResume(file);

            clearInterval(progressInterval);
            setProgress(100);
            setStatus("done");

            // Lift analysis result to parent (dashboard page)
            onAnalysisComplete?.(result.analysis, result.filename);
        } catch (err: unknown) {
            setStatus("error");
            setProgress(0);
            const msg =
                err instanceof Error
                    ? err.message
                    : "Failed to analyze resume. Please try again.";
            setError(msg.includes("422") ? "Could not extract text — make sure PDF is not scanned." : msg);
        }
    };

    const isLoading = status === "uploading" || status === "analyzing";

    return (
        <div
            style={{ 
                padding: "32px", display: "flex", flexDirection: "column", gap: "24px",
                background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}
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
                    }}
                >
                    📄 Upload Your Resume
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                    PDF only · Max 5MB · AI analysis in ~15 seconds
                </p>
            </div>

            {/* Drop Zone */}
            {!file ? (
                <div
                    {...getRootProps()}
                    id="resume-dropzone"
                    style={{
                        border: `2px dashed ${isDragActive ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "16px",
                        padding: "48px 24px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: isDragActive ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(129,140,248,0.5)";
                        e.currentTarget.style.background = "rgba(129,140,248,0.05)";
                    }}
                    onMouseLeave={(e) => {
                        if (!isDragActive) {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        }
                    }}
                >
                    <input {...getInputProps()} />
                    <Upload
                        size={36}
                        color={isDragActive ? "#818cf8" : "#475569"}
                        style={{ margin: "0 auto 12px" }}
                    />
                    <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "6px" }}>
                        {isDragActive ? (
                            <span style={{ color: "#818cf8", fontWeight: 600 }}>Drop it here!</span>
                        ) : (
                            <>
                                <span style={{ color: "#c7d2fe", fontWeight: 500 }}>Click to upload</span>{" "}
                                or drag &amp; drop
                            </>
                        )}
                    </p>
                    <p style={{ fontSize: "12px", color: "#475569" }}>PDF files only</p>
                </div>
            ) : (
                /* File Preview */
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(129,140,248,0.08)",
                        border: "1px solid rgba(129,140,248,0.2)",
                    }}
                >
                    <FileText size={24} color="#818cf8" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                            style={{
                                color: "#f1f5f9",
                                fontSize: "14px",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {file.name}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                            {(file.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                    {status === "done" ? (
                        <CheckCircle size={20} color="#10b981" />
                    ) : (
                        !isLoading && (
                            <button
                                onClick={removeFile}
                                id="resume-remove-btn"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#64748b",
                                    padding: "4px",
                                    borderRadius: "6px",
                                    display: "flex",
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                            >
                                <X size={18} />
                            </button>
                        )
                    )}
                </div>
            )}

            {/* Progress Bar & Loading State */}
            {isLoading && (
                <div 
                    className="animate-pulse-glow"
                    style={{ 
                        display: "flex", flexDirection: "column", gap: "24px",
                        padding: "40px", background: "rgba(15, 23, 42, 0.2)",
                        borderRadius: "20px", border: "1px dashed rgba(99, 102, 241, 0.2)"
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <Loader2 size={40} className="animate-spin" style={{ marginBottom: "16px", color: "#6366f1" }} />
                        <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "8px" }}>
                            {status === "uploading" ? "Uploading Document..." : "AI Agent is Analyzing..."}
                        </h4>
                        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
                            {status === "uploading" 
                                ? "Securing your data in our encrypted cloud..." 
                                : "Llama-3.3-70B is extracting skills, gaps & strengths from your resume."}
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>ANALYSIS PROGRESS</span>
                            <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: 700 }}>{progress}%</span>
                        </div>
                        <div style={{ height: "6px", borderRadius: "100px", background: "rgba(129,140,248,0.1)", overflow: "hidden" }}>
                            <div
                                style={{
                                    height: "100%",
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #6366f1, #a855f7)",
                                    borderRadius: "100px",
                                    transition: "width 0.6s ease",
                                    boxShadow: "0 0 10px rgba(99,102,241,0.3)"
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Analyze Button */}
            {file && status !== "done" && !isLoading && (
                <button
                    id="resume-analyze-btn"
                    className="btn-glow"
                    onClick={handleAnalyze}
                    style={{
                        padding: "12px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                    }}
                >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        🤖 Analyze My Resume
                    </span>
                </button>
            )}

            {/* Success Banner */}
            {status === "done" && (
                <div
                    style={{
                        padding: "12px 16px",
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
                    <CheckCircle size={16} />
                    Resume analyzed! Scroll down to see your results.
                </div>
            )}

            {/* Error Banner */}
            {status === "error" && error && (
                <div
                    style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "#f87171",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                    }}
                >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
