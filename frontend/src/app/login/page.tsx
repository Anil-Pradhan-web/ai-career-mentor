"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/api";
import { Lock, Mail, Loader2, ArrowRight, Brain, Sparkles, TrendingUp, MessageSquare, Map } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const features = [
    { icon: Sparkles, text: "AI-powered resume analysis" },
    { icon: TrendingUp, text: "Live market insights & salary data" },
    { icon: Map, text: "Personalised 6-week learning roadmaps" },
    { icon: MessageSquare, text: "Mock interviews with real-time feedback" },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.access_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Welcome back! 🎉");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            background: "#030712",
            fontFamily: "'Inter', sans-serif",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Animated blobs */}
            <div style={{ position: "absolute", top: "-200px", left: "-200px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", bottom: "-200px", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 10s ease-in-out infinite 2s", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", top: "40%", right: "35%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 12s ease-in-out infinite 4s", pointerEvents: "none", zIndex: 0 }} />

            {/* Left Panel — Branding */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px",
                position: "relative",
                zIndex: 1,
                borderRight: "1px solid rgba(255,255,255,0.05)",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "64px" }}>
                    <div style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(99,102,241,0.4)"
                    }}>
                        <Brain size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: "16px", color: "#f8fafc", letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>AI Career Mentor</div>
                        <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Powered by AutoGen</div>
                    </div>
                </div>

                <div style={{ maxWidth: "440px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "6px 14px", background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)", borderRadius: "100px",
                        marginBottom: "24px"
                    }}>
                        <Sparkles size={12} color="#818cf8" />
                        <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: 600 }}>Your AI-powered career coach</span>
                    </div>

                    <h1 style={{
                        fontSize: "3rem", fontWeight: 900, color: "#f8fafc",
                        lineHeight: 1.1, letterSpacing: "-0.04em",
                        fontFamily: "'Space Grotesk', sans-serif", marginBottom: "20px"
                    }}>
                        Launch your<br />
                        <span style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            dream career
                        </span>
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, marginBottom: "48px" }}>
                        Multi-agent AI system that analyzes your resume, maps the job market, and guides you every step of the way.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                                    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <f.icon size={16} color="#818cf8" />
                                </div>
                                <span style={{ color: "#cbd5e1", fontSize: "14px" }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div style={{
                width: "480px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 40px",
                position: "relative",
                zIndex: 1,
            }}>
                <div style={{
                    width: "100%",
                    background: "rgba(15,23,42,0.7)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "24px",
                    padding: "40px",
                    boxShadow: "0 32px 64px -12px rgba(0,0,0,0.7)",
                }}>
                    <div style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f8fafc", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
                            Sign in
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Don't have an account?{" "}
                            <Link href="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
                                Create one free →
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Email
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} color={focused === "email" ? "#818cf8" : "#475569"} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused("email")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="you@example.com"
                                    style={{
                                        width: "100%", padding: "13px 16px 13px 44px", borderRadius: "12px",
                                        background: focused === "email" ? "rgba(99,102,241,0.08)" : "rgba(15, 23, 42, 0.8)",
                                        border: `1px solid ${focused === "email" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                                        color: "#f8fafc", fontSize: "0.95rem", outline: "none", transition: "all 0.2s",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16} color={focused === "password" ? "#818cf8" : "#475569"} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused("password")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="••••••••••"
                                    style={{
                                        width: "100%", padding: "13px 16px 13px 44px", borderRadius: "12px",
                                        background: focused === "password" ? "rgba(99,102,241,0.08)" : "rgba(15, 23, 42, 0.8)",
                                        border: `1px solid ${focused === "password" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                                        color: "#f8fafc", fontSize: "0.95rem", outline: "none", transition: "all 0.2s",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: "8px", padding: "14px 20px",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                border: "none", borderRadius: "12px", color: "white",
                                fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.25s", letterSpacing: "-0.01em",
                                boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.35)",
                            }}
                            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.45)"; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.35)"; }}
                        >
                            {loading ? (
                                <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
                            ) : (
                                <>Continue <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        <span style={{ color: "#475569", fontSize: "12px" }}>Secured with JWT</span>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    </div>

                    <p style={{ textAlign: "center", color: "#334155", fontSize: "12px", lineHeight: 1.6 }}>
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input::placeholder { color: #334155; }
            `}</style>
        </div>
    );
}
