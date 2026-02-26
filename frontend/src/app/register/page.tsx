"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/api";
import { Lock, Mail, User, Loader2, ArrowRight, Brain, Sparkles, TrendingUp, MessageSquare, Map, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const perks = [
    "Resume analysis in under 30 seconds",
    "Personalised learning roadmap",
    "Live market data & salaries",
    "AI mock interviews with scoring",
];

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await registerUser(name, email, password);
            localStorage.setItem("token", data.access_token);
            if (data.name) localStorage.setItem("userName", data.name);
            toast.success("Account created! Welcome aboard 🚀");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to create account.");
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
            <div style={{ position: "absolute", top: "-100px", right: "-200px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", bottom: "-100px", left: "-150px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 10s ease-in-out infinite 2s", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", top: "30%", left: "40%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", borderRadius: "50%", animation: "pulse 12s ease-in-out infinite 4s", pointerEvents: "none", zIndex: 0 }} />

            {/* Left Panel — Form */}
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
                borderRight: "1px solid rgba(255,255,255,0.05)",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", alignSelf: "flex-start" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "11px",
                        background: "linear-gradient(135deg, #10b981, #3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(16,185,129,0.35)"
                    }}>
                        <Brain size={20} color="white" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "#f8fafc", fontFamily: "'Space Grotesk', sans-serif" }}>
                        AI Career Mentor
                    </div>
                </div>

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
                            Create your account
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Already have one?{" "}
                            <Link href="/login" style={{ color: "#34d399", fontWeight: 600, textDecoration: "none" }}>
                                Sign in →
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Name */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Full Name
                            </label>
                            <div style={{ position: "relative" }}>
                                <User size={16} color={focused === "name" ? "#34d399" : "#475569"} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => setFocused("name")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="Anil Pradhan"
                                    style={{
                                        width: "100%", padding: "13px 16px 13px 44px", borderRadius: "12px",
                                        background: focused === "name" ? "rgba(16,185,129,0.08)" : "rgba(15, 23, 42, 0.8)",
                                        border: `1px solid ${focused === "name" ? "rgba(16,185,129,0.45)" : "rgba(255,255,255,0.07)"}`,
                                        color: "#f8fafc", fontSize: "0.95rem", outline: "none", transition: "all 0.2s",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Email
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} color={focused === "email" ? "#34d399" : "#475569"} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
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
                                        background: focused === "email" ? "rgba(16,185,129,0.08)" : "rgba(15, 23, 42, 0.8)",
                                        border: `1px solid ${focused === "email" ? "rgba(16,185,129,0.45)" : "rgba(255,255,255,0.07)"}`,
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
                                <Lock size={16} color={focused === "password" ? "#34d399" : "#475569"} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", transition: "color 0.2s" }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused("password")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="Min 6 characters"
                                    minLength={6}
                                    style={{
                                        width: "100%", padding: "13px 16px 13px 44px", borderRadius: "12px",
                                        background: focused === "password" ? "rgba(16,185,129,0.08)" : "rgba(15, 23, 42, 0.8)",
                                        border: `1px solid ${focused === "password" ? "rgba(16,185,129,0.45)" : "rgba(255,255,255,0.07)"}`,
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
                                background: loading ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
                                border: "none", borderRadius: "12px", color: "white",
                                fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.25s", letterSpacing: "-0.01em",
                                boxShadow: loading ? "none" : "0 8px 24px rgba(16,185,129,0.3)",
                            }}
                            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(16,185,129,0.4)"; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(16,185,129,0.3)"; }}
                        >
                            {loading ? (
                                <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</>
                            ) : (
                                <>Get started free <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Panel — Branding */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px",
                position: "relative",
                zIndex: 1,
            }}>
                <div style={{ maxWidth: "460px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "6px 14px", background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.25)", borderRadius: "100px",
                        marginBottom: "24px"
                    }}>
                        <Sparkles size={12} color="#34d399" />
                        <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>100% free during beta</span>
                    </div>

                    <h1 style={{
                        fontSize: "3rem", fontWeight: 900, color: "#f8fafc",
                        lineHeight: 1.1, letterSpacing: "-0.04em",
                        fontFamily: "'Space Grotesk', sans-serif", marginBottom: "20px"
                    }}>
                        Accelerate your<br />
                        <span style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            career growth
                        </span>
                    </h1>

                    <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, marginBottom: "48px" }}>
                        Join thousands of professionals using AI to fast-track their careers. Get personalized guidance from our multi-agent system.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {perks.map((perk, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                                    background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <CheckCircle size={13} color="#34d399" />
                                </div>
                                <span style={{ color: "#cbd5e1", fontSize: "14px" }}>{perk}</span>
                            </div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div style={{
                        marginTop: "56px", padding: "24px", borderRadius: "16px",
                        background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.06)",
                        backdropFilter: "blur(12px)"
                    }}>
                        <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px", fontStyle: "italic" }}>
                            "This tool helped me identify exactly what skills I was missing and land a job at Amazon in just 6 weeks."
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "white", fontWeight: 700, fontSize: "13px" }}>R</span>
                            </div>
                            <div>
                                <div style={{ color: "#f8fafc", fontSize: "13px", fontWeight: 600 }}>Rahul S.</div>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>SDE II @ Amazon</div>
                            </div>
                        </div>
                    </div>
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
