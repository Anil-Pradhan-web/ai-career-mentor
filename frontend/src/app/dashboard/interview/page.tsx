"use client";

import { MessageSquare, Bot } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function InterviewPage() {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
            {/* Dynamic Background */}
            <div
                className="animate-pulse-glow"
                style={{
                    position: "absolute",
                    top: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />

            <Sidebar />

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
                <div
                    className="animate-fade-up"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "48px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(139,92,246,0.2))",
                                border: "1px solid rgba(16,185,129,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MessageSquare size={24} color="#34d399" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "4px" }}>
                                Mock Interview
                            </h1>
                            <p style={{ color: "#94a3b8", fontSize: "15px" }}>Practice with the live AutoGen AI Interviewer.</p>
                        </div>
                    </div>
                </div>

                <div className="glass animate-fade-up-delay-1" style={{ padding: "40px", textAlign: "center", borderRadius: "20px" }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16,185,129,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
                    }}>
                        <Bot size={40} color="#34d399" className="animate-float" />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "12px" }}>Coming Soon 🤖</h2>
                    <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto" }}>
                        The Mock Interview Agent (WebSockets) is scheduled for Day 7! Get ready to crush behavioral and coding rounds.
                    </p>
                </div>
            </main>
        </div>
    );
}
