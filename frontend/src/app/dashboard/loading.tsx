"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "70vh", width: "100%",
            background: "var(--bg-base)",
        }}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Glow behind loader */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(91,110,248,0.2)",
                    filter: "blur(50px)",
                    borderRadius: "50%",
                }} />

                {/* Loader icon */}
                <Loader2 size={48} color="#818cf8" style={{ animation: "spin 1s linear infinite", position: "relative", zIndex: 1 }} />

                <h3 style={{
                    marginTop: "24px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    position: "relative", zIndex: 1,
                }} className="gradient-text">
                    Initializing AI Agents...
                </h3>

                <p style={{
                    marginTop: "8px",
                    color: "var(--text-muted)",
                    fontSize: "0.88rem",
                    position: "relative", zIndex: 1,
                }}>
                    Preparing your fully personalized career dashboard
                </p>

                {/* Skeletons to mimic dashboard layout */}
                <div style={{
                    width: "100%", maxWidth: "700px",
                    display: "flex", flexDirection: "column", gap: "16px",
                    marginTop: "48px", opacity: 0.5,
                }}>
                    <div className="skeleton" style={{ height: "96px", width: "100%", borderRadius: "16px" }} />
                    <div style={{ display: "flex", gap: "16px" }}>
                        <div className="skeleton" style={{ height: "160px", flex: 1, borderRadius: "16px" }} />
                        <div className="skeleton" style={{ height: "160px", flex: 1, borderRadius: "16px" }} />
                        <div className="skeleton" style={{ height: "160px", flex: 1, borderRadius: "16px" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
