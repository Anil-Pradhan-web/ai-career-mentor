"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, X, Loader2 } from "lucide-react";

interface Props {
    onUpload?: (file: File) => void;
}

export default function UploadResumeCard({ onUpload }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

    const onDrop = useCallback(
        (accepted: File[]) => {
            if (accepted.length === 0) return;
            const f = accepted[0];
            setFile(f);
            setStatus("idle");
            onUpload?.(f);
        },
        [onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5 MB
    });

    const removeFile = () => {
        setFile(null);
        setStatus("idle");
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
                    }}
                >
                    📄 Upload Your Resume
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                    PDF only · Max 5MB · AI will analyze in &lt;10 seconds
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
                    )}
                </div>
            )}

            {/* Analyze Button */}
            {file && status !== "done" && (
                <button
                    id="resume-analyze-btn"
                    className="btn-glow"
                    disabled={status === "uploading"}
                    style={{
                        padding: "12px",
                        fontSize: "14px",
                        opacity: status === "uploading" ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                    }}
                    onClick={() => {
                        setStatus("uploading");
                        // Will call actual API once backend endpoint is ready (Day 3)
                        setTimeout(() => setStatus("done"), 1500);
                    }}
                >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {status === "uploading" ? (
                            <>
                                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                Analyzing...
                            </>
                        ) : (
                            "🤖 Analyze Resume"
                        )}
                    </span>
                </button>
            )}

            {status === "done" && (
                <div
                    style={{
                        padding: "12px",
                        borderRadius: "10px",
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        color: "#34d399",
                        fontSize: "13px",
                        textAlign: "center",
                    }}
                >
                    ✅ Resume analyzed! See results below.
                </div>
            )}
        </div>
    );
}
