"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import { analyzeResume } from "@/services/api";
import type { ResumeAnalysis } from "@/types/resume";

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
                        border: `2px dashed ${isDragActive ? "#818cf8" : "rgba(148,163,184,0.2)"}`,
                        borderRadius: "12px",
                        padding: "40px 24px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: isDragActive ? "rgba(129,140,248,0.05)" : "transparent",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(129,140,248,0.5)";
                        e.currentTarget.style.background = "rgba(129,140,248,0.03)";
                    }}
                    onMouseLeave={(e) => {
                        if (!isDragActive) {
                            e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
                            e.currentTarget.style.background = "transparent";
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

            {/* Progress Bar */}
            {isLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                            {status === "uploading" ? "⬆️ Uploading PDF..." : "🤖 AI is reading your resume..."}
                        </span>
                        <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: 600 }}>
                            {progress}%
                        </span>
                    </div>
                    <div
                        style={{
                            height: "6px",
                            borderRadius: "100px",
                            background: "rgba(129,140,248,0.15)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #3b82f6, #818cf8, #8b5cf6)",
                                borderRadius: "100px",
                                transition: "width 0.6s ease",
                            }}
                        />
                    </div>
                    <p style={{ fontSize: "12px", color: "#475569", textAlign: "center" }}>
                        Llama-3.3-70B is extracting skills, gaps &amp; strengths…
                    </p>
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
